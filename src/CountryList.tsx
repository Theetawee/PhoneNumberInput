import { Fragment, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useStyles } from './StylesContext'
import type { Country } from './types'

interface Props {
  id: string
  /** Prefix for option ids: `${idPrefix}-${countryCode}` */
  idPrefix: string
  items: Country[]
  activeIndex: number
  selectedCode: string
  /** Show "Popular" / "All countries" headings (only when not searching) */
  showGroups: boolean
  /** How many pinned countries come first in `items` */
  popularCount: number
  renderFlag: (code: string) => ReactNode
  onSelect: (country: Country) => void
  onHover: (index: number) => void
}

const CountryList = ({
  id,
  idPrefix,
  items,
  activeIndex,
  selectedCode,
  showGroups,
  popularCount,
  renderFlag,
  onSelect,
  onHover,
}: Props) => {
  const cn = useStyles()
  const listRef = useRef<HTMLUListElement>(null)

  // Keep the highlighted row visible while arrowing through the list
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, items])

  return (
    <ul
      ref={listRef}
      id={id}
      role="listbox"
      data-slot="list"
      aria-label="Countries"
      className={cn('list')}
    >
      {items.length === 0 && (
        <li role="presentation" className={cn('emptyState')}>
          No countries found
        </li>
      )}

      {items.map((c, i) => {
        const active = i === activeIndex
        const selected = c.code === selectedCode
        return (
          <Fragment key={c.code}>
            {showGroups && i === 0 && (
              <li role="presentation" className={cn('groupHeading')}>
                Popular
              </li>
            )}
            {showGroups && i === popularCount && (
              <li role="presentation" className={cn('groupHeading')}>
                All countries
              </li>
            )}
            <li
              id={`${idPrefix}-${c.code}`}
              role="option"
              data-slot="option"
              aria-selected={selected}
              data-active={active}
              data-selected={selected}
              onClick={() => onSelect(c)}
              onMouseMove={() => !active && onHover(i)}
              className={cn('option', { active, selected })}
            >
              <span className={`${cn('optionFlag')} flag`} aria-hidden="true">
                {renderFlag(c.code)}
              </span>
              <span className={cn('optionName')}>{c.name}</span>
              <span className={cn('optionDialCode')}>+{c.dialCode}</span>
            </li>
          </Fragment>
        )
      })}
    </ul>
  )
}

export default CountryList
