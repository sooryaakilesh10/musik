type Props = {
  onEnter: () => void;
};

const WelcomeScreen = ({ onEnter }: Props) => {
  return (
    <div className="fixed inset-0 z-30 bg-neo-yellow flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-neo-pink border-4 border-black rotate-12"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-neo-cyan border-4 border-black -rotate-6"></div>
        <div className="absolute bottom-20 left-32 w-28 h-28 bg-neo-lime border-4 border-black rotate-45"></div>
        <div className="absolute bottom-40 right-40 w-36 h-36 bg-neo-purple border-4 border-black -rotate-12"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-neo-orange border-4 border-black"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-pulse">
          <h1 className="text-8xl md:text-9xl font-black text-black mb-4 tracking-tighter" 
              style={{ 
                textShadow: '8px 8px 0px #ff006e, 16px 16px 0px #00d9ff'
              }}>
            TREACKTER
          </h1>
          <div className="flex justify-center gap-4 flex-wrap mb-6">
            <span className="bg-neo-pink border-4 border-black px-6 py-2 text-2xl font-black shadow-brutal rotate-2">
              BEATS
            </span>
            <span className="bg-neo-cyan border-4 border-black px-6 py-2 text-2xl font-black shadow-brutal -rotate-1">
              LOOPS
            </span>
            <span className="bg-neo-lime border-4 border-black px-6 py-2 text-2xl font-black shadow-brutal rotate-1">
              VIBES
            </span>
          </div>
        </div>

        <div className="mb-12">
          <p className="text-3xl md:text-4xl font-black text-black mb-4 uppercase">
            Make music in your browser!
          </p>
          <p className="text-xl md:text-2xl font-bold text-black">
            No rules. Just vibes. Let's go! 🎵
          </p>
        </div>

        <button
          onClick={onEnter}
          className="bg-neo-pink border-6 border-black px-16 py-6 text-4xl font-black uppercase shadow-brutal-lg hover:shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-2 active:translate-y-2 active:shadow-none"
        >
          START JAMMING
        </button>

        <div className="mt-12 flex justify-center gap-6 flex-wrap">
          <div className="bg-white border-4 border-black px-4 py-2 shadow-brutal-sm">
            <p className="text-lg font-black">🎹 3 KITS</p>
          </div>
          <div className="bg-white border-4 border-black px-4 py-2 shadow-brutal-sm">
            <p className="text-lg font-black">🎛️ FULL CONTROL</p>
          </div>
          <div className="bg-white border-4 border-black px-4 py-2 shadow-brutal-sm">
            <p className="text-lg font-black">💾 SAVE/LOAD</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
