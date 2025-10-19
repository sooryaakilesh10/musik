import { useState, useEffect, useCallback, useMemo } from 'react';
import TopControls from './TopControls';
import Soundboard from './Soundboard';
import Timeline from './Timeline';
import CustomInstrument from './CustomInstrument';
import Piano from './Piano';

import kit1 from '../json/kit1.json';
import kit2 from '../json/kit2.json';
import kit3 from '../json/kit3.json';
import timelineTemplate from '../json/timeline.json';

type Pad = {
  id: number,
  type: string,
  path: string,
  color: string,
  name: string,
  audio: AudioBuffer | null
}

type Kit = Pad[];

type PianoNote = {
  note: string,
  octave: number,
  instrument: string,
  time: number
}

type TimelinePad = {
  kit: number | null,
  sound: AudioBuffer | null,
  playing: boolean
}

type TimelineTrack = {
  name: string,
  pads: TimelinePad[],
  state: {
    solo: boolean,
    muted: boolean,
    ignored: boolean
  },
  audio: {
    volume: number,
    panning: number,
    bpm?: number
  },
  pianoRecording?: {
    notes: PianoNote[],
    duration: number
  }
}

type TimelineState = {
  settings: {
    BPM: number,
    masterVolume: number
  },
  tracks: TimelineTrack[]
}

type Props = {
  audioContext: AudioContext
}

const DAW = ({ audioContext }: Props) => {
  // BPM
  const [BPM, setBPM] = useState(240);

  // Master volume
  const [masterVolume, setMasterVolume] = useState(0.5);

  // Timeline steps
  const [steps, setSteps] = useState(16);

  // Custom instruments
  const [customKit, setCustomKit] = useState<Kit>([]);
  const [showCustomInstrument, setShowCustomInstrument] = useState(false);
  const [showPiano, setShowPiano] = useState(false);
  const [lastAnalyzedSound, setLastAnalyzedSound] = useState<AudioBuffer | null>(null);

  // Timeline state
  const [timeline, setTimeline] = useState<TimelineState>(timelineTemplate);

  // Get sample from public folder or File object
  const getSample = useCallback(async (path: string | File) => {
    let arrayBuffer;
    if (path instanceof File) {
      arrayBuffer = await path.arrayBuffer();
    } else {
      arrayBuffer = await fetch(path);
      arrayBuffer = await arrayBuffer.arrayBuffer();
    }
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }, [audioContext]);

  // Set up sounds on audio buffer arrays
  const loadSounds = useCallback(async (paths: (string | File)[]) => {
    const audioBuffers = [];

    for (const path of paths) {
      const sample = await getSample(path);
      audioBuffers.push(sample);
    }

    return audioBuffers;
  }, [getSample]);

  // Add custom instrument
  const handleAddCustomInstrument = async (name: string, file: File) => {
    const newInstrument: Pad = {
      id: customKit.length + 31, // Start after kit3's last ID
      type: name,
      path: file.name,
      color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
      name: name,
      audio: null
    };

    const audioBuffer = await getSample(file);
    newInstrument.audio = audioBuffer;
    setLastAnalyzedSound(audioBuffer);

    // Add the new instrument to customKit
    setCustomKit(prev => [...prev, newInstrument]);

    // Create empty pads array
    const emptyPads: TimelinePad[] = Array(steps).fill(null).map(() => ({
      kit: null,
      sound: null,
      playing: false
    }));

    // Update timeline with the new track
    const newTrack: TimelineTrack = {
      name: name,
      pads: emptyPads,
      state: {
        solo: false,
        muted: false,
        ignored: false
      },
      audio: {
        volume: 0.5,
        panning: 0
      }
    };

    // Update timeline state
    setTimeline(prevTimeline => ({
      ...prevTimeline,
      tracks: [...prevTimeline.tracks, newTrack]
    }));

    setShowCustomInstrument(false);
    setShowPiano(true);
  };

  // Start a sound
  const playSound = (audioBuffer: AudioBuffer, panning=0, selfVol=1, masterVol=masterVolume) => {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Panning & volume
    const pan = new StereoPannerNode(audioContext, { pan: panning });
    const vol = audioContext.createGain();
    vol.gain.value = selfVol * masterVol;
    source.connect(vol).connect(pan).connect(audioContext.destination);

    // Play
    source.start(0);
  }

  // Handle piano recording completion
  const handlePianoRecording = (recordedNotes: PianoNote[], duration: number) => {
    const newTimeline = { ...timeline };
    
    // Find or create a piano track
    let pianoTrack = newTimeline.tracks.find(t => t.name === 'Piano');
    
    if (!pianoTrack) {
      // Create new piano track
      const emptyPads: TimelinePad[] = Array(steps).fill(null).map(() => ({
        kit: null,
        sound: null,
        playing: false
      }));
      
      pianoTrack = {
        name: 'Piano',
        pads: emptyPads,
        state: { solo: false, muted: false, ignored: false },
        audio: { volume: 0.5, panning: 0, bpm: 240 },
        pianoRecording: {
          notes: recordedNotes,
          duration: duration
        }
      };
      
      newTimeline.tracks.push(pianoTrack);
    } else {
      // Update existing piano track with new recording
      pianoTrack.pianoRecording = {
        notes: recordedNotes,
        duration: duration
      };
    }
    
    setTimeline(newTimeline);
    setShowPiano(false);
  };

  // State for re-rendering the component after all kits are loaded
  const [loaded, setLoaded] = useState(false);

  // Memoize kits array
  const kits = useMemo(() => [...[kit1, kit2, kit3], customKit], [customKit]);

  // Load all kits
  useEffect(() => {
    const loadKits = async () => {
      try {
        await Promise.all(
          kits.slice(0, 3).map(async (kit) => {
            const paths = kit.map(sound => sound.path);
            const audioBuffers = await loadSounds(paths);
            kit.forEach((sound, i) => {
              sound.audio = audioBuffers[i];
            });
          })
        );
        setLoaded(true);
      } catch (error) {
        console.log("Error loading kits: ", error);
      }
    }

    loadKits();
  }, [kits, loadSounds]);

  return (
    <div className="flex flex-col justify-center max-w-6xl h-[90vh] m-auto relative">
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#ff6b9d', stopOpacity: 0.3}} />
            <stop offset="100%" style={{stopColor: '#ffb3d9', stopOpacity: 0.3}} />
          </linearGradient>
        </defs>
        <g className="animate-float-heart-1">
          <path d="M 50 80 C 50 65, 30 55, 30 55 C 15 55, 15 70, 15 70 C 15 85, 30 100, 50 120 C 70 100, 85 85, 85 70 C 85 70, 85 55, 70 55 C 70 55, 50 65, 50 80 Z"
                fill="url(#heartGradient)" opacity="0.4"/>
        </g>
        <g className="animate-float-heart-2">
          <path d="M 90% 20% C 90% 15%, 88% 12%, 88% 12% C 86% 12%, 86% 15%, 86% 15% C 86% 20%, 88% 25%, 90% 30% C 92% 25%, 94% 20%, 94% 15% C 94% 15%, 94% 12%, 92% 12% C 92% 12%, 90% 15%, 90% 20% Z"
                fill="#ffb3d9" opacity="0.5" transform="scale(0.8)"/>
        </g>
        <g className="animate-float-heart-3">
          <circle cx="15%" cy="85%" r="3" fill="#c9a0dc" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="18%" cy="88%" r="2" fill="#ffb3d9" opacity="0.5">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite"/>
          </circle>
        </g>
        <g className="animate-float-heart-4">
          <circle cx="85%" cy="75%" r="2.5" fill="#ff6b9d" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>

      {/* Upper Bar Controls */}
      <TopControls
        BPM={BPM}
        setBPM={setBPM}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        steps={steps}
        setSteps={setSteps}
        onAddCustomClick={() => setShowCustomInstrument(true)}
        onPianoClick={() => setShowPiano(true)}
      />
      {/* Sound Effects */}
      <Soundboard
        loaded={loaded}
        kits={kits}
        playSound={playSound}
      />
      {/* Timeline */}
      <Timeline
        kits={kits}
        playSound={playSound}
        BPM={BPM}
        setBPM={setBPM}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        steps={steps}
        timeline={timeline}
        setTimeline={setTimeline}
        audioContext={audioContext}
        onVisibleTracksChange={(trackName) => {}}
      />

      <style>{`
        @keyframes float-heart-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(15px, -20px) rotate(8deg); }
          66% { transform: translate(-8px, 15px) rotate(-5deg); }
        }

        @keyframes float-heart-2 {
          0%, 100% { transform: translate(0, 0) scale(0.8); }
          50% { transform: translate(-20px, 25px) scale(1); }
        }

        @keyframes float-heart-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -15px); }
        }

        @keyframes float-heart-4 {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(-12px, 18px); opacity: 0.7; }
        }

        .animate-float-heart-1 { animation: float-heart-1 12s ease-in-out infinite; }
        .animate-float-heart-2 { animation: float-heart-2 15s ease-in-out infinite; }
        .animate-float-heart-3 { animation: float-heart-3 8s ease-in-out infinite; }
        .animate-float-heart-4 { animation: float-heart-4 10s ease-in-out infinite; }
      `}</style>
      {/* Custom Instrument Modal */}
      {showCustomInstrument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <button 
              onClick={() => setShowCustomInstrument(false)}
              className="absolute -top-2 -right-2 bg-primary text-secondary w-8 h-8 rounded-full"
            >
              ×
            </button>
            <CustomInstrument onInstrumentAdd={handleAddCustomInstrument} />
          </div>
        </div>
      )}
      {/* Piano Modal */}
      {showPiano && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Piano 
            audioContext={audioContext}
            onClose={() => setShowPiano(false)}
            analyzedSound={lastAnalyzedSound}
            BPM={BPM}
            steps={steps}
            onRecordingComplete={handlePianoRecording}
          />
        </div>
      )}
    </div>
  );
}

export default DAW;