// Original score for the Foundix film, synthesised from scratch (no samples, no licences).
// Timed to the film's scene cuts. Usage: node music.mjs -> music.wav (44.1 kHz stereo, 76 s)
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const T = 76;
const N = Math.ceil(SR * T);
const L = new Float32Array(N), R = new Float32Array(N);
const busRev = new Float32Array(N); // mono send into the reverb

// ---- musical grid: 100 bpm, the downbeat lands on the logo reveal (5.4 s)
const BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4, GRID0 = 5.4;
const beatAt = (n) => GRID0 + n * BEAT;
const CUTS = [9.4, 16.2, 25, 34, 39.8, 46, 51.8, 59.6, 65.2];
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
// A minor: Am - F - C - G (one chord per bar)
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const ROOTS = [45, 41, 48, 43];
const chordAt = (t) => ((Math.floor((t - GRID0) / BAR) % 4) + 4) % 4;

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
// energy envelope per section (0..1)
function energy(t) {
  if (t < 5.4) return 0.35;
  if (t < 9.4) return 0.55;
  if (t < 25) return 0.8;
  if (t < 65.2) return 1.0;
  if (t < 70.6) return 0.6;
  return 0.75;
}

function add(i, l, r, rev = 0) {
  if (i < 0 || i >= N) return;
  L[i] += l; R[i] += r; busRev[i] += (l + r) * 0.5 * rev;
}

// ---- voices
function pad(t0, dur, notes, gain, bright = 0.5, rev = 0.5) {
  const n0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  const atk = Math.min(1.2, dur * 0.4), rel = Math.min(1.5, dur * 0.5);
  const voices = [];
  notes.forEach((m, k) => [-7, 0, 7].forEach((cents) =>
    voices.push({ f: midi(m) * Math.pow(2, cents / 1200), ph: (rnd() + 1) / 2, pan: (k / Math.max(1, notes.length - 1) - 0.5) * 0.8 + cents / 30 })));
  let lp = 0;
  for (let i = 0; i < n + rel * SR; i++) {
    const t = i / SR;
    const env = clamp(t / atk, 0, 1) * (t > dur ? Math.max(0, 1 - (t - dur) / rel) : 1);
    if (env <= 0 && t > dur) break;
    let sl = 0, sr = 0;
    for (const v of voices) {
      v.ph += v.f / SR; v.ph -= Math.floor(v.ph);
      const saw = 2 * v.ph - 1, tri = 1 - 4 * Math.abs(v.ph - 0.5);
      const s = tri * (1 - bright) + saw * bright * 0.5;
      sl += s * (0.5 - v.pan * 0.5); sr += s * (0.5 + v.pan * 0.5);
    }
    // gentle one-pole low-pass with slow breathing cutoff
    const cut = 0.06 + 0.05 * bright + 0.02 * Math.sin(t * 0.7);
    lp += cut * ((sl + sr) * 0.5 - lp);
    const k = (env * gain) / voices.length;
    add(n0 + i, (sl * 0.35 + lp * 0.65) * k, (sr * 0.35 + lp * 0.65) * k, rev);
  }
}

function pluck(t0, m, gain, pan = 0, rev = 0.45, decay = 0.996) {
  // Karplus-Strong string with a soft attack
  const f = midi(m), len = Math.round(SR / f);
  const buf = new Float32Array(len).map(() => rnd() * 0.5);
  const n0 = Math.floor(t0 * SR), n = Math.floor(1.6 * SR);
  let idx = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const s = buf[idx];
    const nxt = buf[(idx + 1) % len];
    buf[idx] = decay * 0.5 * (s + nxt);
    idx = (idx + 1) % len;
    prev += 0.35 * (s - prev);
    const env = Math.min(1, i / 60);
    add(n0 + i, prev * gain * env * (0.5 - pan * 0.5) * 2, prev * gain * env * (0.5 + pan * 0.5) * 2, rev);
  }
}

function bass(t0, dur, m, gain) {
  const f = midi(m), n0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += f / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-t * 2.2) * (i > n - 400 ? (n - i) / 400 : 1);
    const s = Math.sin(2 * Math.PI * ph) + 0.25 * Math.sin(4 * Math.PI * ph);
    add(n0 + i, s * env * gain, s * env * gain, 0.02);
  }
}

function kick(t0, gain, long = false) {
  const n0 = Math.floor(t0 * SR), n = Math.floor((long ? 2.2 : 0.45) * SR);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = (long ? 32 : 45) + (long ? 110 : 95) * Math.exp(-t * (long ? 14 : 28));
    ph += f / SR;
    const env = Math.exp(-t * (long ? 2.2 : 9));
    const click = i < 60 ? rnd() * 0.08 * (1 - i / 60) : 0;
    const s = (Math.sin(2 * Math.PI * ph) * env + click) * gain;
    add(n0 + i, s, s, long ? 0.3 : 0.03);
  }
}

function noiseHit(t0, dur, gain, hp, pan = 0, rev = 0.1, shape = 40) {
  const n0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, w = rnd();
    lp += hp * (w - lp);
    const s = (w - lp) * Math.exp(-t * shape) * gain;
    add(n0 + i, s * (1 - pan), s * (1 + pan), rev);
  }
}

function clap(t0, gain) {
  [0, 0.011, 0.023].forEach((d, k) => noiseHit(t0 + d, 0.18, gain * (k === 2 ? 1 : 0.6), 0.25, 0, 0.35, k === 2 ? 22 : 70));
}

function riser(t0, t1, gain) {
  // filtered noise + rising tone, swelling into t1
  const n0 = Math.floor(t0 * SR), n = Math.floor((t1 - t0) * SR);
  let bp = 0, lp2 = 0, ph = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const cut = 0.01 + 0.35 * p * p;
    const w = rnd();
    bp += cut * (w - bp);
    lp2 += 0.02 * (bp - lp2);
    ph += (180 + 700 * p * p) / SR;
    const env = Math.pow(p, 2.2) * gain;
    const s = ((bp - lp2) * 1.4 + Math.sin(2 * Math.PI * ph) * 0.12) * env;
    add(n0 + i, s * (0.8 + 0.2 * Math.sin(p * 20)), s * (0.8 - 0.2 * Math.sin(p * 20)), 0.4);
  }
}

function whoosh(tc, gain) {
  // short swept-noise transition centred on a cut
  const t0 = tc - 0.45, n = Math.floor(0.75 * SR), n0 = Math.floor(t0 * SR);
  let bp = 0, lp2 = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const env = Math.sin(Math.PI * Math.min(1, p * 1.25)) ** 2;
    const cut = 0.03 + 0.25 * Math.sin(Math.PI * p);
    bp += cut * (rnd() - bp);
    lp2 += 0.015 * (bp - lp2);
    const s = (bp - lp2) * env * gain;
    const pan = (p - 0.5) * 1.2;
    add(n0 + i, s * (1 - pan), s * (1 + pan), 0.25);
  }
}

function chime(t0, gain) {
  // bell-ish FM tone for the logo moments
  const n0 = Math.floor(t0 * SR), n = Math.floor(3 * SR);
  [76, 81, 88].forEach((m, k) => {
    const f = midi(m);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const s = Math.sin(2 * Math.PI * f * t + 1.2 * Math.exp(-t * 3) * Math.sin(2 * Math.PI * f * 2.01 * t)) * Math.exp(-t * (1.6 + k * 0.4)) * gain;
      add(n0 + i + k * 900, s * (k === 1 ? 1.2 : 0.8), s * (k === 1 ? 0.8 : 1.2), 0.7);
    }
  });
}

// ---- arrangement
// Intro (0 - 5.4): dark drone, a hit on each flashing word, riser into the logo
pad(0, 5.4, [45, 52, 57], 0.5, 0.15, 0.4);
[-0.15, 0.35, 0.85, 1.35, 1.85].forEach((t, i) => {
  if (t < 0) t = 0.01;
  kick(t, 0.55 + i * 0.05);
  noiseHit(t, 0.25, 0.16, 0.5, 0, 0.5, 30);
  pluck(t, [69, 72, 76, 74, 81][i], 0.16, (i % 2 ? 0.4 : -0.4), 0.6);
});
riser(2.9, 5.4, 0.42);

// Logo impact (5.4)
kick(5.4, 0.9, true);
noiseHit(5.4, 1.0, 0.06, 0.15, 0, 0.9, 5);
chime(5.45, 0.16);

// Chords for the whole body, bar by bar
for (let b = 0; beatAt(b * 4) < T - 0.5; b++) {
  const t = beatAt(b * 4);
  const c = b % 4;
  const len = Math.min(BAR, T - t);
  const inWall = t >= 65.2 - 0.01 && t < 70.6;
  pad(t, len, CHORDS[c].map((m) => m - 12).concat([CHORDS[c][0]]), 1.5 * (0.8 + 0.2 * energy(t)) + (inWall ? 0.9 : 0) + (t < 9.4 ? 0.6 : 0), 0.35 + 0.25 * energy(t), 0.55);
}

// Rhythm section from the first screen (9.4) to the wall (65.2), and again after the CTA hit
for (let n = 0; beatAt(n) < T; n++) {
  const t = beatAt(n);
  const beatInBar = n % 4;
  const e = energy(t);
  const groove = (t >= 9.4 - 0.05 && t < 65.2) || (t >= 70.6 && t < 74.4);
  const arp = t >= 6.6 && t < T - 1.2;
  const c = chordAt(t);
  if (groove) {
    kick(t, 0.5 * e);
    noiseHit(t + BEAT / 2, 0.06, 0.05 * e, 0.6, 0.25, 0.05, 90); // off-beat hat
    if (t >= 25 && (beatInBar === 1 || beatInBar === 3)) clap(t, 0.2 * e);
    if (t >= 25) noiseHit(t + BEAT * 0.25, 0.04, 0.03, 0.7, -0.3, 0.02, 120), noiseHit(t + BEAT * 0.75, 0.04, 0.03, 0.7, 0.3, 0.02, 120);
    // bass on 1 and the "and" of 2
    if (beatInBar === 0) bass(t, BEAT * 1.4, ROOTS[c] - 12, 0.32 * e);
    if (beatInBar === 2) bass(t + BEAT / 2, BEAT * 0.9, ROOTS[c] - 12, 0.24 * e);
  }
  if (arp) {
    const tones = CHORDS[c].concat(CHORDS[c].map((m) => m + 12));
    const pat = [0, 2, 4, 2, 3, 5, 4, 1];
    for (let h = 0; h < 2; h++) {
      const step = (n * 2 + h) % 8;
      const g = (t < 9.4 ? 0.13 : 0.15) * (0.7 + 0.3 * e) * (h === 0 ? 1 : 0.75);
      pluck(t + h * BEAT / 2, tones[pat[step]] + 12, g, step % 2 ? 0.35 : -0.35, 0.5);
    }
  }
}

// Scene transitions
CUTS.forEach((t) => whoosh(t, 0.11));
// Wall (65.2 - 70.6): drums drop, riser into the CTA hit
riser(68.4, 70.6, 0.4);
kick(70.6, 0.85, true);
noiseHit(70.6, 1.0, 0.05, 0.15, 0, 0.9, 5);
chime(70.65, 0.15);
// Final sustained chord
pad(74.4, 1.6, [45, 52, 57, 60, 64], 0.6, 0.3, 0.8);

// ---- reverb: Schroeder (4 combs + 2 allpasses), stereo by different tunings
function reverb(input, tune) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ b: new Float32Array(d + tune), i: 0, lp: 0 }));
  for (let i = 0; i < N; i++) {
    let s = 0;
    for (const c of combs) {
      const y = c.b[c.i];
      c.lp = y * 0.6 + c.lp * 0.4;
      c.b[c.i] = input[i] * 0.5 + c.lp * 0.84;
      c.i = (c.i + 1) % c.b.length;
      s += y;
    }
    out[i] = s * 0.25;
  }
  for (const d of [556 + tune, 441 + tune]) {
    const b = new Float32Array(d); let k = 0;
    for (let i = 0; i < N; i++) {
      const y = b[k], x = out[i];
      b[k] = x + y * 0.5;
      out[i] = y - x * 0.5;
      k = (k + 1) % d;
    }
  }
  return out;
}
const rl = reverb(busRev, 0), rr = reverb(busRev, 23);
for (let i = 0; i < N; i++) { L[i] += rl[i] * 0.55; R[i] += rr[i] * 0.55; }

// ---- master: high-pass rumble, soft clip, fades, normalise to -1 dBFS
let hl = 0, hr = 0, peak = 0;
for (let i = 0; i < N; i++) {
  hl += 0.0012 * (L[i] - hl); hr += 0.0012 * (R[i] - hr);
  const t = i / SR;
  const fade = Math.min(1, t / 0.05) * (t > T - 1.6 ? Math.max(0, (T - t) / 1.6) : 1);
  L[i] = Math.tanh((L[i] - hl) * 1.3) * fade;
  R[i] = Math.tanh((R[i] - hr) * 1.3) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const pcm = Buffer.alloc(44 + N * 4);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write("WAVE", 8);
pcm.write("fmt ", 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34);
pcm.write("data", 36); pcm.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.round(clamp(L[i] * norm, -1, 1) * 32767), 44 + i * 4);
  pcm.writeInt16LE(Math.round(clamp(R[i] * norm, -1, 1) * 32767), 46 + i * 4);
}
const out = path.join(here, "music.wav");
writeFileSync(out, pcm);
console.log("wrote", out, "peak", peak.toFixed(3));
