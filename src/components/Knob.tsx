import { useState, useEffect, useRef } from "react";

type Props = {
  value: number,
  setter: Function
  initial: number,
  min: number,
  max: number,
  step: number,
  getRotation: Function
}

const Knob = ({ value, setter, initial, min, max, step, getRotation }: Props) => {

  let valueCopy = value;

  const [rotation, setRotation] = useState(0);

  let prevY = 0;
  let currY = 0;
  const scrollKnob = (event: MouseEvent | WheelEvent | TouchEvent) => {
    (event as WheelEvent).preventDefault();

    currY = (event as MouseEvent).pageY ?? (event as TouchEvent).touches[0].clientY;

    if (currY < prevY || (event as WheelEvent).deltaY < 0) {
      valueCopy = (valueCopy + step <= max) ? (valueCopy + step) : max;
    } else if (currY > prevY || (event as WheelEvent).deltaY > 0) {
      valueCopy = (valueCopy - step >= min) ? (valueCopy - step) : min;
    }

    prevY = currY;
    setter(valueCopy);
  }

  useEffect(() => {
    setRotation(getRotation(valueCopy));
  }, [valueCopy, getRotation]);

  const knob = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const currentKnob = knob.current;
    currentKnob?.addEventListener('wheel', scrollKnob);

    return () => {
      currentKnob?.removeEventListener('wheel', scrollKnob);
    }

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const listenMovement = () => {
    window.addEventListener('mousemove', scrollKnob);
    window.addEventListener('touchmove', scrollKnob);
    window.addEventListener('mouseup', clearEvents);
    window.addEventListener('touchend', clearEvents);
  }

  const clearEvents = () => {
    window.removeEventListener('mousemove', scrollKnob);
    window.removeEventListener('touchmove', scrollKnob);
    window.removeEventListener('mouseup', clearEvents);
    window.removeEventListener('touchend', clearEvents);
  }

  return (
    <div
      ref={knob}
      className="bg-neo-yellow border-4 border-black rounded-full w-[36px] h-[36px] shadow-brutal-sm touch-none cursor-pointer hover:bg-neo-lime transition-colors"
      style={{ transform: `rotate(${rotation}deg)` }}
      onMouseDown={() => listenMovement()}
      onTouchStart={() => listenMovement()}
      onDoubleClick={() => setter(initial)}
    >
      <div className="bg-black rounded-full w-[4px] h-[6px] m-auto mt-[4px]"></div>
    </div>
  );
}

export default Knob;
