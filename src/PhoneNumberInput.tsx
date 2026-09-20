import { useId, useMemo, useRef, useState } from "react";
import CountryButton from "./CountryButton";
import CountryPickerModal from "./CountryPickerModal";
import StatusIcon from "./StatusIcon";
import { StylesContext } from "./StylesContext";
import ValidationMessage from "./ValidationMessage";
import { COUNTRY_BY_CODE, defaultRenderFlag, groupCountries } from "./countries";
import { createStyles, cx } from "./styles";
import type { PhoneNumberInputProps, PhoneStatus, SlotState } from "./types";
import { usePhoneInput } from "./usePhoneInput";
import { getValidationUi } from "./validation";

import { initFlagPolyfill } from "./flags";

initFlagPolyfill();

const PhoneNumberInput = ({
    value,
    defaultValue,
    defaultCountry = "US",
    onChange,
    onBlur,
    countries,
    preferredCountries,
    renderFlag = defaultRenderFlag,
    modalTitle = "Select country",
    searchPlaceholder = "Search country or code",
    showValidation = true,
    showIncompleteWhileTyping = true,
    messages,
    name,
    id,
    placeholder,
    disabled,
    required,
    autoFocus,
    className,
    classNames,
    unstyled,
    "aria-label": ariaLabel = "Phone number",
    "aria-invalid": ariaInvalid,
}: PhoneNumberInputProps) => {
    const uid = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [pickerOpen, setPickerOpen] = useState(false);

    const phone = usePhoneInput({ value, defaultValue, defaultCountry, onChange, onBlur });
    const groups = useMemo(
        () => groupCountries(countries, preferredCountries),
        [countries, preferredCountries],
    );

    const { message, hasError } = getValidationUi({
        status: phone.status,
        touched: phone.touched,
        required,
        showValidation,
        showIncompleteWhileTyping,
        messages,
    });
    const messageId = `${uid}-message`;

    // Everything a class function can react to. "empty" when validation is hidden
    // so the border/icon/message never show a status the user turned off.
    const state: SlotState = {
        status: (showValidation ? phone.status : "empty") as PhoneStatus,
        hasError,
        disabled: !!disabled,
        open: pickerOpen,
    };
    const cn = createStyles(classNames, unstyled, state);

    return (
        <StylesContext.Provider value={cn}>
            <div data-slot="wrapper" className={cx(cn("wrapper"), className)}>
                <div
                    data-slot="root"
                    data-status={state.status}
                    data-disabled={disabled ? "true" : undefined}
                    className={cn("root")}>
                    <CountryButton
                        country={COUNTRY_BY_CODE.get(phone.country)}
                        renderFlag={renderFlag}
                        onClick={() => setPickerOpen(true)}
                        disabled={disabled}
                    />

                    <input
                        ref={inputRef}
                        id={id}
                        name={name}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        data-slot="input"
                        className={cn("input")}
                        value={phone.display}
                        onChange={phone.handleInput}
                        onBlur={phone.handleBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        autoFocus={autoFocus}
                        aria-label={ariaLabel}
                        aria-invalid={ariaInvalid ?? (hasError || undefined)}
                        aria-describedby={message ? messageId : undefined}
                    />

                    {showValidation && <StatusIcon status={phone.status} />}
                </div>

                {showValidation && <ValidationMessage id={messageId} text={message} />}

                <CountryPickerModal
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    groups={groups}
                    selectedCode={phone.country}
                    onSelect={(c) => {
                        phone.selectCountry(c.code);
                        inputRef.current?.focus();
                    }}
                    renderFlag={renderFlag}
                    title={modalTitle}
                    searchPlaceholder={searchPlaceholder}
                />
            </div>
        </StylesContext.Provider>
    );
};

export default PhoneNumberInput;
