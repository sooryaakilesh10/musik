import { useState } from "react";

const About = () => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(open => !open);
  }

  return (
    <section onClick={() => toggleOpen()} className="relative z-10 cursor-pointer">
      {!open ? (
        <div className="bg-neo-lime border-4 border-black w-10 h-24 flex items-center justify-center shadow-brutal-sm fixed right-0 top-[50%] -mt-12">
          <svg className="fill-black w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
          </svg>
        </div>
      ) : (
        <div className="bg-white border-6 border-black w-80 h-96 px-6 py-6 shadow-brutal-lg fixed right-0 top-[50%] -mt-48">
          <div className="flex h-full">
            <div className="self-center -mt-[14px]">
              <svg className="fill-black w-[16px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
              </svg>
            </div>
            <div className="w-full px-5 self-center">
              <div className="bg-neo-yellow border-4 border-black p-3 mb-4 shadow-brutal-sm">
                <h2 className="text-2xl font-black uppercase text-center">HOW TO USE</h2>
              </div>
              <div className="space-y-3">
                <p className="font-bold bg-neo-bg border-2 border-black p-2">
                  Click pads to add beats! 🎵
                </p>
                <p className="font-bold bg-neo-bg border-2 border-black p-2">
                  <b className="text-neo-pink">Shift + Click</b> to clear 🗑️
                </p>
                <p className="font-bold bg-neo-bg border-2 border-black p-2">
                  Control volume, pan, solo & mute 🎛️
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default About;
