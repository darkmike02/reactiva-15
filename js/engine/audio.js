// Motor de audio suave (Web Audio API)
let ctx = null;
let enabled = true;

function ensureCtx() {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

function playTone(freq, duration = 0.22, gainVal = 0.14, delay = 0, type = 'sine') {
  const audio = ensureCtx();
  if (!audio) return;
  const now = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.03);
}

export const SoundEngine = {
  setEnabled(val) {
    enabled = !!val;
  },
  isEnabled() {
    return enabled;
  },
  playStart() {
    playTone(440, 0.22, 0.12, 0);
    playTone(554.37, 0.28, 0.13, 0.1);
  },
  playTick() {
    playTone(659.25, 0.12, 0.09, 0);
  },
  playRest() {
    playTone(523.25, 0.2, 0.11, 0);
    playTone(392.0, 0.28, 0.11, 0.12);
  },
  playFinish() {
    playTone(392.0, 0.28, 0.12, 0);
    playTone(493.88, 0.28, 0.12, 0.14);
    playTone(587.33, 0.32, 0.13, 0.28);
    playTone(783.99, 0.55, 0.15, 0.44);
  }
};