type Props = {
  symbol: string,
  activeColor: string,
  role: Function,
  property: boolean,
  canBeIgnored: boolean,
  ignored: boolean
}

const TrackUtility = ({ symbol, activeColor, role, property, canBeIgnored, ignored }: Props) => {

  const defineColor = () => {
    if (!canBeIgnored || !ignored)
      return property ? activeColor : '#ffffff';
    else
      return property ? '#666666' : '#cccccc';
  }

  const defineBorder = () => {
    if (!canBeIgnored || !ignored)
      return property ? activeColor : '#000000';
    else
      return '#666666';
  }

  return (
    <div
      className="cursor-pointer font-black text-lg w-10 h-10 border-4 flex items-center justify-center shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-2 active:translate-y-2 active:shadow-none"
      style={{ 
        backgroundColor: defineColor(),
        borderColor: defineBorder(),
        color: property ? '#000000' : '#000000'
      }}
      onClick={() => role()}
    >
      <span>{symbol}</span>
    </div>
  )
}

export default TrackUtility;
