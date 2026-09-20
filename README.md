# Waanverse-PhoneNumberInput

A phone number input for React with a searchable country picker and live validation, built on Google's [libphonenumber](https://github.com/google/libphonenumber).

- Country picker opens in a modal with search (by name, ISO code, or dial code)
- Formats the number as the user types
- Validates on every keystroke and tells "still typing" apart from "wrong"
- Returns the country (`UG`), the full number in E.164 (`+256772123456`), and the national number (`772123456`)
- Every part is styleable through `classNames`, or fully unstyled
- Accessible: built on the native `<dialog>`, full keyboard support

```tsx
<PhoneNumberInput
    defaultCountry="UG"
    onChange={(v) => console.log(v.country, v.number, v.nationalNumber, v.isValid)}
/>
```

## Contents

- [Waanverse-PhoneNumberInput](#waanverse-phonenumberinput)
  - [Contents](#contents)
  - [Install](#install)
  - [Quick start](#quick-start)
    - [Styling](#styling)
  - [The value you get back](#the-value-you-get-back)
  - [Validation](#validation)
    - [Messages](#messages)
    - [Turning parts off](#turning-parts-off)
  - [Controlled and uncontrolled use](#controlled-and-uncontrolled-use)
  - [Countries and flags](#countries-and-flags)
    - [Flags](#flags)
  - [Styling](#styling-1)
    - [1. Add classes with `className` and `classNames`](#1-add-classes-with-classname-and-classnames)
    - [2. Make classes depend on state](#2-make-classes-depend-on-state)
    - [3. Replace the defaults with `unstyled`](#3-replace-the-defaults-with-unstyled)
    - [Slots](#slots)
    - [Styling without Tailwind](#styling-without-tailwind)
  - [Using it in forms](#using-it-in-forms)
    - [With React Hook Form](#with-react-hook-form)
    - [With a plain HTML form](#with-a-plain-html-form)
  - [Props](#props)
    - [Exported types](#exported-types)
  - [Accessibility](#accessibility)
  - [Notes and requirements](#notes-and-requirements)
  - [License](#license)

## Install

```bash
npm install waanverse-phonenumber-input
```

Requires React 19 or newer.

## Quick start

```tsx
import { useState } from "react";
import { PhoneNumberInput, type PhoneValue } from "waanverse-phonenumber-input";

export default function Example() {
    const [phone, setPhone] = useState<PhoneValue | null>(null);

    return (
        <>
            <PhoneNumberInput
                defaultCountry="UG"
                preferredCountries={["UG", "KE", "TZ", "RW"]}
                onChange={setPhone}
            />
            <button disabled={!phone?.isValid}>Continue</button>
        </>
    );
}
```

### Styling
Include the styling file from `waanverse-phonenumber-input/dist/styles.css` in your CSS bundle as an import or in tailwind config.

```css
@import "tailwindcss";
@source '../node_modules/waanverse-phonenumber-input/dist/styles.css';
```

## The value you get back

`onChange` runs on every change (typing, pasting, or switching country) with this object:

```ts
interface PhoneValue {
    country: string; // "UG"
    dialCode: string; // "256" (no plus)
    number: string; // "+256772123456": full number, E.164. "" when empty
    nationalNumber: string; // "772123456": without the country code. "" when empty
    isValid: boolean; // valid for the selected country
    status: "empty" | "incomplete" | "valid" | "invalid";
}
```

Notes:

- `number` is in E.164, the format most backends and SMS providers expect.
- Partial input is reported too, so `number` can hold half a number while the user is typing. Only trust it when `isValid` is `true`.
- Leading zeros are handled per country: the Ugandan `0772 123456` gives `nationalNumber: "772123456"`, while Italian numbers keep their zero (`+390612345678`).
- Pasting a full international number such as `+256 772 123456` switches the country automatically.

## Validation

Validation runs on every keystroke and shows up in three places: the border colour, an icon inside the field, and a message under it.

| Status       | Meaning                                                            | What the user sees                                                           |
| ------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `empty`      | Nothing typed                                                      | Nothing                                                                      |
| `incomplete` | Could still become valid                                           | A neutral hint while typing; turns into an error after the field loses focus |
| `valid`      | Valid for the selected country                                     | Green border and a check mark                                                |
| `invalid`    | Cannot become valid: too long, or a prefix the country doesn't use | Red border, a cross, and an error message straight away                      |

The check for "could still become valid" is a heuristic. If the number isn't valid yet and adding one more digit would already make it too long for that country, the user has typed as much as the country allows, so it's reported `invalid` instead of `incomplete`.

### Messages

```tsx
<PhoneNumberInput
    required
    messages={{
        invalid: "That number doesn’t look right",
        incomplete: "Keep typing…",
        required: "We need your phone number",
        valid: "Looks good", // empty by default
    }}
/>
```

Defaults are `Invalid phone number`, `Phone number is incomplete`, `Phone number is required` and no message for `valid`. The "required" message only appears after the user has left an empty field.

### Turning parts off

```tsx
<PhoneNumberInput showValidation={false} />            // no colours, icon or message
<PhoneNumberInput showIncompleteWhileTyping={false} /> // wait for blur before showing "incomplete"
```

With `showValidation={false}` you can still use `status` and `isValid` from `onChange` to build your own UI.

> **Validate on the server too.** The frontend check is a convenience and can be bypassed. Since `number` is E.164, you can pass it straight to a server-side libphonenumber port, for example Python's [`phonenumbers`](https://pypi.org/project/phonenumbers/):
>
> ```python
> import phonenumbers
>
> def is_valid_phone(e164: str) -> bool:
>     try:
>         return phonenumbers.is_valid_number(phonenumbers.parse(e164, None))
>     except phonenumbers.NumberParseException:
>         return False
> ```
>
> The two libraries share the same metadata but release separately, so a very new number range may be recognised by one before the other.

## Controlled and uncontrolled use

**Uncontrolled** (default). The component keeps its own state; `defaultValue` sets the starting number:

```tsx
<PhoneNumberInput defaultValue="+256772123456" onChange={...} />
```

**Controlled**. Pass `value` as an E.164 string and store `number` from `onChange`:

```tsx
const [phone, setPhone] = useState('+256772123456')

<PhoneNumberInput value={phone} onChange={(v) => setPhone(v.number)} />
```

When `value` changes from outside, the country and the formatted text update to match. Set it to `''` to clear the field.

## Countries and flags

The country list comes from libphonenumber's metadata (245 regions), mapped as ISO code → name and dial code.

```tsx
// Pin some countries to the top under a "Popular" heading
<PhoneNumberInput preferredCountries={['UG', 'KE', 'TZ', 'RW']} />

// Only allow these countries
<PhoneNumberInput countries={['UG', 'KE', 'TZ', 'RW', 'BI', 'SS']} />
```

When the user searches, the "Popular" grouping is replaced by one ranked list: an exact ISO match first, then names starting with the query, then everything else. Search ignores accents (`cote` finds Côte d'Ivoire) and matches dial codes with or without the plus (`256` or `+256`).

### Flags

Flags are emoji by default displayed by the css file imported. or you can set custom ones with `renderFlag`.
```tsx
<PhoneNumberInput
    renderFlag={(code) => (
        <img src={`/flags/${code.toLowerCase()}.svg`} alt="" className="h-4 w-6" />
    )}
/>
```

`renderFlag` receives the ISO code and is used in both the button and the list.

## Styling

There are three levels, from least to most control.

### 1. Add classes with `className` and `classNames`

`className` goes on the outermost element. `classNames` targets any part; values are appended after the defaults.

```tsx
<PhoneNumberInput
    className="w-full max-w-sm"
    classNames={{
        root: "shadow-sm",
        button: "bg-neutral-50",
        message: "text-xs",
        modal: "max-w-md",
    }}
/>
```

### 2. Make classes depend on state

Any slot can be a function of the current state:

```tsx
<PhoneNumberInput
    classNames={{
        root: (s) => (s.disabled ? "opacity-40" : ""),
        option: (s) => (s.active ? "bg-indigo-50" : ""),
        message: (s) => (s.hasError ? "text-rose-600" : "text-neutral-400"),
    }}
/>
```

The state object:

| Field      | Type                                              | Meaning                                                                    |
| ---------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| `status`   | `'empty' \| 'incomplete' \| 'valid' \| 'invalid'` | Live validation status (always `'empty'` when `showValidation` is `false`) |
| `hasError` | `boolean`                                         | An error is currently being shown                                          |
| `disabled` | `boolean`                                         | The input is disabled                                                      |
| `open`     | `boolean`                                         | The country modal is open                                                  |
| `active`   | `boolean \| undefined`                            | `option` only: highlighted by hover or keyboard                            |
| `selected` | `boolean \| undefined`                            | `option` only: this is the current country                                 |

### 3. Replace the defaults with `unstyled`

Default classes are added first and yours after. If one of your classes conflicts with a default, such as `rounded-none` against the default `rounded-lg`, Tailwind's own CSS ordering decides which wins, not the order in the string. To avoid that, remove the defaults for the slots you want to restyle:

```tsx
// Only these slots lose their defaults
<PhoneNumberInput
  unstyled={['root', 'button']}
  classNames={{
    root: 'flex h-14 items-center rounded-none border-2 border-black',
    button: 'px-3',
  }}
/>

// Every slot loses its defaults
<PhoneNumberInput unstyled classNames={{ /* ... */ }} />
```

Tailwind's important modifier (`!rounded-none`) also works as a quick fix for a single class.

### Slots

| Slot             | Element                                                |
| ---------------- | ------------------------------------------------------ |
| `wrapper`        | Outermost element (field + message)                    |
| `root`           | Bordered box holding the button, input and status icon |
| `button`         | Country button that opens the picker                   |
| `buttonFlag`     | Flag inside the button                                 |
| `buttonDialCode` | `+256` inside the button                               |
| `buttonIcon`     | Chevron inside the button                              |
| `input`          | The phone number `<input>`                             |
| `statusIcon`     | Check or cross inside the field                        |
| `message`        | Validation text under the field                        |
| `modal`          | The `<dialog>`                                         |
| `modalHeader`    | Row holding the title and close button                 |
| `modalTitle`     | Modal heading                                          |
| `modalClose`     | Close button                                           |
| `modalCloseIcon` | Icon inside the close button                           |
| `searchWrapper`  | Container around the search box                        |
| `search`         | Search `<input>`                                       |
| `list`           | The scrollable `<ul>` of countries                     |
| `groupHeading`   | "Popular" and "All countries" headings                 |
| `option`         | One country row                                        |
| `optionFlag`     | Flag inside a row                                      |
| `optionName`     | Country name inside a row                              |
| `optionDialCode` | Dial code inside a row                                 |
| `emptyState`     | "No countries found"                                   |

### Styling without Tailwind

Use `unstyled` and bring your own CSS, either through `classNames` (CSS modules, any class-based system) or through the data attributes the component sets:

| Attribute       | On                                                                                   | Values                                    |
| --------------- | ------------------------------------------------------------------------------------ | ----------------------------------------- |
| `data-slot`     | `wrapper`, `root`, `button`, `input`, `message`, `modal`, `search`, `list`, `option` | the slot name                             |
| `data-status`   | `root`                                                                               | `empty`, `incomplete`, `valid`, `invalid` |
| `data-disabled` | `root`                                                                               | `"true"` when disabled                    |
| `data-active`   | `option`                                                                             | `"true"` / `"false"`                      |
| `data-selected` | `option`                                                                             | `"true"` / `"false"`                      |

```tsx
<PhoneNumberInput unstyled />
```

```css
[data-slot="root"] {
    display: flex;
    align-items: center;
    border: 1px solid #c9c9c9;
    border-radius: 8px;
}
[data-slot="root"][data-status="valid"] {
    border-color: #16a34a;
}
[data-slot="root"][data-status="invalid"] {
    border-color: #ef4444;
}

[data-slot="input"] {
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
}

dialog[data-slot="modal"]::backdrop {
    background: rgb(0 0 0 / 0.5);
}
[data-slot="list"] {
    overflow-y: auto;
    max-height: 20rem;
}
[data-slot="option"][data-active="true"] {
    background: #f0f0f0;
}
[data-slot="option"][data-selected="true"] {
    font-weight: 600;
}
```

In unstyled mode the modal and list keep the browser's default look until you style them. The list needs a height limit and `overflow-y: auto` to scroll. Icons default to `1em`.

## Using it in forms

### With React Hook Form

```tsx
import { Controller, useForm } from "react-hook-form";
import PhoneNumberInput, { type PhoneValue } from "your-package-name";

type FormValues = { phone: PhoneValue | undefined };

function SignupForm() {
    const { control, handleSubmit } = useForm<FormValues>();

    return (
        <form onSubmit={handleSubmit((data) => console.log(data.phone?.number))}>
            <Controller
                name="phone"
                control={control}
                rules={{ validate: (v) => v?.isValid || "Enter a valid phone number" }}
                render={({ field }) => (
                    <PhoneNumberInput
                        defaultCountry="UG"
                        value={field.value?.number ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                    />
                )}
            />
            <button type="submit">Sign up</button>
        </form>
    );
}
```

### With a plain HTML form

The visible input holds the _formatted national number_ (for example `0772 123456`), without the country code. That is not something you want to post. Keep the E.164 value in state and submit it through a hidden input:

```tsx
const [phone, setPhone] = useState<PhoneValue | null>(null)

<form action="/signup" method="post">
  <PhoneNumberInput onChange={setPhone} />
  <input type="hidden" name="phone" value={phone?.number ?? ''} />
</form>
```

Pressing Enter in the country search never submits a surrounding form.

## Props

| Prop                                     | Type                                                     | Default                    | Description                                                                |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `value`                                  | `string`                                                 |                            | Controlled value, E.164 (`+256772123456`)                                  |
| `defaultValue`                           | `string`                                                 |                            | Initial value when uncontrolled, E.164                                     |
| `defaultCountry`                         | `string`                                                 | `"US"`                     | ISO code used when there is no value                                       |
| `onChange`                               | `(value: PhoneValue) => void`                            |                            | Called on every change                                                     |
| `onBlur`                                 | `FocusEventHandler<HTMLInputElement>`                    |                            | Blur handler for the number input                                          |
| `countries`                              | `string[]`                                               | all                        | Restrict the list to these ISO codes                                       |
| `preferredCountries`                     | `string[]`                                               |                            | Pinned to the top under "Popular"                                          |
| `renderFlag`                             | `(code: string) => ReactNode`                            | emoji flag                 | Custom flag renderer                                                       |
| `modalTitle`                             | `string`                                                 | `"Select country"`         | Heading of the country modal                                               |
| `searchPlaceholder`                      | `string`                                                 | `"Search country or code"` | Placeholder of the search box                                              |
| `showValidation`                         | `boolean`                                                | `true`                     | Show the border colour, icon and message                                   |
| `showIncompleteWhileTyping`              | `boolean`                                                | `true`                     | Show the "incomplete" hint before blur                                     |
| `messages`                               | `{ invalid?, incomplete?, required?, valid? }`           | see [Messages](#messages)  | Validation text                                                            |
| `className`                              | `string`                                                 |                            | Classes for the outermost element                                          |
| `classNames`                             | `Partial<Record<SlotName, string \| (state) => string>>` |                            | Classes per slot, see [Slots](#slots)                                      |
| `unstyled`                               | `boolean \| SlotName[]`                                  | `false`                    | Remove default classes everywhere, or for listed slots                     |
| `name`, `id`, `placeholder`, `autoFocus` |                                                          |                            | Passed to the number input                                                 |
| `disabled`, `required`                   | `boolean`                                                |                            | Passed to the number input (`required` also drives the "required" message) |
| `aria-label`                             | `string`                                                 | `"Phone number"`           | Accessible label of the number input                                       |
| `aria-invalid`                           | `boolean`                                                |                            | Overrides the automatic value                                              |

### Exported types

```ts
import type {
    PhoneNumberInputProps,
    PhoneValue,
    PhoneStatus,
    ValidationMessages,
    Country,
    ClassNames,
    ClassValue,
    SlotName,
    SlotState,
} from "waanverse-phone-number-input";
```

## Accessibility

- The country picker is a native `<dialog>` opened with `showModal()`, so focus is trapped inside it, Esc closes it, and focus returns afterwards.
- The search box is focused when the picker opens and works as a combobox over the country list, with `aria-activedescendant` tracking the highlighted row.
- Keyboard: `↑` / `↓` move through the list, `Enter` selects the highlighted country, `Esc` closes. Clicking the backdrop also closes.
- After choosing a country, focus moves to the number field and the number already typed is kept and re-formatted for the new country.
- The validation message is a polite live region. The number input gets `aria-invalid` and `aria-describedby` while an error is shown.
- The country button has a full label, for example "Country: Uganda, +256. Change country".
- Page scroll is locked while the modal is open.

## Notes and requirements

- **Browsers.** Anything with `<dialog>.showModal()`: current Chrome, Edge, Firefox, and Safari 15.4 or newer.
- **Next.js (App Router).** The component uses state and effects, so render it from a Client Component (`'use client'`).
- **Bundle size.** `google-libphonenumber` is the largest part of the package (roughly 550 KB before gzip). All libphonenumber calls live in one file, so swapping in a lighter port such as `libphonenumber-js` only touches that file.
- **What counts as valid.** Validity comes from libphonenumber's metadata for the selected country. It says the number fits the country's numbering plan, not that someone owns it. To confirm ownership, send a verification code.
- **Emoji flags.** See [Flags](#flags).

## License

MIT License, see [LICENSE](./LICENSE)
