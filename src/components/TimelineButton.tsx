type Props = {
  text: string,
  role: Function
}

const TimelineButton = ({ text, role }: Props) => {
  return (
    <button
      className="bg-neo-yellow border-4 border-black px-4 py-2 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-2 active:translate-y-2 active:shadow-none text-sm"
      onClick={() => role()}
    >
      {text}
    </button>
  );
}
  
export default TimelineButton;
