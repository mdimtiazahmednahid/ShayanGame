import { soundEngine } from './soundEngine';

export type VoiceState = 'off' | 'ready' | 'listening' | 'speaking' | 'error';

export interface VoiceMimicCallbacks {
  onStateChange: (state: VoiceState, errorMsg?: string) => void;
  onMouthLevel: (level: number) => void;
  onMicLevel: (level: number) => void;
}

export class VoiceMimic {
  private stream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private playbackAnalyser: AnalyserNode | null = null;
  private activePlayback: AudioBufferSourceNode | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private rafId: number | null = null;

  private state: VoiceState = 'off';
  private pitchRate = 1.36; // Cute Talking-Tom pitch
  private isRecording = false;
  private lastSpeechTime = 0;
  private recordStartTime = 0;
  private callbacks: VoiceMimicCallbacks;

  private readonly SPEECH_THRESHOLD = 0.035;
  private readonly SILENCE_TIMEOUT_MS = 850;
  private readonly MAX_RECORD_MS = 8000;

  constructor(callbacks: VoiceMimicCallbacks) {
    this.callbacks = callbacks;
  }

  public setPitchRate(rate: number) {
    this.pitchRate = rate;
  }

  public async start(): Promise<void> {
    if (this.state === 'ready' || this.state === 'listening' || this.state === 'speaking') {
      return;
    }

    try {
      const ctx = soundEngine.getContext();
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micSource = ctx.createMediaStreamSource(this.stream);
      this.micAnalyser = ctx.createAnalyser();
      this.micAnalyser.fftSize = 512;
      this.micSource.connect(this.micAnalyser);

      this.setState('ready');
      this.startLoop();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone permission denied';
      this.setState('error', msg);
    }
  }

  public stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    if (this.activePlayback) {
      try {
        this.activePlayback.stop();
      } catch {
        // ignore if already stopped
      }
      this.activePlayback = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.micSource = null;
    this.micAnalyser = null;
    this.playbackAnalyser = null;
    this.isRecording = false;
    this.callbacks.onMouthLevel(0);
    this.callbacks.onMicLevel(0);
    this.setState('off');
  }

  private setState(next: VoiceState, errorMsg?: string) {
    this.state = next;
    this.callbacks.onStateChange(next, errorMsg);
  }

  private startLoop() {
    const timeData = new Uint8Array(512);

    const tick = () => {
      this.rafId = requestAnimationFrame(tick);

      if (this.state === 'speaking' && this.playbackAnalyser) {
        this.playbackAnalyser.getByteTimeDomainData(timeData);
        const rms = this.computeRms(timeData);
        // Amplify slightly for expressive lip-sync
        const mouth = Math.min(1, Math.max(0, (rms - 0.01) * 5.2));
        this.callbacks.onMouthLevel(mouth);
        this.callbacks.onMicLevel(0);
        return;
      }

      if (!this.micAnalyser) return;
      this.micAnalyser.getByteTimeDomainData(timeData);
      const rms = this.computeRms(timeData);
      this.callbacks.onMicLevel(Math.min(1, rms * 6));

      const now = performance.now();

      if (this.state === 'ready' && rms > this.SPEECH_THRESHOLD) {
        this.beginRecording();
      } else if (this.state === 'listening' && this.isRecording) {
        if (rms > this.SPEECH_THRESHOLD * 0.75) {
          this.lastSpeechTime = now;
        }
        const silentFor = now - this.lastSpeechTime;
        const recordedFor = now - this.recordStartTime;
        if (silentFor > this.SILENCE_TIMEOUT_MS || recordedFor > this.MAX_RECORD_MS) {
          this.finishRecording();
        }
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private computeRms(data: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    return Math.sqrt(sum / data.length);
  }

  private beginRecording() {
    if (!this.stream || this.isRecording) return;

    this.chunks = [];
    this.isRecording = true;
    this.recordStartTime = performance.now();
    this.lastSpeechTime = this.recordStartTime;

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

    this.recorder = mimeType
      ? new MediaRecorder(this.stream, { mimeType })
      : new MediaRecorder(this.stream);

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.recorder.onstop = () => {
      void this.playRecordedClip();
    };

    this.recorder.start(100);
    this.setState('listening');
  }

  private finishRecording() {
    if (!this.isRecording || !this.recorder) return;
    this.isRecording = false;
    if (this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
  }

  private async playRecordedClip() {
    if (this.chunks.length === 0) {
      if (this.stream) this.setState('ready');
      return;
    }

    try {
      const blob = new Blob(this.chunks, { type: this.recorder?.mimeType || 'audio/webm' });
      const arrayBuf = await blob.arrayBuffer();
      const ctx = soundEngine.getContext();
      const audioBuf = await ctx.decodeAudioData(arrayBuf);

      // Ignore ultra-short accidental clicks (< 180ms)
      if (audioBuf.duration < 0.18) {
        if (this.stream) this.setState('ready');
        return;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuf;
      source.playbackRate.value = this.pitchRate;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;

      const gain = ctx.createGain();
      gain.gain.value = 1.25;

      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);

      this.playbackAnalyser = analyser;
      this.activePlayback = source;
      this.setState('speaking');

      source.onended = () => {
        this.activePlayback = null;
        this.playbackAnalyser = null;
        this.callbacks.onMouthLevel(0);
        if (this.stream) {
          this.setState('ready');
        }
      };

      source.start();
    } catch {
      this.callbacks.onMouthLevel(0);
      if (this.stream) this.setState('ready');
    }
  }
}
