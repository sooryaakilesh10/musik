import TimelinePad  from "./TimelinePad";
import TrackUtility from "./TrackUtility";
import Knob from "./Knob";

type Pad = {
  id: number,
  type: string,
  path: string,
  color: string,
  name: string,
  audio: AudioBuffer | null
}

type AudioTrack = {
  name: string,
  pads: {
    kit: number | null,
    sound: AudioBuffer | null,
    playing: boolean
  }[],
  state: {
    solo: boolean,
    muted: boolean,
    ignored: boolean
  },
  audio: {
    volume: number,
    panning: number,
    bpm?: number
  }
}

type Timeline = {
  settings: { 
    BPM: number,
    masterVolume: number
  },
  tracks: AudioTrack[]
}

type Props = {
  self: AudioTrack,
  soundsData: Pad[],
  playSound: Function,
  timeline: Timeline,
  setTimeline: Function,
  onRemove: () => void
}

const Track = ({ self, soundsData, playSound, timeline, setTimeline, onRemove }: Props) => {
  const pads = timeline.tracks.find(track => track.name === self.name)!.pads;

  const soloTrack = () => {
    const newTimeline = {...timeline};
    const tracks = newTimeline.tracks;

    tracks.forEach(track => {
      if (track.name !== self.name) {
        track.state.solo = false;
      }
      track.state.ignored = true;
    });

    const index = tracks.findIndex(track => track.name === self.name);
    tracks[index].state.solo = !tracks[index].state.solo;

    const soloCount = tracks.filter(track => track.state.solo === true).length;
    if (soloCount === 0) {
      tracks.forEach(track => {
        track.state.ignored = false;
      });
    }

    setTimeline(newTimeline);
  };

  const muteTrack = () => {
    const newTimeline = {...timeline};
    const tracks = newTimeline.tracks;

    const index = tracks.findIndex(track => track.name === self.name);
    tracks[index].state.muted = !tracks[index].state.muted;
    
    setTimeline(newTimeline);
  };

  return (
    <div className="py-2">
      <div className="flex">
        <div className="w-[10%] bg-neo-pink border-4 border-black px-3 py-2 shadow-brutal-sm flex items-center justify-between">
          <span className="font-black uppercase text-sm truncate">{self.name}</span>
          <button
            onClick={onRemove}
            className="ml-2 text-black hover:text-red-600 font-black text-lg"
            title="Remove track"
          >
            ×
          </button>
        </div>
        <div className="w-[65%] overflow-x-auto bg-neo-bg border-4 border-black p-2 shadow-brutal-sm">
          <div className="flex gap-3 min-w-max">
            {pads.map((pad, index) => (
              <TimelinePad
                key={index}
                padProperties={pad}
                stateProperties={self.state}
                audioProperties={self.audio}
                soundsData={soundsData}
                playSound={playSound}
              />
            ))}
          </div>
        </div>
        
        <div className="w-[25%] flex gap-3 justify-end items-center">
            <TrackUtility
              symbol={'S'}
              activeColor={'#ff006e'}
              role={soloTrack}
              property={self.state.solo}
              canBeIgnored={false}
              ignored={self.state.ignored}
            />
            
            <TrackUtility
              symbol={'M'}
              activeColor={'#00d9ff'}
              role={muteTrack}
              property={self.state.muted}
              canBeIgnored={true}
              ignored={self.state.ignored}
            />
            
            {self.name === 'Piano' && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-white mb-1">BPM</span>
                <Knob
                  value={self.audio.bpm || 240}
                  setter={(value: number) => {
                    const newTimeline = {...timeline};
                    newTimeline.tracks.find(track => track.name === self.name)!.audio.bpm = Math.round(value);
                    setTimeline(newTimeline);
                  }}
                  initial={240}
                  min={60}
                  max={480}
                  step={10}
                  getRotation={(val: number) => 250 * ((val - 60) / 420 - 0.5)}
                />
                <span className="text-xs text-white mt-1">{Math.round(self.audio.bpm || 240)}</span>
              </div>
            )}
            
            <Knob
              value={self.audio.volume}
              setter={(value: number) => {
                const newTimeline = {...timeline};
                newTimeline.tracks.find(track => track.name === self.name)!.audio.volume = value;
                setTimeline(newTimeline);
              }}
              initial={0.5}
              min={0}
              max={1}
              step={0.02}
              getRotation={(val: number) => 250 * (val - 0.5)}
            />
            
            <Knob
              value={self.audio.panning}
              setter={(value: number) => {
                const newTimeline = {...timeline};
                newTimeline.tracks.find(track => track.name === self.name)!.audio.panning = value;
                setTimeline(newTimeline);
              }}
              initial={0}
              min={-1}
              max={1}
              step={0.04}
              getRotation={(val: number) => 120 * val}
            />
          </div>
      </div>
    </div>
  );
}

export default Track;
