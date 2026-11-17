import { ComponentPropsWithRef } from 'react'

export function Card(props: ComponentPropsWithRef<'section'>) {
  const { children, ...rest } = props

  return (
    <section {...rest} className="bg-card p-4 rounded-[20px] flex flex-col gap-4">
      {children}
    </section>
  )
}

export function CardHeader(props: ComponentPropsWithRef<'header'>) {
  const { children } = props

  return <header className="flex items-center gap-4 justify-between">{children}</header>
}

export function CardTitle(props: ComponentPropsWithRef<'h2'>) {
  const { children, ...rest } = props

  return (
    <h2
      {...rest}
      className="text-lg italic font-medium tracking-tight text-card-foreground trim-cap"
    >
      {children}
    </h2>
  )
}

export function CardContent(props: ComponentPropsWithRef<'div'>) {
  const { children, ...rest } = props

  return <div {...rest}>{children}</div>
}

export function CardFooter(props: ComponentPropsWithRef<'footer'>) {
  const { children, ...rest } = props

  return <footer {...rest}>{children}</footer>
}
