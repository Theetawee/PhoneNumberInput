/**
 * Everything that touches libphonenumber lives here. To swap the library
 * (e.g. for libphonenumber-js) this is the only file that has to change.
 */
import { AsYouTypeFormatter, PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import { COUNTRY_BY_CODE } from "./countries";
import type { PhoneStatus, PhoneValue } from "./types";

const phoneUtil = PhoneNumberUtil.getInstance();

export interface ParsedInput {
    value: PhoneValue;
    /** Formatted national number to show in the input */
    display: string;
}

/** Formats digits the way Google's dialer does while typing. */
export function formatAsYouType(country: string, digits: string): string {
    const formatter = new AsYouTypeFormatter(country);
    let out = "";
    for (const ch of digits) out = formatter.inputDigit(ch);
    return out;
}

/**
 * Live validation. "incomplete" means the user could still be typing;
 * "invalid" means no further digits can rescue the number.
 */
function getStatus(
    digits: string,
    country: string,
    parsed: ReturnType<typeof phoneUtil.parse>,
): PhoneStatus {
    if (phoneUtil.isValidNumberForRegion(parsed, country)) return "valid";

    const R = PhoneNumberUtil.ValidationResult;
    const reason = phoneUtil.isPossibleNumberWithReason(parsed);
    if (reason === R.TOO_SHORT) return "incomplete";
    if (reason === R.TOO_LONG || reason === R.INVALID_COUNTRY_CODE) return "invalid";

    // Length is plausible but the number isn't valid. If one more digit would
    // already be too long, the user has typed as much as this country allows.
    try {
        const longer = phoneUtil.parse(digits + "0", country);
        return phoneUtil.isPossibleNumberWithReason(longer) === R.TOO_LONG
            ? "invalid"
            : "incomplete";
    } catch {
        return "invalid";
    }
}

/** Turns whatever the user typed for a country into the value we hand to onChange. */
export function buildValue(country: string, rawInput: string): ParsedInput {
    const dialCode = COUNTRY_BY_CODE.get(country)?.dialCode ?? "";
    const digits = rawInput.replace(/\D/g, "");

    if (!digits) {
        return {
            display: "",
            value: {
                country,
                dialCode,
                number: "",
                nationalNumber: "",
                isValid: false,
                status: "empty",
            },
        };
    }

    try {
        const parsed = phoneUtil.parse(digits, country);
        const e164 = phoneUtil.format(parsed, PhoneNumberFormat.E164);
        // Derive from E.164 so leading zeros (e.g. Italy) are kept correctly
        const national = e164.slice(1 + dialCode.length);
        const status = getStatus(digits, country, parsed);
        return {
            display: formatAsYouType(country, digits),
            value: {
                country,
                dialCode,
                number: e164,
                nationalNumber: national,
                isValid: status === "valid",
                status,
            },
        };
    } catch {
        // libphonenumber refuses to parse 1 digit, so this is just "still typing"
        return {
            display: formatAsYouType(country, digits),
            value: {
                country,
                dialCode,
                number: `+${dialCode}${digits}`,
                nationalNumber: digits,
                isValid: false,
                status: "incomplete",
            },
        };
    }
}

/** Parse an E.164 string into { country, national digits }. */
export function parseE164(e164: string): { country: string; national: string } | null {
    try {
        const parsed = phoneUtil.parse(e164);
        const country = phoneUtil.getRegionCodeForNumber(parsed);
        if (!country || !COUNTRY_BY_CODE.has(country)) return null;
        const national = phoneUtil
            .format(parsed, PhoneNumberFormat.E164)
            .slice(1 + String(parsed.getCountryCode()).length);
        return { country, national };
    } catch {
        return null;
    }
}
