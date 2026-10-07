import { useCallback } from 'react';
import tapSoundUrl from '../sounds/tapsound.mp3';

// One shared AudioContext and decoded buffer (Plan.md A10). Browsers only allow audio after
// a user gesture, so `unlock` is called from Start and from pointer-up on the coin.
// Without Web Audio, a small pool of <audio> elements is used instead.

type AudioCtor = typeof AudioContext;

let context: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading = false;
let pool: HTMLAudioElement[] | null = null;
let poolIndex = 0;

function audioCtor(): AudioCtor | null {
  if (typeof AudioContext !== 'undefined') return AudioContext;
  return (window as Window & { webkitAudioContext?: AudioCtor }).webkitAudioContext ?? null;
}

function unlock(): void {
  try {
    const Ctor = audioCtor();
    if (!Ctor) {
      pool ??= Array.from({ length: 4 }, () => {
        const a = new Audio(tapSoundUrl);
        a.preload = 'auto';
        return a;
      });
      return;
    }
    context ??= new Ctor();
    if (context.state === 'suspended') void context.resume().catch(() => undefined);
    if (!buffer && !loading) {
      loading = true;
      const ctx = context;
      fetch(tapSoundUrl)
        .then((r) => r.arrayBuffer())
        .then((data) => new Promise<AudioBuffer>((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
        .then((decoded) => { buffer = decoded; })
        .catch(() => { loading = false; }); // retry on the next gesture
    }
  } catch {
    // Sound is optional; never break a tap over it.
  }
}

function play(): void {
  try {
    if (context && buffer) {
      if (context.state === 'suspended') void context.resume().catch(() => undefined);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start();
    } else if (pool) {
      const a = pool[poolIndex];
      poolIndex = (poolIndex + 1) % pool.length;
      a.currentTime = 0;
      void a.play().catch(() => undefined);
    }
  } catch {
    // ignored: see unlock()
  }
}

export function useTapSound(muted: boolean) {
  const playIfOn = useCallback(() => {
    if (!muted) play();
  }, [muted]);
  return { play: playIfOn, unlock };
}
