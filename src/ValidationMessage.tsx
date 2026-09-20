import { useStyles } from './StylesContext'

interface Props {
  id: string
  text: string
}

/** Always rendered so the layout doesn't jump; announced politely to screen readers. */
const ValidationMessage = ({ id, text }: Props) => {
  const cn = useStyles()
  return (
    <p id={id} data-slot="message" aria-live="polite" className={cn('message')}>
      {text}
    </p>
  )
}

export default ValidationMessage
