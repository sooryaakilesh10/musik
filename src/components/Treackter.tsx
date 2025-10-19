import { useState } from 'react';
import DAW from './DAW';
import About from './About';
import Modal from './Modal';
import Navigation from './Navigation';
import HomeScreen from './HomeScreen';

const Treackter = () => {

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext || false;
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const [modalVisibility, setModalVisibility] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'studio'>('home');

  const initAudio = () => {
    setModalVisibility(false);

    if (!AudioContext) {
      alert('DAW only works on modern browsers. Please, consider using Chrome or Firefox.');
      return;
    }

    const context = new AudioContext();
    setAudioContext(context);
  }

  const handleNavigateHome = () => {
    setCurrentView('home');
    if (audioContext) {
      audioContext.suspend();
    }
  };

  const handleNavigateStudio = () => {
    setCurrentView('studio');
    if (audioContext) {
      audioContext.resume();
    } else {
      setModalVisibility(true);
    }
  };

  const handleStartJamming = () => {
    setCurrentView('studio');
    if (!audioContext) {
      setModalVisibility(true);
    } else {
      audioContext.resume();
    }
  };

  return (
    <div className="bg-neo-bg min-h-screen">
      <Navigation 
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNavigateStudio={handleNavigateStudio}
      />

      <div className="landscape:hidden min-h-screen flex items-center justify-center p-4">
        <div className="bg-neo-yellow border-8 border-black w-full max-w-md p-8 shadow-brutal-lg text-center">
          <div className="flex gap-6 justify-center mb-6">
            <div className="bg-neo-pink border-4 border-black w-16 h-24 shadow-brutal-sm"></div>
            <div className="text-4xl font-black flex items-center">→</div>
            <div className="bg-neo-cyan border-4 border-black w-24 h-16 shadow-brutal-sm"></div>
          </div>
          <span className="text-2xl md:text-3xl font-black uppercase block">
            Rotate your device!
          </span>
        </div>
      </div>

      <Modal visible={modalVisibility && currentView === 'studio'}>
        <div className="flex justify-center">
          <button
            className="bg-neo-pink border-4 border-black px-8 py-4 text-xl font-black uppercase shadow-brutal hover:shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-2 active:translate-y-2 active:shadow-none"
            onClick={initAudio}
          >
            LET'S GO!
          </button>
        </div>
      </Modal>

      {currentView === 'home' ? (
        <div className="pt-20">
          <HomeScreen onStartJamming={handleStartJamming} />
        </div>
      ) : (
        <div className="portrait:hidden" style={{ paddingTop: '253px' }}>
          <div className="flex" style={{ minHeight: 'calc(100vh - 253px)' }}>
            <div className="w-[5%] flex justify-center items-center">
              <h1 className="text-2xl font-black tracking-wider -rotate-90 bg-neo-yellow border-4 border-black px-6 py-2 shadow-brutal">
                TREACKTER
              </h1>
            </div>

            <div className="w-[90%] p-4">
              {audioContext && <DAW audioContext={audioContext} />}
            </div>

            <div className="w-[5%]">
              <About />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Treackter;
