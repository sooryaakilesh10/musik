import Knob from './Knob';

type Props = {
  masterVolume: number,
  setMasterVolume: Function
}

const MasterVolume = ({ masterVolume, setMasterVolume }: Props) => {
  return (
    <div className="flex gap-3 items-center bg-white border-4 border-black px-4 py-2 shadow-brutal-sm">
      <span className="text-sm font-black uppercase">VOL</span>
      <Knob
        value={masterVolume}
        setter={setMasterVolume}
        initial={0.5}
        min={0}
        max={1}
        step={0.02}
        getRotation={(val: number) => 250 * (val - 0.5)}
      />
      <span className="text-lg font-black">{Math.round(masterVolume * 100)}</span>
    </div>
  );
}

export default MasterVolume;
