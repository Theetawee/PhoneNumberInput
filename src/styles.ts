import type { ClassNames, ClassValue, PhoneStatus, SlotName, SlotState } from "./types";

/** Joins class names, skipping empty values. */
export const cx = (...parts: Array<string | false | null | undefined>) =>
    parts.filter(Boolean).join(" ");

const BORDER: Record<PhoneStatus, string> = {
    empty: "border-neutral-300 focus-within:border-blue-600 focus-within:ring-blue-600/30",
    incomplete: "border-neutral-300 focus-within:border-blue-600 focus-within:ring-blue-600/30",
    valid: "border-green-600 focus-within:border-green-600 focus-within:ring-green-600/30",
    invalid: "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/30",
};

/** Default look. Every slot can be extended or replaced via the `classNames` prop. */
export const defaultClassNames: Record<SlotName, ClassValue> = {
    wrapper: "",
    root: (s) =>
        cx(
            "flex h-11 items-center rounded-lg border bg-white text-neutral-900 focus-within:ring-2",
            "data-[disabled=true]:opacity-60",
            BORDER[s.hasError ? "invalid" : s.status],
        ),

    button:
        "flex h-full shrink-0 items-center gap-1.5 rounded-l-lg border-r border-neutral-200 pl-3 pr-2 " +
        "outline-none hover:bg-neutral-50 focus-visible:bg-neutral-100 disabled:cursor-not-allowed",
    buttonFlag: "",
    buttonDialCode: "text-neutral-600",
    buttonIcon: "h-4 w-4 text-neutral-400",

    input:
        "h-full min-w-0 flex-1 rounded-r-lg bg-transparent px-3 outline-none " +
        "placeholder:text-neutral-400 disabled:cursor-not-allowed",
    statusIcon: (s) =>
        cx("mr-3 h-5 w-5 shrink-0", s.status === "valid" ? "text-green-600" : "text-red-500"),
    message: (s) =>
        cx(
            "mt-1 min-h-[1.25rem] text-sm",
            s.status === "valid"
                ? "text-green-600"
                : s.hasError
                  ? "text-red-600"
                  : "text-neutral-500",
        ),

    modal:
        "m-auto h-[32rem] max-h-[80dvh] w-[calc(100%-2rem)] max-w-sm flex-col overflow-hidden rounded-xl " +
        "bg-white p-0 text-neutral-900 shadow-xl backdrop:bg-black/50 open:flex",
    modalHeader: "flex items-center justify-between px-4 pb-2 pt-4",
    modalTitle: "text-base font-semibold",
    modalClose: "rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
    modalCloseIcon: "h-5 w-5",
    searchWrapper: "px-4 pb-3",
    search:
        "h-10 w-full rounded-lg border border-neutral-300 px-3 outline-none placeholder:text-neutral-400 " +
        "focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30",
    list: "min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-neutral-200 pb-2",
    groupHeading: "px-4 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-neutral-500",
    option: (s) =>
        cx(
            "flex cursor-pointer items-center gap-3 px-4 py-2.5",
            s.active && "bg-neutral-100",
            s.selected && "font-medium",
        ),
    optionFlag: "w-6 text-center",
    optionName: "min-w-0 flex-1 truncate",
    optionDialCode: "text-sm text-neutral-500",
    emptyState: "px-4 py-8 text-center text-sm text-neutral-500",
};

/**
 * Returns a `cn(slot, extraState?)` function that produces the final class
 * string for a slot: the default classes followed by the user's classes.
 *
 * `unstyled` drops the defaults, either for every slot (`true`) or only for
 * the listed slots (`['root', 'button']`).
 */
export function createStyles(
    classNames: ClassNames | undefined,
    unstyled: boolean | SlotName[] | undefined,
    base: SlotState,
) {
    return (slot: SlotName, extra?: Partial<SlotState>) => {
        const state = extra ? { ...base, ...extra } : base;
        const run = (v?: ClassValue) => (typeof v === "function" ? v(state) : v);
        const stripDefaults =
            unstyled === true || (Array.isArray(unstyled) && unstyled.includes(slot));
        return cx(
            stripDefaults ? undefined : run(defaultClassNames[slot]),
            run(classNames?.[slot]),
        );
    };
}

export type StyleFn = ReturnType<typeof createStyles>;
