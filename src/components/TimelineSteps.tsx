type Props = {
  steps: number,
  setSteps: Function
}

const TimelineSteps = ({ steps, setSteps }: Props) => {
  const stepOptions = [4, 8, 12, 16, 20, 24, 28, 32];

  return (
    <div className="flex gap-2 items-center bg-white border-4 border-black px-3 py-2 shadow-brutal-sm">
      <span className="text-sm font-black uppercase">STEPS</span>
      <select
        value={steps}
        onChange={(e) => setSteps(Number(e.target.value))}
        className="bg-neo-yellow border-2 border-black px-2 py-1 font-black cursor-pointer hover:bg-neo-lime transition-colors"
      >
        {stepOptions.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TimelineSteps;
