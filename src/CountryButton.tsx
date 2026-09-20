import type { ReactNode } from 'react'
import { ChevronDownIcon } from './Icons'
import { useStyles } from './StylesContext'
import type { Country } from './types'

interface Props {
  country?: Country
  renderFlag: (code: string) => ReactNode
  onClick: () => void
  disabled?: boolean
}

/** The flag + dial code button that opens the country picker. */
const CountryButton = ({ country, renderFlag, onClick, disabled }: Props) => {
  const cn = useStyles()
  return (
    <button
      type="button"
      data-slot="button"
      className={cn('button')}
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-label={`Country: ${country?.name}, +${country?.dialCode}. Change country`}
    >
      <span className={`${cn('buttonFlag')} flag`} aria-hidden="true">
        {country && renderFlag(country.code)}
      </span>
      <span className={cn('buttonDialCode')} aria-hidden="true">
        +{country?.dialCode}
      </span>
      <ChevronDownIcon className={cn('buttonIcon')} />
    </button>
  )
}

export default CountryButton
