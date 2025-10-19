import { useState, useEffect, useRef } from 'react';
import * as Soundfont from 'soundfont-player';
import MediaButton from './MediaButton';
import TimelineButton from './TimelineButton';
import Track from './Track';
import Modal from './Modal';

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
  kits: Kit[],
  playSound: Function,
  BPM: number,
  setBPM: Function,
  masterVolume: number,
  setMasterVolume: Function,
  steps: number,
  timeline: TimelineState,
  setTimeline: (timeline: TimelineState) => void,
  audioContext?: AudioContext,
  onVisibleTracksChange?: (trackName: string) => void
}

const Timeline = ({ kits, playSound, BPM, setBPM, masterVolume, setMasterVolume, steps, timeline, setTimeline, audioContext, onVisibleTracksChange }: Props) => {
  const [active, setActive] = useState(false);
  const [visibleTracks, setVisibleTracks] = useState<string[]>(['Kick', 'Snare']);
  const pianoInstrumentsRef = useRef<{ [key: string]: any }>({});
  const pianoStartTimeRef = useRef<number>(0);
  const pianoScheduledNotesRef = useRef<number[]>([]);
  
  // Expose function to add tracks to visible list
  useEffect(() => {
    if (onVisibleTracksChange) {
      // Check if Piano track exists in timeline but not in visibleTracks
      const pianoTrack = timeline.tracks.find(t => t.name === 'Piano');
      if (pianoTrack && !visibleTracks.includes('Piano')) {
        setVisibleTracks(prev => [...prev, 'Piano']);
      }
    }
  }, [timeline.tracks, onVisibleTracksChange]);

  const timelineSpace = useRef<HTMLDivElement>(null);
  const downArrow = useRef<SVGSVGElement>(null);

  const handleScroll = () => {
    const timeline = timelineSpace.current;
    const arrow = downArrow.current;

    if (!timeline || !arrow) return;

    if (timeline.scrollTop === 0) {
      arrow.style.visibility = 'visible';
      arrow.style.opacity = '1';
    } else {
      arrow.style.opacity = '0';
      arrow.style.visibility = 'hidden';
    }
  }

  const scrollToBottom = () => {
    const timeline = timelineSpace.current!;
    timeline.scrollTop = 1_000_000;
  }

  // Helper function to get or load piano instrument
  const getInstrument = async (instrumentName: string) => {
    if (!audioContext) return null;
    
    if (!pianoInstrumentsRef.current[instrumentName]) {
      try {
        const loadedInstrument = await Soundfont.instrument(audioContext, instrumentName as any);
        pianoInstrumentsRef.current[instrumentName] = loadedInstrument;
        return loadedInstrument;
      } catch (error) {
        console.error('Error loading piano instrument:', error);
        return null;
      }
    }
    
    return pianoInstrumentsRef.current[instrumentName];
  };

  const playColumn = async (column: number) => {
    const newTimeline = {...timeline};
    
    // Use for...of to properly await async operations
    for (const track of newTimeline.tracks) {
      const prevColumn = (column - 1 < 0) ? (track.pads.length - 1) : (column - 1);
      const prevPad = track.pads[prevColumn];
      prevPad.playing = false;
      const currPad = track.pads[column];
      currPad.playing = true;

      // Only play visible tracks
      if (visibleTracks.includes(track.name) && (track.state.solo || (!track.state.ignored && !track.state.muted))) {
        // Play regular kit sound
        if (currPad.kit && currPad.sound) {
          playSound(currPad.sound, track.audio.panning, track.audio.volume, newTimeline.settings.masterVolume);

          const soundboardPad = document.getElementById(`${track.name} ${currPad.kit}`);
          soundboardPad?.classList.add('scale-90');
          setTimeout(() => {
            soundboardPad?.classList.remove('scale-90');
          }, 100);
        }

        // Handle piano recording playback
        if (track.name === 'Piano' && track.pianoRecording && audioContext && column === 0) {
          // On first step, start piano recording playback
          const { notes } = track.pianoRecording;
          const trackBPM = track.audio.bpm || newTimeline.settings.BPM;
          const timelineLoopDuration = (60 / newTimeline.settings.BPM) * steps;
          const pianoSpeedMultiplier = trackBPM / newTimeline.settings.BPM;
          
          pianoStartTimeRef.current = audioContext.currentTime;
          
          // Clear any previously scheduled notes
          pianoScheduledNotesRef.current.forEach(id => clearTimeout(id));
          pianoScheduledNotesRef.current = [];
          
          // Schedule all notes with adjusted timing
          for (const pianoNote of notes) {
            const { note, octave, instrument, time } = pianoNote;
            const fullNote = `${note}${octave}`;
            const adjustedTime = time / pianoSpeedMultiplier;
            
            // Only schedule notes that fit within the timeline loop
            if (adjustedTime < timelineLoopDuration) {
              const instrumentPlayer = await getInstrument(instrument);
              if (instrumentPlayer) {
                const timeoutId = setTimeout(() => {
                  if (active) {
                    instrumentPlayer.play(fullNote, audioContext.currentTime, { 
                      gain: track.audio.volume * newTimeline.settings.masterVolume * 5.0
                    });
                  }
                }, adjustedTime * 1000) as unknown as number;
                pianoScheduledNotesRef.current.push(timeoutId);
              }
            }
          }
        }
      }
    }
    
    setTimeline(newTimeline);
    await new Promise(r => setTimeout(r, 60_000 / timeline.settings.BPM));
  }

  const playPath = <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />;
  const startTimeline = () => setActive(true);
  const stopPath = <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" />;
  const stopTimeline = () => {
    pianoScheduledNotesRef.current.forEach(id => clearTimeout(id));
    pianoScheduledNotesRef.current = [];
    setActive(false);
  };

  const clearTimeline = () => {
    const newTimeline = {...timeline};
    newTimeline.tracks.forEach((track: TimelineTrack) => {
      track.pads.forEach((pad: TimelinePad) => {
        pad.kit = null;
        pad.sound = null;
      });
    });
    setTimeline(newTimeline);
    setActive(false);
  }

  const shuffleTimeline = () => {
    clearTimeline();
    const newTimeline = {...timeline};
    newTimeline.tracks.forEach((track: TimelineTrack) => {
      track.pads.forEach((pad: TimelinePad) => {
        const isActive = Math.random() > 0.75;
        if (isActive) {
          const kit = Math.floor(Math.random() * 3) + 1;
          pad.kit = kit;
          const soundData = kits[kit - 1].find(sound => sound.type === track.name);
          if (soundData?.audio) {
            pad.sound = soundData.audio;
          }
        }
      });
    });
    setTimeline(newTimeline);
    setActive(false);
  }

  const exportTimeline = () => {
    const saveFile = JSON.stringify(timeline);
    const blob = new Blob([saveFile], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = `${'MyBeat'}.beat`;
    anchor.href = url;
    anchor.click();
  }

  const importTimeline = () => {
    setActive(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.beat';
    input.click();
    input.addEventListener('change', (event: any) => {
      const fr = new FileReader();
      fr.onload = (e: any) => {
        setBPM(JSON.parse(e.target.result).settings.BPM);
        setMasterVolume(JSON.parse(e.target.result).settings.masterVolume);
        setTimeline(JSON.parse(e.target.result));
      };
      fr.readAsText(event.target.files.item(0));
    });
  }

  const [modalContent, setModalContent] = useState(<div></div>);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [ignoreModal, setIgnoreModal] = useState(false);

  const availableInstruments = timeline.tracks.map(t => t.name);
  const availableToAdd = availableInstruments.filter(name => !visibleTracks.includes(name));

  const addTrack = (trackName: string) => {
    if (active) {
      setActive(false);
    }
    setVisibleTracks(prev => [...prev, trackName]);
    setModalVisibility(false);
  };

  const removeTrack = (trackName: string) => {
    setVisibleTracks(prev => prev.filter(name => name !== trackName));
  };

  const addTrackModalContent = (
    <div>
      <div className="bg-neo-lime border-4 border-black p-4 mb-4 shadow-brutal-sm">
        <h3 className="text-2xl font-black uppercase text-center">Add Instrument Track</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 max-h-64 overflow-y-auto">
        {availableToAdd.map(instrument => (
          <button
            key={instrument}
            className="bg-neo-pink border-4 border-black px-4 py-3 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            onClick={() => addTrack(instrument)}
          >
            {instrument}
          </button>
        ))}
        {availableToAdd.length === 0 && (
          <p className="col-span-2 text-center font-bold text-gray-600">All tracks added!</p>
        )}
      </div>
      <button
        className="bg-white border-4 border-black w-full py-3 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        onClick={() => setModalVisibility(false)}
      >
        CANCEL
      </button>
    </div>
  );

  const clearModalContent = (
    <div>
      <div className="bg-neo-pink border-4 border-black p-4 mb-4 shadow-brutal-sm">
        <h3 className="text-2xl font-black uppercase text-center">Clear Timeline?</h3>
      </div>
      <p className="text-lg font-bold mb-6 text-center">This will clear all pads!</p>
      <div className="flex gap-4 mb-5">
        <button
          className="bg-white border-4 border-black flex-1 py-3 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          onClick={() => setModalVisibility(false)}
        >
          NO
        </button>
        <button
          className="bg-neo-pink border-4 border-black flex-1 py-3 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          onClick={() => {
            clearTimeline();
            setModalVisibility(false);
          }}
        >
          YES
        </button>
      </div>
      <div className="flex justify-center items-center gap-2">
        <input id="ignore" name="ignore" type="checkbox" className="w-5 h-5" onChange={event => setIgnoreModal(event.target.checked)} />
        <label className="font-bold" htmlFor="ignore">Don't ask again</label>
      </div>
    </div>
  );

  const shuffleModalContent = (
    <div>
      <div className="bg-neo-cyan border-4 border-black p-4 mb-4 shadow-brutal-sm">
        <h3 className="text-2xl font-black uppercase text-center">Shuffle Timeline?</h3>
      </div>
      <p className="text-lg font-bold mb-6 text-center">This will randomize everything!</p>
      <div className="flex gap-4 mb-5">
        <button
          className="bg-white border-4 border-black flex-1 py-3 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          onClick={() => setModalVisibility(false)}
        >
          NO
        </button>
        <button
          className="bg-neo-lime border-4 border-black flex-1 py-3 font-black uppercase shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          onClick={() => {
            shuffleTimeline();
            setModalVisibility(false);
          }}
        >
          YES
        </button>
      </div>
      <div className="flex justify-center items-center gap-2">
        <input id="ignore" name="ignore" type="checkbox" className="w-5 h-5" onChange={event => setIgnoreModal(event.target.checked)} />
        <label className="font-bold" htmlFor="ignore">Don't ask again</label>
      </div>
    </div>
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        setActive(active => !active);
      }
      else if (event.code === 'Escape' && !event.repeat) setModalVisibility(false);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  useEffect(() => {
    const newTimeline = {...timeline};
    newTimeline.settings.BPM = BPM;
    newTimeline.settings.masterVolume = masterVolume;
    setTimeline(newTimeline);
  }, [BPM, masterVolume]);

  useEffect(() => {
    const newTimeline = {...timeline};
    newTimeline.tracks.forEach((track: TimelineTrack) => {
      const currentPads = track.pads.length;
      if (currentPads < steps) {
        for (let i = currentPads; i < steps; i++) {
          track.pads.push({ kit: null, sound: null, playing: false });
        }
      } else if (currentPads > steps) {
        track.pads = track.pads.slice(0, steps);
      }
    });
    setTimeline(newTimeline);
  }, [steps]);

  useEffect(() => {
    let valid: boolean;
    if (active) {
      valid = true;
      const play = async () => {
        while (valid)
          for (let column = 0; column < timeline.tracks[0]?.pads.length && valid; column++)
            await playColumn(column);
      }
      play();
    }

    return () => {
      valid = false;
      const newTimeline = {...timeline};
      newTimeline.tracks.forEach((track: TimelineTrack) => {
        track.pads.forEach((pad: TimelinePad) => {
          pad.playing = false;
        });
      });
      setTimeline(newTimeline);
    }
  }, [active]);

  return (
    <div className="bg-neo-purple border-6 border-black max-h-[500px] shadow-brutal-lg">
      <div className="h-full px-6 py-4">
        <div className="w-full h-full max-h-[450px]">
          <div className="flex sticky top-0 left-0 right-0 bg-neo-purple border-b-4 border-black z-10 py-3 font-black shadow-brutal-sm mb-3">
            <div className="w-[10%]">
              <div className="flex gap-3 justify-start">
                <MediaButton
                  svgPath={playPath}
                  color={'#00d9ff'}
                  role={startTimeline}
                  disabled={active}
                />
                <MediaButton
                  svgPath={stopPath}
                  color={'#ff006e'}
                  role={stopTimeline}
                  disabled={!active}
                />
              </div>
            </div>
            <div className="w-[65%] overflow-x-auto">
              <div className="flex gap-3 min-w-max text-white">
                {Array.from({ length: steps }, (_, i) => (
                  <span key={i} className="w-10 text-center">
                    {Math.floor(i / 4) + 1}.{(i % 4) + 1}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-[25%] flex gap-3 justify-end items-center text-white text-xs">
              <div className="w-[10px]"><span>S</span></div>
              <div className="w-[10px]"><span>M</span></div>
              <div><span>VOL</span></div>
              <div><span>PAN</span></div>
            </div>
          </div>
          
          <div ref={timelineSpace} className="overflow-y-auto max-h-[350px] scroll-smooth" onScroll={() => handleScroll()}>
            {timeline.tracks
              .filter(track => visibleTracks.includes(track.name))
              .map((track: TimelineTrack) => (
                <Track
                  key={track.name}
                  self={track}
                  soundsData={kits.map(kit => kit.find(sound => sound.type === track.name)).filter(Boolean) as Pad[]}
                  playSound={playSound}
                  timeline={timeline}
                  setTimeline={setTimeline}
                  onRemove={() => removeTrack(track.name)}
                />
              ))}
            {visibleTracks.length === 0 && (
              <div className="text-center py-8 text-white font-bold">
                No tracks added. Click "+ ADD TRACK" to get started!
              </div>
            )}
          </div>
          
          <div className="flex gap-4 pt-6 justify-center flex-wrap">
            <TimelineButton
              text={'+ ADD TRACK'}
              role={() => {
                setModalVisibility(true);
                setModalContent(addTrackModalContent);
              }}
            />
            <TimelineButton
              text={'CLEAR'}
              role={() => {
                if (!ignoreModal) {
                  setModalVisibility(true);
                  setModalContent(clearModalContent)
                } else clearTimeline();
              }}
            />
            <TimelineButton
              text={'SHUFFLE'}
              role={() => {
                if (!ignoreModal) {
                  setModalVisibility(true);
                  setModalContent(shuffleModalContent)
                } else shuffleTimeline();
              }}
            />
            <TimelineButton
              text={'SAVE'}
              role={exportTimeline}
            />
            <TimelineButton
              text={'LOAD'}
              role={importTimeline}
            />
          </div>
        </div>
      </div>
      
      <div className="py-2 bg-neo-purple border-t-4 border-black">
        <svg ref={downArrow} onClick={() => scrollToBottom()} className="fill-white w-[16px] m-auto transition-opacity cursor-pointer hover:fill-neo-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
          <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" />
        </svg>
      </div>
      
      <Modal visible={modalVisibility}>
        {modalContent}
      </Modal>
    </div>
  );
}

export default Timeline;
