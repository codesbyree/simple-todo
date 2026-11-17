import { cn } from '@renderer/utils/cn'
import { ComponentPropsWithRef } from 'react'

interface Props extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'default' | 'icon' | 'icon-lg'
  position?: 'first' | 'middle' | 'last' | 'top' | 'bottom' | 'single' | 'single-full'
}

const buttonRoundedCornerByPosition: Record<NonNullable<Props['position']>, string> = {
  first: 'rounded-tl-4xl rounded-bl-4xl',
  middle: 'rounded-sm',
  last: 'rounded-tr-4xl rounded-br-4xl',
  top: 'rounded-tr-xl rounded-tl-xl',
  bottom: 'rounded-br-xl rounded-bl-xl',
  single: 'rounded-xl',
  'single-full': 'rounded-[100px]'
}

const buttonColorByVariant: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  accent: 'bg-tertiary text-tertiary-foreground',
  ghost: 'bg-transparent hover:bg-white/30'
}

const buttonSizeByVariant: Record<NonNullable<Props['size']>, string> = {
  default: 'h-10 px-3 py-1',
  icon: 'w-6 h-6 p-0 grid place-items-center',
  'icon-lg': 'w-8 h-8 grid place-items-center'
}

function Button(props: Props) {
  const {
    children,
    className,
    variant = 'primary',
    size = 'default',
    position = 'single',
    ...rest
  } = props

  return (
    <button
      className={cn(
        'flex items-center rounded-sm justify-center text-sm cursor-pointer tracking-tight font-semibold gap-2 w-full hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none outline-none active:brightness-120 active:scale-95',
        buttonColorByVariant[variant],
        buttonRoundedCornerByPosition[position],
        buttonSizeByVariant[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
