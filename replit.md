# Treackter - Digital Audio Workstation

## Overview
Treackter is a React-based Digital Audio Workstation (DAW) that runs entirely in the browser. It allows users to create beats and music using an interactive soundboard, timeline sequencer, and various sound kits.

## Project Type
- **Framework**: React 18 with TypeScript
- **Build Tool**: Create React App (react-scripts)
- **Styling**: Tailwind CSS
- **Audio Libraries**: soundfont-player, pitchy

## Features
- **Home page with music posts** - Browse curated beat showcases with tags and descriptions
- **Persistent navigation** - Switch between Home and Studio views with navigation bar
- **Piano recording** - Record piano performances with exact timing preservation
  - Choose from 16 different instruments (pianos, keyboards, mallets)
  - Adjustable volume control for piano playback (5x louder)
  - Independent BPM control (60-480 BPM) - piano can play at different tempo than main timeline
  - Real-time recording captures exact note timing
  - Plays back your performance with precise timing
- BPM modifier for tempo control
- Master volume control
- Interactive soundboard for real-time sample playback
- Timeline sequencer with 4-bar loop
- 3 different sound kits with 10 instruments each
- Per-track controls: solo, mute, volume, and panning
- Random beat generator
- Import/export track functionality (.beat files)

## Project Structure
```
├── public/              # Static assets
│   └── sounds/          # Audio sample kits (kit1, kit2, kit3)
├── src/
│   ├── components/      # React components
│   │   ├── DAW.tsx      # Main DAW component
│   │   ├── Piano.tsx    # Virtual piano/keyboard
│   │   ├── Soundboard.tsx # Interactive sample pad
│   │   ├── Timeline.tsx # Sequencer timeline
│   │   └── ...          # Other UI components
│   ├── json/            # Configuration files for sound kits
│   └── index.tsx        # App entry point
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Setup & Running

### Development
The app runs on port 5000 with hot-reloading enabled.
- Start command: `npm start`
- The dev server is configured to work with Replit's proxy system via `.env.local`

### Configuration Files
- `.env.local` - Environment variables for CRA dev server
  - `HOST=0.0.0.0` - Binds to all interfaces
  - `PORT=5000` - Runs on port 5000
  - `DANGEROUSLY_DISABLE_HOST_CHECK=true` - Allows Replit proxy
  - `WDS_SOCKET_PORT=0` - Enables WebSocket for hot reload through proxy

## Dependencies
**Main:**
- react & react-dom (v18.2.0)
- react-scripts (v5.0.1) - CRA tooling
- soundfont-player (v0.12.0) - Audio playback
- pitchy (v4.1.0) - Audio analysis
- typescript (v4.9.4)

**Dev:**
- tailwindcss (v3.2.4)
- postcss & autoprefixer

## Known Issues
- Some ESLint warnings for React hooks dependencies (non-critical)
- Missing source map warning for midimessage library (doesn't affect functionality)

## Recent Changes
- October 18, 2025: Piano continuous recording system
  - Complete redesign: Piano now records and plays back as a continuous performance
  - Exact timing preservation - notes play back at the same timing they were recorded
  - Independent BPM control (60-480 BPM) for piano track
  - Single-line piano track display (not step-sequenced like drums)
  - Increased piano volume from 2.5 to 5.0 for better audibility
  - Piano playback gain multiplier increased to 5.0
- October 18, 2025: Piano recording feature
  - Added piano recording functionality with timeline integration
  - Implemented instrument selection (16 instruments available)
  - Added volume control for piano playback
  - Auto-quantization of recorded notes to timeline grid
  - Piano track automatically visible on timeline after recording
  - Timeline playback stops when new tracks are added
- October 17, 2025: Initial Replit setup
  - Configured environment for Replit proxy support
  - Updated .gitignore for CRA best practices
  - Set up workflow for port 5000

## Usage
1. Use the soundboard (keyboard or mouse) to preview samples
2. Click pads in the timeline to create patterns
3. Adjust per-track controls (volume, panning, solo/mute)
4. Set global BPM and master volume
5. Use Piano feature to record melodies:
   - Click the "Piano" button to open the piano interface
   - Select your desired instrument from the dropdown
   - Adjust volume slider as needed
   - Click "Record to Timeline" and play your melody on the virtual piano
   - Click "Stop Recording" when done
   - Your performance will be added to the Piano track with exact timing
   - Use the BPM knob on the piano track (60-480) to change piano playback speed independently
6. Save/load projects as .beat files
