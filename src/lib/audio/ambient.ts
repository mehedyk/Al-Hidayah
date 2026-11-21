/**
 * Calm sounds, synthesised live with the Web Audio API (no audio files, nothing downloaded, no
 * licensing questions). Each layer is built from filtered noise and slow modulation, so they can
 * be mixed freely. Only natural sounds are offered: no music, no instruments.
 */
export type LayerId = 'rain' | 'wind' | 'stream' | 'waves' | 'birds' | 'crickets';

export const layers: Array<{ id: LayerId; name: string; hint: string }> = [
  { id: 'rain', name: 'Rain', hint: 'Steady rainfall' },
  { id: 'wind', name: 'Wind', hint: 'Slow, shifting breeze' },
  { id: 'stream', name: 'Stream', hint: 'Running water' },
  { id: 'waves', name: 'Ocean waves', hint: 'Surf rolling in' },
  { id: 'birds', name: 'Morning birds', hint: 'Distant birdsong' },
  { id: 'crickets', name: 'Night crickets', hint: 'Warm evening hush' },
];

export interface Mix {
  master: number;
  levels: Record<LayerId, number>;
}

export const emptyMix: Mix = {
  master: 0.7,
  levels: { rain: 0, wind: 0, stream: 0, waves: 0, birds: 0, crickets: 0 },
};

export const presets: Array<{ name: string; mix: Mix }> = [
  {
    name: 'Rainy window',
    mix: { master: 0.7, levels: { ...emptyMix.levels, rain: 0.7, wind: 0.2 } },
  },
  {
    name: 'Forest morning',
    mix: { master: 0.7, levels: { ...emptyMix.levels, birds: 0.5, stream: 0.4, wind: 0.2 } },
  },
  {
    name: 'Shoreline',
    mix: { master: 0.7, levels: { ...emptyMix.levels, waves: 0.7, wind: 0.3, birds: 0.15 } },
  },
  {
    name: 'Quiet night',
    mix: { master: 0.6, levels: { ...emptyMix.levels, crickets: 0.5, wind: 0.25, stream: 0.2 } },
  },
];

const KEY = 'al-hidayah:sound-mix:v1';

export function sanitizeMix(value: unknown): Mix {
  const mix: Mix = { master: emptyMix.master, levels: { ...emptyMix.levels } };
  if (!value || typeof value !== 'object') return mix;
  const source = value as { master?: unknown; levels?: Record<string, unknown> };
  const clamp = (n: unknown, fallback: number) =>
    typeof n === 'number' && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
  mix.master = clamp(source.master, mix.master);
  for (const { id } of layers) mix.levels[id] = clamp(source.levels?.[id], 0);
  return mix;
}

export function loadMix(): Mix {
  try {
    return sanitizeMix(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return sanitizeMix(null);
  }
}

export function saveMix(mix: Mix): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(mix));
  } catch {
    // Storage may be blocked; the mix simply will not be remembered.
  }
}

function noiseBuffer(context: AudioContext, kind: 'white' | 'pink' | 'brown'): AudioBuffer {
  const length = context.sampleRate * 4;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === 'white') data[i] = white;
    else if (kind === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

interface Running {
  gain: GainNode;
  stop: () => void;
}

class AmbientMixer {
  private context?: AudioContext;
  private master?: GainNode;
  private running = new Map<LayerId, Running>();
  private buffers = new Map<string, AudioBuffer>();
  private timer?: ReturnType<typeof setTimeout>;
  mix: Mix = sanitizeMix(null);

  private ctx(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = this.mix.master;
      this.master.connect(this.context.destination);
    }
    return this.context;
  }

  private buffer(kind: 'white' | 'pink' | 'brown'): AudioBuffer {
    let cached = this.buffers.get(kind);
    if (!cached) {
      cached = noiseBuffer(this.ctx(), kind);
      this.buffers.set(kind, cached);
    }
    return cached;
  }

  private source(kind: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
    const node = this.ctx().createBufferSource();
    node.buffer = this.buffer(kind);
    node.loop = true;
    node.loopStart = Math.random() * 2;
    return node;
  }

  private lfo(rate: number, depth: number, target: AudioParam): OscillatorNode {
    const context = this.ctx();
    const osc = context.createOscillator();
    const amount = context.createGain();
    osc.frequency.value = rate;
    amount.gain.value = depth;
    osc.connect(amount).connect(target);
    osc.start();
    return osc;
  }

  private build(id: LayerId): Running {
    const context = this.ctx();
    const out = context.createGain();
    out.gain.value = 0;
    out.connect(this.master as GainNode);
    const nodes: Array<AudioScheduledSourceNode> = [];
    const timers: Array<ReturnType<typeof setInterval>> = [];
    const chain = (node: AudioNode, ...rest: AudioNode[]) =>
      rest.reduce((previous, next) => (previous.connect(next), next), node);

    if (id === 'rain') {
      const hiss = this.source('white');
      const high = context.createBiquadFilter();
      high.type = 'highpass';
      high.frequency.value = 1200;
      const low = context.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = 9000;
      const body = this.source('pink');
      const bodyFilter = context.createBiquadFilter();
      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.value = 500;
      const bodyGain = context.createGain();
      bodyGain.gain.value = 0.5;
      chain(hiss, high, low, out);
      chain(body, bodyFilter, bodyGain, out);
      nodes.push(hiss, body);
    } else if (id === 'wind') {
      const noise = this.source('pink');
      const band = context.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = 0.9;
      band.frequency.value = 450;
      const swell = context.createGain();
      swell.gain.value = 0.7;
      chain(noise, band, swell, out);
      nodes.push(noise, this.lfo(0.07, 220, band.frequency), this.lfo(0.11, 0.3, swell.gain));
    } else if (id === 'stream') {
      const noise = this.source('white');
      const band = context.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 1800;
      band.Q.value = 0.6;
      const babble = context.createGain();
      babble.gain.value = 0.55;
      chain(noise, band, babble, out);
      const second = this.source('pink');
      const high = context.createBiquadFilter();
      high.type = 'highpass';
      high.frequency.value = 700;
      const secondGain = context.createGain();
      secondGain.gain.value = 0.4;
      chain(second, high, secondGain, out);
      nodes.push(
        noise,
        second,
        this.lfo(0.9, 0.18, babble.gain),
        this.lfo(0.37, 400, band.frequency),
      );
    } else if (id === 'waves') {
      const noise = this.source('brown');
      const low = context.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = 900;
      const surge = context.createGain();
      surge.gain.value = 0.55;
      chain(noise, low, surge, out);
      const foam = this.source('white');
      const foamFilter = context.createBiquadFilter();
      foamFilter.type = 'highpass';
      foamFilter.frequency.value = 2500;
      const foamGain = context.createGain();
      foamGain.gain.value = 0.12;
      chain(foam, foamFilter, foamGain, out);
      nodes.push(
        noise,
        foam,
        this.lfo(0.1, 0.45, surge.gain),
        this.lfo(0.1, 0.1, foamGain.gain),
        this.lfo(0.1, 500, low.frequency),
      );
    } else if (id === 'birds') {
      const chirp = () => {
        if (context.state !== 'running') return;
        const start = context.currentTime + Math.random() * 0.2;
        const count = 1 + Math.floor(Math.random() * 4);
        const base = 2200 + Math.random() * 2400;
        for (let i = 0; i < count; i += 1) {
          const osc = context.createOscillator();
          const env = context.createGain();
          const t = start + i * 0.13;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(base, t);
          osc.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.5), t + 0.08);
          env.gain.setValueAtTime(0, t);
          env.gain.linearRampToValueAtTime(0.16, t + 0.015);
          env.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          chain(osc, env, out);
          osc.start(t);
          osc.stop(t + 0.12);
        }
      };
      timers.push(setInterval(() => Math.random() < 0.55 && chirp(), 1400));
    } else {
      const chirp = () => {
        if (context.state !== 'running') return;
        const start = context.currentTime;
        for (let i = 0; i < 3; i += 1) {
          const osc = context.createOscillator();
          const env = context.createGain();
          const t = start + i * 0.07;
          osc.type = 'sine';
          osc.frequency.value = 4300 + Math.random() * 120;
          env.gain.setValueAtTime(0, t);
          env.gain.linearRampToValueAtTime(0.06, t + 0.01);
          env.gain.linearRampToValueAtTime(0, t + 0.05);
          chain(osc, env, out);
          osc.start(t);
          osc.stop(t + 0.06);
        }
      };
      timers.push(setInterval(chirp, 380));
    }
    nodes.forEach((node) => 'start' in node && (node as AudioBufferSourceNode).buffer && node.start());
    return {
      gain: out,
      stop: () => {
        timers.forEach(clearInterval);
        nodes.forEach((node) => {
          try {
            node.stop();
          } catch {
            // Already stopped.
          }
        });
        out.disconnect();
      },
    };
  }

  /** Apply a mix: starts layers that became audible, stops ones set to zero. */
  async apply(mix: Mix): Promise<void> {
    this.mix = mix;
    const anyAudible = layers.some(({ id }) => mix.levels[id] > 0);
    if (!anyAudible && !this.context) return;
    const context = this.ctx();
    if (context.state === 'suspended') await context.resume();
    (this.master as GainNode).gain.setTargetAtTime(mix.master, context.currentTime, 0.1);
    for (const { id } of layers) {
      const level = mix.levels[id];
      const existing = this.running.get(id);
      if (level > 0 && !existing) {
        const created = this.build(id);
        this.running.set(id, created);
        created.gain.gain.setTargetAtTime(level, context.currentTime, 0.4);
      } else if (existing && level > 0) {
        existing.gain.gain.setTargetAtTime(level, context.currentTime, 0.2);
      } else if (existing) {
        existing.gain.gain.setTargetAtTime(0, context.currentTime, 0.2);
        this.running.delete(id);
        setTimeout(() => existing.stop(), 900);
      }
    }
  }

  get active(): boolean {
    return this.running.size > 0;
  }

  async stopAll(): Promise<void> {
    await this.apply({ master: this.mix.master, levels: { ...emptyMix.levels } });
  }

  /** Fade everything out after `minutes`; pass 0 to cancel. */
  sleepIn(minutes: number, onDone: () => void): void {
    clearTimeout(this.timer);
    if (minutes <= 0) return;
    this.timer = setTimeout(() => {
      void this.stopAll().then(onDone);
    }, minutes * 60_000);
  }
}

export const ambient = new AmbientMixer();
