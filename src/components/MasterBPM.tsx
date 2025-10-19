type Props = {
  BPM: number,
  setBPM: Function
}

const MasterBPM = ({ BPM, setBPM }: Props) => {

  const changeBPM = (val: number) => {
    val = (val < 120) ? 120 : val;
    val = (val > 360) ? 360 : val;
    setBPM(val);
  }

  return (
    <div className="flex gap-3 items-center">
      <div className="bg-white border-4 border-black px-3 py-2 shadow-brutal-sm">
        <div className="flex gap-2 items-center">
          <input
            value={BPM}
            onChange={event => changeBPM(Number(event.target.value))}
            className="w-24 text-lg text-center font-black"
            type="range"
            step="20"
            min="120"
            max="360"
            style={{
              accentColor: '#ff006e'
            }}
          />
          <div className="flex gap-1 items-baseline">
            <span className="text-2xl font-black">{BPM}</span>
            <span className="text-xs font-black">BPM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterBPM;
