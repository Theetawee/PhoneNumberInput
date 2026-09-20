import { createContext, useContext } from 'react'
import { createStyles } from './styles'
import type { StyleFn } from './styles'

const fallback = createStyles(undefined, false, {
  status: 'empty',
  hasError: false,
  disabled: false,
  open: false,
})

/** Lets every sub-component ask for its classes without prop drilling. */
export const StylesContext = createContext<StyleFn>(fallback)

export const useStyles = () => useContext(StylesContext)
