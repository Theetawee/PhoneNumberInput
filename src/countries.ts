import type { ReactNode } from "react";
import countriesJson from "./countries.json";
import type { Country } from "./types";

export const ALL_COUNTRIES: Country[] = Object.entries(
    countriesJson as Record<string, { name: string; dialCode: string }>,
).map(([code, c]) => ({ code, name: c.name, dialCode: c.dialCode }));

export const COUNTRY_BY_CODE = new Map(ALL_COUNTRIES.map((c) => [c.code, c]));

export const flagEmoji = (code: string) =>
    code.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));

export const defaultRenderFlag = (code: string): ReactNode => flagEmoji(code);

/** Lowercase and strip accents so "cote" finds "Côte d'Ivoire" */
export const normalize = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

export interface CountryGroups {
    /** Pinned to the top of the picker */
    preferred: Country[];
    rest: Country[];
}

/** Applies the `countries` allow-list and pulls out the `preferredCountries`. */
export function groupCountries(codes?: string[], preferredCodes?: string[]): CountryGroups {
    const pool = codes
        ? codes.map((c) => COUNTRY_BY_CODE.get(c)).filter((c): c is Country => !!c)
        : ALL_COUNTRIES;

    if (!preferredCodes?.length) return { preferred: [], rest: pool };

    const pinned = new Set(preferredCodes);
    return {
        preferred: preferredCodes
            .map((c) => pool.find((p) => p.code === c))
            .filter((c): c is Country => !!c),
        rest: pool.filter((c) => !pinned.has(c.code)),
    };
}

/** Matches name, ISO code, or dial code ("ug", "uganda", "256", "+256"). */
export function searchCountries(list: Country[], query: string): Country[] {
    const q = normalize(query.trim());
    if (!q) return list;

    const digits = q.replace(/^\+/, "");
    const isDigits = /^\d+$/.test(digits);
    // Exact code first, then names starting with the query, then the rest
    const rank = (c: Country) =>
        c.code.toLowerCase() === q ? 0 : normalize(c.name).startsWith(q) ? 1 : 2;

    return list
        .filter(
            (c) =>
                normalize(c.name).includes(q) ||
                c.code.toLowerCase().startsWith(q) ||
                (isDigits && c.dialCode.startsWith(digits)),
        )
        .sort((a, b) => rank(a) - rank(b));
}
