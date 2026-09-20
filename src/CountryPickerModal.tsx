import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import CountryList from "./CountryList";
import CountrySearch from "./CountrySearch";
import { searchCountries, type CountryGroups } from "./countries";
import { CloseIcon } from "./Icons";
import { useStyles } from "./StylesContext";
import type { Country } from "./types";

export interface CountryPickerModalProps {
    open: boolean;
    /** Fired when the dialog closes: Esc, backdrop click, close button, or a selection */
    onClose: () => void;
    groups: CountryGroups;
    selectedCode: string;
    onSelect: (country: Country) => void;
    renderFlag: (code: string) => ReactNode;
    title: string;
    searchPlaceholder: string;
}

/**
 * Searchable country picker built on the native <dialog> element, which gives
 * us focus trapping, Esc to close, and a backdrop for free.
 */
const CountryPickerModal = ({
    open,
    onClose,
    groups,
    selectedCode,
    onSelect,
    renderFlag,
    title,
    searchPlaceholder,
}: CountryPickerModalProps) => {
    const cn = useStyles();
    const uid = useId();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);

    const baseList = useMemo(() => [...groups.preferred, ...groups.rest], [groups]);
    const items = useMemo(() => searchCountries(baseList, query), [baseList, query]);

    // Reset the search and start on the current country each time it opens
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setQuery("");
            setActive(
                Math.max(
                    0,
                    baseList.findIndex((c) => c.code === selectedCode),
                ),
            );
        }
    }

    useEffect(() => {
        if (!open) return;
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
        searchRef.current?.focus();

        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    const close = () => dialogRef.current?.close();

    const pick = (country: Country) => {
        close(); // close first so the parent can move focus afterwards
        onSelect(country);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(items.length - 1, a + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
        } else if (e.key === "Enter") {
            e.preventDefault(); // don't submit a surrounding <form>
            if (items[active]) pick(items[active]);
        }
    };

    const listId = `${uid}-list`;

    return (
        <dialog
            ref={dialogRef}
            data-slot="modal"
            className={cn("modal")}
            onClose={onClose}
            onClick={(e) => {
                // A click on the backdrop targets the <dialog> itself
                if (e.target === dialogRef.current) close();
            }}
            aria-label={title}>
            {open && (
                <>
                    <div className={cn("modalHeader")}>
                        <h2 className={cn("modalTitle")}>{title}</h2>
                        <button
                            type="button"
                            onClick={close}
                            className={cn("modalClose")}
                            aria-label="Close">
                            <CloseIcon className={cn("modalCloseIcon")} />
                        </button>
                    </div>

                    <div className={cn("searchWrapper")}>
                        <CountrySearch
                            ref={searchRef}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setActive(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={searchPlaceholder}
                            listId={listId}
                            activeId={items[active] ? `${uid}-${items[active].code}` : undefined}
                        />
                    </div>

                    <CountryList
                        id={listId}
                        idPrefix={uid}
                        items={items}
                        activeIndex={active}
                        selectedCode={selectedCode}
                        showGroups={!query && groups.preferred.length > 0}
                        popularCount={groups.preferred.length}
                        renderFlag={renderFlag}
                        onSelect={pick}
                        onHover={setActive}
                    />
                </>
            )}
        </dialog>
    );
};

export default CountryPickerModal;
