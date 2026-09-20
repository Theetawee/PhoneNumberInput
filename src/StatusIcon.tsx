import { CheckIcon, XIcon } from './Icons'
import { useStyles } from './StylesContext'
import type { PhoneStatus } from './types'

/** Check when valid, cross when invalid, nothing otherwise. */
const StatusIcon = ({ status }: { status: PhoneStatus }) => {
  const cn = useStyles()
  if (status === 'valid') return <CheckIcon className={cn('statusIcon')} />
  if (status === 'invalid') return <XIcon className={cn('statusIcon')} />
  return null
}

export default StatusIcon
