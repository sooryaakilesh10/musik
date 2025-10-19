type Props = {
  svgPath: JSX.Element,
  color: string,
  role: Function,
  disabled: boolean
}

const MediaButton = ({ svgPath, color, role, disabled }: Props) => {
  return (
    <button 
      disabled={disabled} 
      onClick={() => role()}
      className={`bg-white border-3 border-black p-2 shadow-brutal-sm transition-all ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-2 active:translate-y-2 active:shadow-none'
      }`}
    >
      <svg
        className={`w-[18px]`}
        fill={disabled ? '#666666' : color}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 384 512"
      >
        {svgPath}
      </svg>
    </button>
  );
}

export default MediaButton;
