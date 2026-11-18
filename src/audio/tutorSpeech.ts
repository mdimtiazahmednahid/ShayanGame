import { soundEngine } from './soundEngine';

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

function getAllVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  const current = window.speechSynthesis.getVoices();
  if (current.length > 0) {
    cachedVoices = current;
  }
  return cachedVoices;
}

function findBanglaVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const bnVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('bn') ||
      v.name.toLowerCase().includes('bengali') ||
      v.name.toLowerCase().includes('bangla') ||
      v.name.includes('বাংলা')
  );
  return (
    bnVoices.find((v) => v.lang.toLowerCase() === 'bn-bd' && v.name.toLowerCase().includes('google')) ||
    bnVoices.find((v) => v.lang.toLowerCase() === 'bn-bd') ||
    bnVoices.find((v) => v.name.toLowerCase().includes('google')) ||
    bnVoices[0]
  );
}

function pickBestVoice(
  voices: SpeechSynthesisVoice[],
  lang: 'en-US' | 'bn-BD'
): SpeechSynthesisVoice | undefined {
  if (lang === 'bn-BD') {
    return findBanglaVoice(voices);
  }
  return (
    voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) ||
    voices.find((v) => v.lang.startsWith('en') && v.localService) ||
    voices.find((v) => v.lang.startsWith('en'))
  );
}

export function speakTutorText(
  text: string,
  lang: 'en-US' | 'bn-BD',
  cutePitch: boolean,
  onMouthLevel: (level: number) => void,
  onStart?: () => void,
  onEnd?: () => void
): () => void {
  let cancelled = false;
  let activeSource: AudioBufferSourceNode | null = null;
  let rafId = 0;

  const stopAll = () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    if (activeSource) {
      try {
        activeSource.stop();
      } catch {
        // ignore if already stopped
      }
      activeSource = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onMouthLevel(0);
  };

  // Use local TTS proxy for natural human-sounding speech (both Bangla & English) + real waveform lip-sync
  const ttsLang = lang === 'bn-BD' ? 'bn' : 'en';
  (async () => {
    try {
      const res = await fetch(
        `/api/tts?lang=${ttsLang}&text=${encodeURIComponent(text)}`
      );
      if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      if (cancelled) return;

      const ctx = soundEngine.getContext();
      const audioBuf = await ctx.decodeAudioData(arrayBuf);
      if (cancelled) return;

      const source = ctx.createBufferSource();
      source.buffer = audioBuf;
      // Keep tutor voice at natural 1.0x speed/pitch so students enjoy listening
      source.playbackRate.value = 1.0;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;

      const gain = ctx.createGain();
      gain.gain.value = 1.25;

      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);

      activeSource = source;
      onStart?.();

      const timeData = new Uint8Array(512);
      const tick = () => {
        if (cancelled || !activeSource) return;
        analyser.getByteTimeDomainData(timeData);
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const v = (timeData[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / timeData.length);
        const mouth = Math.min(0.82, Math.max(0, (rms - 0.012) * 4.4));
        onMouthLevel(mouth);
        rafId = requestAnimationFrame(tick);
      };

      source.onended = () => {
        activeSource = null;
        cancelAnimationFrame(rafId);
        onMouthLevel(0);
        onEnd?.();
      };

      source.start();
      rafId = requestAnimationFrame(tick);
    } catch {
      if (!cancelled) {
        speakWithWebSpeech(text, lang, cutePitch, onMouthLevel, onStart, onEnd);
      }
    }
  })();

  return stopAll;
}

function speakWithWebSpeech(
  text: string,
  lang: 'en-US' | 'bn-BD',
  cutePitch: boolean,
  onMouthLevel: (level: number) => void,
  onStart?: () => void,
  onEnd?: () => void
): () => void {
  if (!('speechSynthesis' in window)) {
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const utter = new SpeechSynthesisUtterance(text);
  const voices = getAllVoices();
  const chosen = pickBestVoice(voices, lang);

  if (chosen) {
    utter.voice = chosen;
    utter.lang = chosen.lang;
  } else {
    utter.lang = lang;
  }

  if (lang === 'bn-BD') {
    utter.rate = 0.94;
    utter.pitch = 1.0;
  } else {
    utter.rate = 0.96;
    utter.pitch = cutePitch ? 1.18 : 1.0;
  }

  let rafId = 0;
  let speaking = true;
  const startTime = performance.now();

  const animateLipSync = (now: number) => {
    if (!speaking) return;
    const t = (now - startTime) / 1000;
    const wave =
      0.38 +
      0.26 * Math.sin(t * 14) +
      0.16 * Math.sin(t * 23 + 1.1);
    onMouthLevel(Math.max(0.08, Math.min(0.78, wave)));
    rafId = requestAnimationFrame(animateLipSync);
  };

  utter.onstart = () => {
    onStart?.();
    rafId = requestAnimationFrame(animateLipSync);
  };

  const cleanup = () => {
    speaking = false;
    cancelAnimationFrame(rafId);
    onMouthLevel(0);
    onEnd?.();
  };

  utter.onend = cleanup;
  utter.onerror = cleanup;

  window.speechSynthesis.speak(utter);

  return () => {
    speaking = false;
    cancelAnimationFrame(rafId);
    window.speechSynthesis.cancel();
    onMouthLevel(0);
  };
}
