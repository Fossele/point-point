import { useState } from 'react';
import { SoundEngine } from '../utils/soundEngine.js';

const audioEngine = new SoundEngine();

export function useSoundEngine() {
  const [soundMuted, setSoundMuted] = useState(false);

  const toggleSound = () => {
    audioEngine.muted = !soundMuted;
    setSoundMuted(!soundMuted);
  };

  return {
    audioEngine,
    soundMuted,
    toggleSound
  };
}