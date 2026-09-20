import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { buildValue, parseE164 } from "./phone";
import type { ParsedInput } from "./phone";
import type { PhoneStatus, PhoneValue } from "./types";

interface Options {
    value?: string;
    defaultValue?: string;
    defaultCountry: string;
    onChange?: (value: PhoneValue) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

/** All the state and behaviour of the phone field, with no markup. */
export function usePhoneInput({ value, defaultValue, defaultCountry, onChange, onBlur }: Options) {
    const initial = useMemo(() => {
        const fromValue = parseE164(value ?? defaultValue ?? "");
        const country = fromValue?.country ?? defaultCountry;
        return { country, ...buildValue(country, fromValue?.national ?? "") };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [country, setCountry] = useState(initial.country);
    const [display, setDisplay] = useState(initial.display);
    const [status, setStatus] = useState<PhoneStatus>(initial.value.status);
    const [touched, setTouched] = useState(false);
    const lastEmitted = useRef(initial.value.number);

    const emit = useCallback(
        (parsed: ParsedInput) => {
            lastEmitted.current = parsed.value.number;
            setDisplay(parsed.display);
            setStatus(parsed.value.status);
            onChange?.(parsed.value);
        },
        [onChange],
    );

    // Controlled mode: sync when the parent changes `value` from outside
    useEffect(() => {
        if (value === undefined || value === lastEmitted.current) return;
        const parsed = parseE164(value);
        if (parsed) {
            const next = buildValue(parsed.country, parsed.national);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCountry(parsed.country);
            setDisplay(next.display);
            setStatus(next.value.status);
        } else if (value === "") {
            setDisplay("");
            setStatus("empty");
        }
        lastEmitted.current = value;
    }, [value]);

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;

        // Pasted "+256 712 345678": switch country automatically
        if (raw.trim().startsWith("+")) {
            const parsed = parseE164(raw.replace(/[^\d+]/g, ""));
            if (parsed) {
                setCountry(parsed.country);
                emit(buildValue(parsed.country, parsed.national));
                return;
            }
        }
        emit(buildValue(country, raw));
    };

    /** Switch country, keeping whatever number is already typed. */
    const selectCountry = (code: string) => {
        setCountry(code);
        emit(buildValue(code, display));
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        setTouched(true);
        onBlur?.(e);
    };

    return { country, display, status, touched, handleInput, selectCountry, handleBlur };
}
