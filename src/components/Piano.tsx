import { useState, useEffect, useCallback } from 'react';
import * as Soundfont from 'soundfont-player';
import { PitchDetector } from 'pitchy';

type PianoNote = {
  note: string;
  octave: number;
  instrument: string;
  time: number;
}

type Props = {
  audioContext: AudioContext;
  onClose: () => void;
  analyzedSound: AudioBuffer | null;
  BPM: number;
  steps: number;
  onRecordingComplete?: (recordedNotes: PianoNote[], duration: number) => void;
}

// Define types for piano keys
type PianoKey = {
  note: string;
  octave: number;
}

const Piano = ({ audioContext, onClose, analyzedSound, BPM, steps, onRecordingComplete }: Props) => {
  const [instrument, setInstrument] = useState<Soundfont.Player | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string>('acoustic_grand_piano');
  const [volume, setVolume] = useState<number>(5.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string>('');
  const [currentSound, setCurrentSound] = useState<AudioBuffer | null>(null);
  const [soundMap, setSoundMap] = useState<{ [key: string]: AudioBuffer | null }>({});
  const [octaveRange, setOctaveRange] = useState({ start: 3, end: 5 });
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordStartTime, setRecordStartTime] = useState<number>(0);
  const [recordedNotes, setRecordedNotes] = useState<{ time: number; note: string; octave: number }[]>([]);

  // Available instruments
  const availableInstruments = [
    { value: 'acoustic_grand_piano', label: 'Acoustic Grand Piano' },
    { value: 'bright_acoustic_piano', label: 'Bright Acoustic Piano' },
    { value: 'electric_grand_piano', label: 'Electric Grand Piano' },
    { value: 'honky_tonk_piano', label: 'Honky-tonk Piano' },
    { value: 'electric_piano_1', label: 'Electric Piano 1' },
    { value: 'electric_piano_2', label: 'Electric Piano 2' },
    { value: 'harpsichord', label: 'Harpsichord' },
    { value: 'clavinet', label: 'Clavinet' },
    { value: 'celesta', label: 'Celesta' },
    { value: 'glockenspiel', label: 'Glockenspiel' },
    { value: 'music_box', label: 'Music Box' },
    { value: 'vibraphone', label: 'Vibraphone' },
    { value: 'marimba', label: 'Marimba' },
    { value: 'xylophone', label: 'Xylophone' },
    { value: 'tubular_bells', label: 'Tubular Bells' },
    { value: 'dulcimer', label: 'Dulcimer' },
  ];

  // Piano key mapping
  const generateKeys = (): { whiteKeys: PianoKey[], blackKeys: PianoKey[] } => {
    const whiteKeys: PianoKey[] = [];
    const blackKeys: PianoKey[] = [];
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackNotes = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];

    for (let octave = octaveRange.start; octave <= octaveRange.end; octave++) {
      notes.forEach(note => whiteKeys.push({ note, octave }));
      blackNotes.forEach(note => blackKeys.push({ note, octave }));
    }

    return { whiteKeys, blackKeys };
  };

  const { whiteKeys, blackKeys } = generateKeys();

  // Initialize piano
  useEffect(() => {
    const loadInstrument = async () => {
      setIsProcessing(true);
      try {
        const piano = await Soundfont.instrument(audioContext, selectedInstrument as any);
        setInstrument(piano);
      } catch (error) {
        console.error('Error loading instrument:', error);
      }
      setIsProcessing(false);
    };
    loadInstrument();
  }, [audioContext, selectedInstrument]);

  // Set current sound when analyzedSound changes
  useEffect(() => {
    if (analyzedSound) {
      setCurrentSound(analyzedSound);
      analyzeSound(analyzedSound);
    }
  }, [analyzedSound]);

  // Handle file selection and pitch detection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setCurrentSound(audioBuffer);
      analyzeSound(audioBuffer);
    } catch (error) {
      console.error('Error processing audio:', error);
    }
    
    setIsProcessing(false);
  };

  // Play the current sound with pitch shifting
  const playCurrentSound = (pitch = 1) => {
    if (!currentSound) return;

    const source = audioContext.createBufferSource();
    source.buffer = currentSound;
    source.playbackRate.value = pitch;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode).connect(audioContext.destination);
    source.start(0);
  };

  // Map sound to note
  const mapSoundToNote = (note: string) => {
    if (!currentSound) return;
    
    const newSoundMap = { ...soundMap };
    newSoundMap[note] = currentSound;
    setSoundMap(newSoundMap);
  };

  // Analyze sound buffer
  const analyzeSound = (audioBuffer: AudioBuffer) => {
    setIsProcessing(true);
    
    try {
      // Create detector
      const detector = PitchDetector.forFloat32Array(audioBuffer.length);
      const float32Array = new Float32Array(audioBuffer.length);
      audioBuffer.copyFromChannel(float32Array, 0);
      
      // Detect pitch
      const [pitch] = detector.findPitch(float32Array, audioBuffer.sampleRate);
      
      // Convert frequency to note
      const note = frequencyToNote(pitch);
      setDetectedNote(note);
      
      // Automatically map sound to detected note
      const newSoundMap = { ...soundMap };
      newSoundMap[note] = audioBuffer;
      setSoundMap(newSoundMap);
    } catch (error) {
      console.error('Error analyzing sound:', error);
    }
    
    setIsProcessing(false);
  };

  // Convert frequency to musical note
  const frequencyToNote = (frequency: number): string => {
    const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const c0 = 16.35;
    const numberOfOctaves = Math.log2(frequency / c0);
    const octave = Math.floor(numberOfOctaves);
    const n = Math.round(12 * numberOfOctaves) % 12;
    return noteStrings[n] + octave;
  };

  // Calculate pitch ratio between notes
  const getPitchRatio = (fromNote: string, toNote: string): number => {
    // Get note and octave from the notes
    const fromMatch = fromNote.match(/([A-G]#?)(\d+)/) || ['', 'C', '4'];
    const toMatch = toNote.match(/([A-G]#?)(\d+)/) || ['', 'C', '4'];
    
    const fromNoteName = fromMatch[1];
    const fromOctave = parseInt(fromMatch[2]);
    const toNoteName = toMatch[1];
    const toOctave = parseInt(toMatch[2]);

    // Define note frequencies for middle octave (4)
    const noteToFreq: { [key: string]: number } = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };

    // Calculate base frequencies
    const fromFreq = noteToFreq[fromNoteName];
    const toFreq = noteToFreq[toNoteName];
    
    // Apply octave shift
    const octaveDiff = toOctave - fromOctave;
    return (toFreq / fromFreq) * Math.pow(2, octaveDiff);
  };

  // Play note
  const playNote = useCallback((note: string, octave: number) => {
    const fullNote = `${note}${octave}`;
    
    // Record the note if recording
    if (isRecording) {
      const currentTime = audioContext.currentTime - recordStartTime;
      setRecordedNotes(prev => [...prev, { time: currentTime, note, octave }]);
    }
    
    // If we have a mapped sound for this note, play it
    if (soundMap[fullNote]) {
      const source = audioContext.createBufferSource();
      source.buffer = soundMap[fullNote];
      
      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume;
      
      source.connect(gainNode).connect(audioContext.destination);
      source.start(0);
    } 
    // If we have a current sound and detected note, pitch shift it
    else if (currentSound && detectedNote) {
      const pitchRatio = getPitchRatio(detectedNote, fullNote);
      playCurrentSound(pitchRatio);
    }
    // Otherwise fall back to piano sound
    else if (instrument) {
      instrument.play(fullNote, audioContext.currentTime, { gain: volume });
    }
  }, [instrument, soundMap, currentSound, detectedNote, audioContext, volume, isRecording, recordStartTime]);

  // Handle keyboard events
  useEffect(() => {
    const keyMap: { [key: string]: { note: string, octave: number } } = {
      'a': { note: 'C', octave: octaveRange.start + 1 },
      'w': { note: 'C#', octave: octaveRange.start + 1 },
      's': { note: 'D', octave: octaveRange.start + 1 },
      'e': { note: 'D#', octave: octaveRange.start + 1 },
      'd': { note: 'E', octave: octaveRange.start + 1 },
      'f': { note: 'F', octave: octaveRange.start + 1 },
      't': { note: 'F#', octave: octaveRange.start + 1 },
      'g': { note: 'G', octave: octaveRange.start + 1 },
      'y': { note: 'G#', octave: octaveRange.start + 1 },
      'h': { note: 'A', octave: octaveRange.start + 1 },
      'u': { note: 'A#', octave: octaveRange.start + 1 },
      'j': { note: 'B', octave: octaveRange.start + 1 },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const mapping = keyMap[e.key.toLowerCase()];
      if (mapping && !e.repeat) {
        playNote(mapping.note, mapping.octave);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playNote, octaveRange]);

  // Handle octave range changes
  const handleOctaveChange = (direction: 'up' | 'down') => {
    setOctaveRange(prev => {
      if (direction === 'up' && prev.end < 7) {
        return { start: prev.start + 1, end: prev.end + 1 };
      } else if (direction === 'down' && prev.start > 0) {
        return { start: prev.start - 1, end: prev.end - 1 };
      }
      return prev;
    });
  };

  // Start recording
  const startRecording = () => {
    setRecordedNotes([]);
    setRecordStartTime(audioContext.currentTime);
    setIsRecording(true);
  };

  // Stop recording and send raw timing data
  const stopRecording = () => {
    setIsRecording(false);
    
    if (recordedNotes.length === 0 || !onRecordingComplete) return;

    // Calculate total duration
    const duration = recordedNotes.length > 0 
      ? Math.max(...recordedNotes.map(n => n.time)) 
      : 0;
    
    // Create piano notes with exact timing
    const pianoNotes: PianoNote[] = recordedNotes.map(({ time, note, octave }) => ({
      note,
      octave,
      instrument: selectedInstrument,
      time
    }));
    
    onRecordingComplete(pianoNotes, duration);
    setRecordedNotes([]);
  };

  return (
    <div className="bg-primary p-6 rounded-lg shadow-xl w-[800px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-secondary">Piano</h2>
        <button 
          onClick={onClose}
          className="text-secondary hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-light-gray mb-2">
            Select Instrument
          </label>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
            className="w-full px-3 py-2 bg-secondary text-primary rounded-md font-bold"
          >
            {availableInstruments.map(inst => (
              <option key={inst.value} value={inst.value}>
                {inst.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-light-gray mb-2">
            Volume: {volume.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-light-gray mb-2">
            Upload Sound (WAV)
          </label>
          <input
            type="file"
            accept=".wav"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 bg-secondary text-primary rounded-md"
          />
        </div>
        
        {isProcessing && (
          <div className="text-secondary">Processing sound...</div>
        )}
        
        {detectedNote && (
          <div className="text-secondary mb-4">
            Detected Note: <span className="font-bold">{detectedNote}</span>
          </div>
        )}

        {currentSound && (
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => playCurrentSound()}
              className="bg-secondary text-primary px-4 py-2 rounded-md font-bold hover:brightness-90"
            >
              Play Sound
            </button>
            <button
              onClick={() => mapSoundToNote(detectedNote)}
              className="bg-secondary text-primary px-4 py-2 rounded-md font-bold hover:brightness-90"
            >
              Map to Note
            </button>
          </div>
        )}

        <div className="flex gap-4 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-md font-bold text-white ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRecording ? '⏹ Stop Recording' : '⏺ Record to Timeline'}
          </button>
          {recordedNotes.length > 0 && !isRecording && (
            <span className="text-secondary font-bold py-3">
              {recordedNotes.length} notes recorded
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Octave Controls */}
        <div className="flex justify-between mb-2">
          <button
            onClick={() => handleOctaveChange('down')}
            disabled={octaveRange.start <= 0}
            className={`bg-secondary text-primary px-3 py-1 rounded ${
              octaveRange.start <= 0 ? 'opacity-50' : 'hover:brightness-90'
            }`}
          >
            ← Octave Down
          </button>
          <span className="text-secondary">
            Octaves: {octaveRange.start}-{octaveRange.end}
          </span>
          <button
            onClick={() => handleOctaveChange('up')}
            disabled={octaveRange.end >= 7}
            className={`bg-secondary text-primary px-3 py-1 rounded ${
              octaveRange.end >= 7 ? 'opacity-50' : 'hover:brightness-90'
            }`}
          >
            Octave Up →
          </button>
        </div>

        {/* Piano Keys */}
        <div className="overflow-x-auto">
          <div className="relative h-48 bg-secondary rounded-lg p-2" style={{ width: `${whiteKeys.length * 50}px` }}>
            {/* White keys */}
            <div className="flex h-full">
              {whiteKeys.map(({ note, octave }, i) => (
                <button
                  key={`${note}${octave}`}
                  onClick={() => playNote(note, octave)}
                  className={`flex-1 bg-white border border-gray-300 rounded-sm hover:bg-gray-100 active:bg-gray-200 ${
                    soundMap[`${note}${octave}`] ? 'border-blue-500 border-2' : ''
                  }`}
                >
                  <span className="text-xs text-gray-400">{`${note}${octave}`}</span>
                </button>
              ))}
            </div>
            
            {/* Black keys */}
            <div className="absolute top-2 left-0 right-0 flex">
              {blackKeys.map(({ note, octave }, i) => (
                note ? (
                  <div
                    key={`${note}${octave}`}
                    className="flex-1 flex justify-center"
                  >
                    <button
                      onClick={() => note && playNote(note, octave)}
                      className={`w-1/2 h-24 -mx-[1.1rem] bg-gray-800 rounded-sm hover:bg-gray-700 active:bg-gray-600 ${
                        soundMap[`${note}${octave}`] ? 'border-blue-500 border-2' : ''
                      }`}
                    >
                      <span className="text-xs text-gray-400">{`${note}${octave}`}</span>
                    </button>
                  </div>
                ) : <div key={i} className="flex-1" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-light-gray">
        Keyboard shortcuts: A-L keys for white notes, W/E/T/Y/U for black notes
      </div>
    </div>
  );
};

export default Piano;