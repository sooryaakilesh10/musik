import { useState, useEffect } from "react";

type Pad = {
  id: number,
  type: string,
  path: string,
  color: string,
  name: string,
  audio: AudioBuffer | null
}

type Props = {
  padProperties: {
    kit: null | number,
    sound: AudioBuffer | null,
    playing: boolean
  },
  stateProperties: {
    solo: boolean,
    muted: boolean,
    ignored: boolean
  },
  audioProperties: {
    volume: number,
    panning: number
  }
  soundsData: Pad[],
  playSound: Function
}

const TimelinePad = ({ padProperties, stateProperties, audioProperties, soundsData, playSound }: Props) => {

  let timer: ReturnType<typeof setTimeout>;

  const [bgColor, setBgColor] = useState('');
  const [clicks, setClicks] = useState(0);
  
  let kitIndex: number;
  const alterPad = (event: React.MouseEvent<HTMLElement>) => {
    if (event.shiftKey) {
      padProperties.kit = null;
      padProperties.sound = null;
      setBgColor('');
      setClicks(0);
    }
    else {
      kitIndex = clicks % soundsData.length;
      padProperties.kit = kitIndex + 1;
      padProperties.sound = soundsData[kitIndex].audio;
      setClicks(clicks => clicks + 1);

      if (stateProperties.solo || (!stateProperties.ignored && !stateProperties.muted))
        playSound(padProperties.sound, audioProperties.panning, audioProperties.volume);
    }
  }

  useEffect(() => {
    padProperties.sound = padProperties.kit ? soundsData[padProperties.kit-1].audio : null;
    setBgColor(padProperties.kit ? soundsData[padProperties.kit-1].color : '');

    if (!padProperties.kit && !padProperties.sound) {
      setClicks(0);
    }
  }, [padProperties, padProperties.kit, padProperties.sound, soundsData]);

  return (
    <div
      className="relative border-4 border-black bg-white w-10 h-10 cursor-pointer shadow-brutal-sm active:scale-90 transition-all"
      style={{
        backgroundColor: bgColor || '#ffffff',
        borderColor: padProperties.playing ? '#ff006e' : '#000000',
        transform: padProperties.playing ? 'scale(1.2)' : '',
        boxShadow: padProperties.playing ? '0 0 20px #ff006e' : '4px 4px 0px 0px #000000'
      }}
      onClick={event => alterPad(event)}
      onTouchStart={() => {
        timer = setTimeout(() => {
          padProperties.kit = null;
          padProperties.sound = null;
          setClicks(0);
        }, 500);
      }}
      onTouchEnd={() => {
        if (timer) clearTimeout(timer);
      }}
    >
    </div>
  ); 
}

export default TimelinePad;
