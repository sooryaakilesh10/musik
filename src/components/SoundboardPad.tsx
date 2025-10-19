import { forwardRef } from "react";

type Props = {
  name: string,
  background: string,
  audio: AudioBuffer,
  playSound: Function
}

const SoundboardPad = forwardRef<HTMLButtonElement, Props>(({ name, background, audio, playSound }: Props, ref) => {
  return (
    <button
      id={name}
      ref={ref}
      className="flex items-center justify-center border-4 border-black w-20 h-20 2xl:w-24 2xl:h-24 text-center shadow-brutal-sm
      transition-all duration-75 hover:cursor-pointer active:scale-90 active:shadow-none focus:outline-none font-black uppercase text-sm"
      style={{ backgroundColor: `${background}` }}
      type="button"
      onMouseDownCapture={() => playSound(audio)}
    >
      <span>{name}</span>
    </button>
  );
})

export default SoundboardPad;
