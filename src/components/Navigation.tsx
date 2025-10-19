type Props = {
  currentView: 'home' | 'studio';
  onNavigateHome: () => void;
  onNavigateStudio: () => void;
};

const Navigation = ({ currentView, onNavigateHome, onNavigateStudio }: Props) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-neo-yellow border-b-4 border-black p-4 shadow-brutal">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-black tracking-tight">
            TREACKTER
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onNavigateHome}
            className={`border-3 border-black px-6 py-2 text-lg font-black uppercase shadow-brutal-sm transition-all ${
              currentView === 'home'
                ? 'bg-neo-pink'
                : 'bg-white hover:shadow-none hover:translate-x-1 hover:translate-y-1'
            }`}
          >
            🏠 HOME
          </button>
          <button
            onClick={onNavigateStudio}
            className={`border-3 border-black px-6 py-2 text-lg font-black uppercase shadow-brutal-sm transition-all ${
              currentView === 'studio'
                ? 'bg-neo-cyan'
                : 'bg-white hover:shadow-none hover:translate-x-1 hover:translate-y-1'
            }`}
          >
            🎹 STUDIO
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
