type Props = {
  message?: string
}

function Empty({ message = 'There is nothing in here' }: Props) {
  return (
    <div>
      <h4 className="text-center text-card-foreground text-sm">{message}</h4>
    </div>
  )
}

export default Empty
