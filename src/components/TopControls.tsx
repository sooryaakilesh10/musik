import MasterBPM from './MasterBPM';
import MasterVolume from './MasterVolume';
import TimelineSteps from './TimelineSteps';

type Props = {
  BPM: number,
  setBPM: Function,
  masterVolume: number,
  setMasterVolume: Function,
  steps: number,
  setSteps: Function,
  onAddCustomClick: () => void,
  onPianoClick: () => void
}

export default function TopControls({ 
  BPM, 
  setBPM, 
  masterVolume, 
  setMasterVolume, 
  steps, 
  setSteps, 
  onAddCustomClick,
  onPianoClick 
}: Props) {
  return (
    <div className="flex justify-between bg-neo-cyan border-6 border-black px-6 py-4 shadow-brutal mb-4">
      <div className="flex gap-4 items-center">
        <MasterBPM
          BPM={BPM}
          setBPM={setBPM}
        />

        <TimelineSteps
          steps={steps}
          setSteps={setSteps}
        />

        <button
          onClick={onAddCustomClick}
          className="bg-neo-pink border-4 border-black px-4 py-2 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm"
        >
          + CUSTOM
        </button>

        <button
          onClick={onPianoClick}
          className="bg-neo-purple border-4 border-black px-4 py-2 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-white text-sm"
        >
          🎹 PIANO
        </button>
      </div>

      <MasterVolume
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
      />
    </div>
  );
}
