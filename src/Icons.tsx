interface IconProps {
  className?: string
}

// width/height keep icons text-sized when the user passes no classes (unstyled mode).
// CSS classes such as h-5 w-5 still override these attributes.
const base = {
  viewBox: '0 0 20 20',
  width: '1em',
  height: '1em',
  fill: 'none',
  stroke: 'currentColor',
  'aria-hidden': true,
} as const

export const ChevronDownIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} strokeWidth="1.5">
    <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} strokeWidth="1.5">
    <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
  </svg>
)

export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} strokeWidth="1.75">
    <path d="m4.5 10.5 3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const XIcon = ({ className }: IconProps) => (
  <svg {...base} className={className} strokeWidth="1.75">
    <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
  </svg>
)
