import { forwardRef } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useStyles } from './StylesContext'

interface Props {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  placeholder: string
  /** id of the listbox this input controls */
  listId: string
  /** id of the highlighted option, for screen readers */
  activeId?: string
}

const CountrySearch = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, onKeyDown, placeholder, listId, activeId }, ref) => {
    const cn = useStyles()
    return (
      <input
        ref={ref}
        type="search"
        role="combobox"
        data-slot="search"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className={cn('search')}
      />
    )
  },
)
CountrySearch.displayName = 'CountrySearch'

export default CountrySearch
