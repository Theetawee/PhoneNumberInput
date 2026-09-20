import type { PhoneStatus, ValidationMessages } from "./types";

export const DEFAULT_MESSAGES: Required<ValidationMessages> = {
    invalid: "Invalid phone number",
    incomplete: "Phone number is incomplete",
    required: "Phone number is required",
    valid: "",
};

interface Args {
    status: PhoneStatus;
    /** Has the user left the field at least once? */
    touched: boolean;
    required?: boolean;
    showValidation: boolean;
    showIncompleteWhileTyping: boolean;
    messages?: ValidationMessages;
}

/**
 * Decides what the user sees. Runs on every keystroke. Valid and invalid show
 * immediately. "Incomplete" shows as a neutral hint while typing (and turns
 * into an error after blur); "required" waits for blur.
 */
export function getValidationUi({
    status,
    touched,
    required,
    showValidation,
    showIncompleteWhileTyping,
    messages,
}: Args) {
    const text = { ...DEFAULT_MESSAGES, ...messages };

    const message = !showValidation
        ? ""
        : status === "invalid"
          ? text.invalid
          : status === "valid"
            ? text.valid
            : status === "incomplete" && (touched || showIncompleteWhileTyping)
              ? text.incomplete
              : status === "empty" && touched && required
                ? text.required
                : "";

    const hasError =
        showValidation &&
        (status === "invalid" ||
            (touched && (status === "incomplete" || (status === "empty" && !!required))));

    return { message, hasError };
}
