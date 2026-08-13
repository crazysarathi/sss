/**
 * SSS sound engine — the entire soundtrack is synthesized live with the
 * Web Audio API, so the site ships zero audio bytes: nothing to download,
 * nothing to license, nothing gating LCP.
 *
 * Graph:  voices → musicBus / sfxBus → master → compressor → speakers.
 *
 * Music is a stadium EDM anthem: four-on-floor kick with sidechain pump,
 * rolling octave bass, offbeat supersaw chord stabs, a singable hook and
 * a snare-roll build over D → A → Bm → G, glued by a generated-IR hall
 * reverb — scheduled a beat ahead on a lookahead timer. It plays ONLY
 * under the opening ceremony — once the intro finishes it fades out and
 * retires for the session. Everything after is short envelope-shaped
 * one-shots (ball bounces, paddle pops, whooshes, a crowd cheer).
 *
 * There is no mute UI: sound is part of the show. Browsers still forbid
 * audio before the first user interaction, so tryAutoStart() attempts an
 * immediate start (some browsers allow it) and attachSoundUnlock() arms
 * one-time gesture listeners as the guaranteed fallback. The context
 * suspends while the tab is hidden.
 */

/* ------------------------------------------------------------------ */
/* Context + buses                                                     */
/* ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;
let musicBus: GainNode | null = null;
let pumpBus: GainNode | null = null;
let echoSend: DelayNode | null = null;
let reverbSend: GainNode | null = null;
let sfxBus: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

let musicOn = false;
/** Set when the intro ends — the music retires for good, SFX carry on. */
let musicEnded = false;

function ensureCtx(): AudioContext | null {
  if (ctx) return ctx;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 22;
  comp.ratio.value = 8;
  comp.attack.value = 0.004;
  comp.release.value = 0.16;
  comp.connect(ctx.destination);

  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(comp);

  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(master);

  // dotted-8th echo for the hook — depth without mush
  echoSend = ctx.createDelay(1);
  echoSend.delayTime.value = 0.36;
  const echoFb = ctx.createGain();
  echoFb.gain.value = 0.3;
  echoSend.connect(echoFb);
  echoFb.connect(echoSend);
  const echoWet = ctx.createGain();
  echoWet.gain.value = 0.35;
  echoSend.connect(echoWet);
  echoWet.connect(musicBus);

  // generated-IR hall reverb — the "produced" glue on stabs and the hook
  const convolver = ctx.createConvolver();
  const irLen = Math.floor(ctx.sampleRate * 1.8);
  const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < irLen; i++) {
      d[i] = (Math.random() * 2 - 1) * (1 - i / irLen) ** 2.8;
    }
  }
  convolver.buffer = ir;
  reverbSend = ctx.createGain();
  const reverbWet = ctx.createGain();
  reverbWet.gain.value = 0.5;
  reverbSend.connect(convolver);
  convolver.connect(reverbWet);
  reverbWet.connect(musicBus);

  // sidechain bus: bass, stabs and hook duck after each kick (the pump)
  pumpBus = ctx.createGain();
  pumpBus.connect(musicBus);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.85;
  sfxBus.connect(master);

  // A hidden tab shouldn't keep the band playing.
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  });

  return ctx;
}

/** The context, but only when it's actually allowed to make noise. */
function live(): AudioContext | null {
  return ctx && ctx.state === "running" ? ctx : null;
}

/** True once the browser has let audio through. */
export function isAudioRunning(): boolean {
  return Boolean(ctx && ctx.state === "running");
}

function noise(c: AudioContext): AudioBufferSourceNode {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  return src;
}

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/* ------------------------------------------------------------------ */
/* Music — 8 bars of stadium anthem, two bars per chord                */
/* ------------------------------------------------------------------ */

const BPM = 124;
const STEP_DUR = 60 / BPM / 4; // one 16th note
const TOTAL_STEPS = 128; // 8 bars

interface HookNote {
  /** step within the chord's 32-step block */
  s: number;
  /** MIDI note */
  m: number;
  /** duration in steps */
  d: number;
}

/** D → A → Bm → G: bass root, stab triad, and a singable hook phrase. */
const CHORDS: Array<{ bass: number; stab: number[]; hook: HookNote[] }> = [
  {
    bass: 38,
    stab: [62, 66, 69],
    hook: [
      { s: 0, m: 69, d: 4 },
      { s: 4, m: 74, d: 4 },
      { s: 8, m: 78, d: 6 },
      { s: 16, m: 76, d: 4 },
      { s: 20, m: 74, d: 4 },
      { s: 24, m: 76, d: 6 },
    ],
  },
  {
    bass: 33,
    stab: [61, 64, 69],
    hook: [
      { s: 0, m: 73, d: 6 },
      { s: 8, m: 76, d: 6 },
      { s: 16, m: 69, d: 4 },
      { s: 20, m: 71, d: 4 },
      { s: 24, m: 73, d: 6 },
    ],
  },
  {
    bass: 35,
    stab: [59, 62, 66],
    hook: [
      { s: 0, m: 74, d: 6 },
      { s: 8, m: 78, d: 6 },
      { s: 16, m: 71, d: 8 },
      { s: 24, m: 69, d: 6 },
    ],
  },
  {
    bass: 31,
    stab: [59, 62, 67],
    hook: [
      { s: 0, m: 71, d: 6 },
      { s: 8, m: 74, d: 6 },
      { s: 16, m: 76, d: 6 },
      { s: 24, m: 78, d: 8 },
    ],
  },
];

/** Duck the pumped layers right after each kick — the modern EDM pump. */
function pump(t: number) {
  if (!pumpBus) return;
  pumpBus.gain.setValueAtTime(0.55, t);
  pumpBus.gain.linearRampToValueAtTime(1, t + 0.26);
}

function kick(c: AudioContext, t: number) {
  if (!musicBus) return;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.09);
  const g = c.createGain();
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
  o.connect(g).connect(musicBus);
  o.start(t);
  o.stop(t + 0.26);
  // beater click for punch
  const n = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 4000;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.1, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
  n.connect(hp).connect(ng).connect(musicBus);
  n.start(t);
  n.stop(t + 0.03);
}

function clapSnare(c: AudioContext, t: number, mul = 1) {
  if (!musicBus || !reverbSend) return;
  const n = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1700;
  bp.Q.value = 1;
  const g = c.createGain();
  g.gain.setValueAtTime(0.3 * mul, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  n.connect(bp).connect(g);
  g.connect(musicBus);
  const send = c.createGain();
  send.gain.value = 0.3;
  g.connect(send).connect(reverbSend);
  n.start(t);
  n.stop(t + 0.18);
}

function openHat(c: AudioContext, t: number) {
  if (!musicBus) return;
  const n = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 8500;
  const g = c.createGain();
  g.gain.setValueAtTime(0.09, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  n.connect(hp).connect(g).connect(musicBus);
  n.start(t);
  n.stop(t + 0.13);
}

/** Rolling octave bass — saw bite over a sine sub, into the pump. */
function bassBounce(c: AudioContext, t: number, f: number) {
  if (!pumpBus) return;
  const o1 = c.createOscillator();
  o1.type = "sawtooth";
  o1.frequency.value = f;
  const o2 = c.createOscillator();
  o2.type = "sine";
  o2.frequency.value = f;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 750;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.3, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.21);
  o1.connect(lp);
  o2.connect(lp);
  lp.connect(g).connect(pumpBus);
  o1.start(t);
  o2.start(t);
  o1.stop(t + 0.23);
  o2.stop(t + 0.23);
}

/** Detuned saw stack — the wide "big room" voice. */
function supersaw(
  c: AudioContext,
  t: number,
  f: number,
  dur: number,
  dest: AudioNode
) {
  for (const cents of [-10, -4, 4, 10]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.detune.value = cents;
    o.connect(dest);
    o.start(t);
    o.stop(t + dur);
  }
}

/** Offbeat chord stab, washed in reverb. */
function stab(c: AudioContext, t: number, freqs: number[]) {
  if (!pumpBus || !reverbSend) return;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2600;
  lp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.1, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  lp.connect(g);
  g.connect(pumpBus);
  const send = c.createGain();
  send.gain.value = 0.35;
  g.connect(send).connect(reverbSend);
  for (const f of freqs) supersaw(c, t, f, 0.24, lp);
}

/** The hook — supersaw over a sub octave, echoed and reverbed. */
function hookVoice(c: AudioContext, t: number, f: number, dur: number) {
  if (!pumpBus || !echoSend || !reverbSend) return;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2300;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.13, t + 0.02);
  g.gain.setValueAtTime(0.13, t + Math.max(0.02, dur - 0.12));
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  const o2 = c.createOscillator();
  o2.type = "sine";
  o2.frequency.value = f / 2;
  const g2 = c.createGain();
  g2.gain.value = 0.25;
  o2.connect(g2).connect(lp);
  lp.connect(g);
  g.connect(pumpBus);
  const sendE = c.createGain();
  sendE.gain.value = 0.3;
  g.connect(sendE).connect(echoSend);
  const sendR = c.createGain();
  sendR.gain.value = 0.3;
  g.connect(sendR).connect(reverbSend);
  supersaw(c, t, f, dur + 0.02, lp);
  o2.start(t);
  o2.stop(t + dur + 0.02);
}

/** Loop-start crash wash. */
function crash(c: AudioContext, t: number) {
  if (!musicBus || !reverbSend) return;
  const n = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 5000;
  const g = c.createGain();
  g.gain.setValueAtTime(0.1, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
  n.connect(hp).connect(g);
  g.connect(musicBus);
  const send = c.createGain();
  send.gain.value = 0.5;
  g.connect(send).connect(reverbSend);
  n.start(t);
  n.stop(t + 1.35);
}

/** Final-bar noise riser charging the loop restart. */
function riser(c: AudioContext, t: number, dur: number) {
  if (!musicBus) return;
  const n = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(500, t);
  bp.frequency.exponentialRampToValueAtTime(3800, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.11, t + dur);
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05);
  n.connect(bp).connect(g).connect(musicBus);
  n.start(t);
  n.stop(t + dur + 0.08);
}

function scheduleStep(c: AudioContext, i: number, t: number) {
  const bar = (i / 16) | 0;
  const pos = i % 16;
  const chord = CHORDS[bar >> 1];
  const blockStep = (bar % 2) * 16 + pos;

  // four-on-floor with the pump riding every kick
  if (pos % 4 === 0) {
    kick(c, t);
    pump(t);
  }
  if (pos === 4 || pos === 12) clapSnare(c, t);
  if (pos % 4 === 2) openHat(c, t);

  // rolling octave bass on 8ths (low-high-low-high…)
  if (pos % 2 === 0) {
    bassBounce(c, t, hz(chord.bass + ((pos >> 1) % 2 === 1 ? 12 : 0)));
  }

  // offbeat supersaw stabs ride with the open hats
  if (pos % 4 === 2) stab(c, t, chord.stab.map(hz));

  // the hook enters once the beat has established itself
  if (bar >= 2) {
    for (const n of chord.hook) {
      if (n.s === blockStep) hookVoice(c, t, hz(n.m), n.d * STEP_DUR);
    }
  }

  // final bar: riser + snare roll charging the loop restart
  if (bar === 7) {
    if (pos === 0) riser(c, t, STEP_DUR * 16);
    if (pos === 8 || pos === 10 || pos >= 12) {
      clapSnare(c, t, 0.35 + (pos - 8) * 0.06);
    }
  }
  // crash wash opens every pass
  if (i === 0) crash(c, t);
}

let stepIndex = 0;
let nextStepAt = 0;
let schedTimer: number | null = null;

function startScheduler(c: AudioContext) {
  if (schedTimer !== null) return;
  stepIndex = 0;
  nextStepAt = c.currentTime + 0.06;
  schedTimer = window.setInterval(() => {
    if (!ctx || ctx.state !== "running") return;
    const horizon = ctx.currentTime + 0.18;
    while (nextStepAt < horizon) {
      scheduleStep(ctx, stepIndex, nextStepAt);
      stepIndex = (stepIndex + 1) % TOTAL_STEPS;
      nextStepAt += STEP_DUR;
    }
  }, 40);
}

const MUSIC_LEVEL = 0.55;

/* ------------------------------------------------------------------ */
/* Public controls                                                     */
/* ------------------------------------------------------------------ */

/**
 * Starts the intro soundtrack. Needs the browser's permission to make
 * noise, and is a no-op once the intro has ended — SFX-only after that.
 */
export function startMusic(): void {
  if (musicEnded) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  if (!musicOn) {
    musicOn = true;
    startScheduler(c);
  }
  if (musicBus) {
    musicBus.gain.setTargetAtTime(MUSIC_LEVEL, c.currentTime, 0.15);
  }
}

/**
 * Retires the music for the session: holds a beat, fades out, then stops
 * scheduling new notes. One-shot SFX keep working afterwards.
 */
export function stopMusic(holdSec = 1.2, fadeSec = 2.4): void {
  musicEnded = true;
  const wasOn = musicOn;
  musicOn = false;
  if (!ctx || !musicBus || !wasOn) return;
  musicBus.gain.setTargetAtTime(0, ctx.currentTime + holdSec, fadeSec / 3);
  window.setTimeout(
    () => {
      if (schedTimer !== null) {
        clearInterval(schedTimer);
        schedTimer = null;
      }
      // Hard-kill the bus: if the ctx suspended mid-fade (hidden tab),
      // queued notes are frozen at full gain — zero the bus so a later
      // resume can't replay the retired intro music.
      if (ctx && musicBus) {
        musicBus.gain.cancelScheduledValues(0);
        musicBus.gain.setValueAtTime(0, ctx.currentTime);
      }
    },
    (holdSec + fadeSec) * 1000 + 600
  );
}

/**
 * Attempts to start the music immediately, without waiting for a tap —
 * and keeps knocking for the first several seconds so the score starts
 * the instant the browser permits it. Succeeds at page-load on browsers
 * with autoplay allowed for the site (Chrome grants this automatically
 * to sites the visitor engages with repeatedly); where it stays blocked,
 * the gesture listeners remain the guaranteed path.
 */
export function tryAutoStart(): void {
  const c = ensureCtx();
  if (!c) return;
  const attempt = () => {
    if (musicEnded || c.state === "running") return;
    c.resume()
      .then(() => {
        if (c.state === "running") startMusic();
      })
      .catch(() => {
        /* blocked — retry below / gesture unlock will handle it */
      });
  };
  attempt();
  const iv = window.setInterval(() => {
    if (musicEnded || c.state === "running") {
      window.clearInterval(iv);
      return;
    }
    attempt();
  }, 400);
  window.setTimeout(() => window.clearInterval(iv), 8000);
}

let unlockArmed = false;

/**
 * Arms gesture listeners that unlock audio (browser autoplay policy
 * forbids sound before the first interaction). Touch grants activation
 * at pointerup/touchend — NOT pointerdown — so those are what we arm,
 * and the listeners stay armed until a resume actually lands, so a
 * non-qualifying gesture (e.g. a scroll) can never burn the unlock.
 */
export function attachSoundUnlock(): void {
  if (unlockArmed) return;
  unlockArmed = true;
  const detach = () => {
    window.removeEventListener("pointerup", onGesture, true);
    window.removeEventListener("keydown", onGesture, true);
    window.removeEventListener("touchend", onGesture, true);
  };
  const onGesture = () => {
    const c = ensureCtx();
    if (!c) {
      detach();
      return;
    }
    void c.resume().then(() => {
      if (c.state !== "running") return;
      detach();
      startMusic(); // silently skipped once the intro is over
    });
  };
  window.addEventListener("pointerup", onGesture, {
    capture: true,
    passive: true,
  });
  window.addEventListener("keydown", onGesture, { capture: true });
  window.addEventListener("touchend", onGesture, {
    capture: true,
    passive: true,
  });
}

/* ------------------------------------------------------------------ */
/* SFX one-shots (each is a silent no-op until audio is unlocked)      */
/* ------------------------------------------------------------------ */

function bounce(strength = 1): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(480 + 160 * strength, t);
  o.frequency.exponentialRampToValueAtTime(150, t + 0.13);
  const g = c.createGain();
  g.gain.setValueAtTime(0.5 * strength, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g).connect(sfxBus);
  o.start(t);
  o.stop(t + 0.2);
  // surface click on contact
  const n = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3200;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.12 * strength, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  n.connect(hp).connect(ng).connect(sfxBus);
  n.start(t);
  n.stop(t + 0.05);
}

/** The signature pickleball "pop" off a paddle face. */
function paddle(): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(640, t);
  o.frequency.exponentialRampToValueAtTime(300, t + 0.06);
  const g = c.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  o.connect(g).connect(sfxBus);
  o.start(t);
  o.stop(t + 0.1);
  const n = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2100;
  bp.Q.value = 1.2;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.28, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  n.connect(bp).connect(ng).connect(sfxBus);
  n.start(t);
  n.stop(t + 0.06);
}

function whoosh(dur = 0.5, dir: "up" | "down" = "up"): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  const n = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.8;
  const [f0, f1] = dir === "up" ? [260, 2600] : [2600, 320];
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.3, t + dur * 0.55);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(bp).connect(g).connect(sfxBus);
  n.start(t);
  n.stop(t + dur + 0.02);
}

/** Short, airy paddle swing. */
function swish(): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  const n = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1;
  bp.frequency.setValueAtTime(1200, t);
  bp.frequency.exponentialRampToValueAtTime(3600, t + 0.22);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.1);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  n.connect(bp).connect(g).connect(sfxBus);
  n.start(t);
  n.stop(t + 0.25);
}

/** Big impact: paddle pop + low thump + debris burst. */
function smash(): void {
  const c = live();
  if (!c || !sfxBus) return;
  paddle();
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.22);
  const g = c.createGain();
  g.gain.setValueAtTime(0.7, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  o.connect(g).connect(sfxBus);
  o.start(t);
  o.stop(t + 0.3);
  const n = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 900;
  bp.Q.value = 0.7;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.4, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  n.connect(bp).connect(ng).connect(sfxBus);
  n.start(t);
  n.stop(t + 0.32);
}

/** The serve: strike + rising flight. */
function serve(): void {
  paddle();
  whoosh(0.55, "up");
}

/** Crowd roar — filtered noise swell with a voices-flutter LFO. */
function cheer(dur = 2.4): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  const n = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.5;
  bp.frequency.setValueAtTime(820, t);
  bp.frequency.linearRampToValueAtTime(1150, t + dur * 0.4);
  bp.frequency.linearRampToValueAtTime(700, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.34, t + 0.35);
  g.gain.setValueAtTime(0.34, t + dur * 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const lfo = c.createOscillator();
  lfo.frequency.value = 5.2;
  const lfoG = c.createGain();
  lfoG.gain.value = 0.07;
  lfo.connect(lfoG);
  lfoG.connect(g.gain);
  // bright "sss" of a stadium on its feet
  const n2 = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 4200;
  const g2 = c.createGain();
  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.exponentialRampToValueAtTime(0.07, t + 0.4);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9);
  n.connect(bp).connect(g).connect(sfxBus);
  n2.connect(hp).connect(g2).connect(sfxBus);
  lfo.start(t);
  n.start(t);
  n2.start(t);
  lfo.stop(t + dur);
  n.stop(t + dur + 0.05);
  n2.stop(t + dur);
}

function bellNote(
  c: AudioContext,
  t: number,
  f: number,
  dur: number,
  peak: number
) {
  if (!sfxBus) return;
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.value = f;
  const o2 = c.createOscillator();
  o2.type = "sine";
  o2.frequency.value = f * 2;
  const g2 = c.createGain();
  g2.gain.value = 0.35;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  o2.connect(g2).connect(g);
  g.connect(sfxBus);
  o.start(t);
  o2.start(t);
  o.stop(t + dur);
  o2.stop(t + dur);
}

/** Rising four-note announcement (D5 · F#5 · A5 · D6). */
function fanfare(): void {
  const c = live();
  if (!c) return;
  [74, 78, 81, 86].forEach((m, i) => {
    bellNote(c, c.currentTime + i * 0.09, hz(m), 0.55 + i * 0.12, 0.16);
  });
}

/** Two-note success "ta-da". */
function chime(): void {
  const c = live();
  if (!c) return;
  bellNote(c, c.currentTime, hz(74), 0.9, 0.2);
  bellNote(c, c.currentTime + 0.14, hz(81), 1.1, 0.2);
}

/** Feather-light upward blip for gallery hovers. */
function hover(): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(460, t);
  o.frequency.exponentialRampToValueAtTime(640, t + 0.05);
  const g = c.createGain();
  g.gain.setValueAtTime(0.1, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  o.connect(g).connect(sfxBus);
  o.start(t);
  o.stop(t + 0.09);
}

/** Tiny UI pop for buttons. */
function pop(): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(720, t);
  o.frequency.exponentialRampToValueAtTime(460, t + 0.06);
  const g = c.createGain();
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  o.connect(g).connect(sfxBus);
  o.start(t);
  o.stop(t + 0.09);
}

/**
 * Metal-on-metal clatter — the locked shackle straining in its hasp.
 * Three inharmonic partials give the "cheap padlock" ring; the noise burst
 * is the clack of the shackle slamming back down.
 */
function rattle(strength = 1): void {
  const c = live();
  if (!c || !sfxBus) return;
  const out = sfxBus;
  const t = c.currentTime;
  [1830, 2470, 3290].forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.86, t + 0.09);
    const g = c.createGain();
    g.gain.setValueAtTime(0.05 * strength * (1 - i * 0.24), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09 + i * 0.03);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.15);
  });
  const n = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2700;
  bp.Q.value = 0.9;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.15 * strength, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  n.connect(bp).connect(ng).connect(sfxBus);
  n.start(t);
  n.stop(t + 0.07);
}

/** The bolt gives: key click → shackle springs open → low release thump. */
function unlock(): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  // the click of the mechanism letting go
  const n = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 5200;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.3, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  n.connect(hp).connect(ng).connect(sfxBus);
  n.start(t);
  n.stop(t + 0.05);
  // the shackle springing up out of the body
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(320, t + 0.02);
  o.frequency.exponentialRampToValueAtTime(1150, t + 0.2);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.24, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
  o.connect(g).connect(sfxBus);
  o.start(t + 0.02);
  o.stop(t + 0.28);
  // the weight of the lock dropping free
  const o2 = c.createOscillator();
  o2.type = "sine";
  o2.frequency.setValueAtTime(190, t + 0.03);
  o2.frequency.exponentialRampToValueAtTime(52, t + 0.3);
  const g2 = c.createGain();
  g2.gain.setValueAtTime(0.5, t + 0.03);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
  o2.connect(g2).connect(sfxBus);
  o2.start(t + 0.03);
  o2.stop(t + 0.38);
}

/** Ratchet tick for the slide-to-serve track; pitch rises with progress. */
function tick(progress: number): void {
  const c = live();
  if (!c || !sfxBus) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.value = 300 + 500 * Math.min(1, Math.max(0, progress));
  const g = c.createGain();
  g.gain.setValueAtTime(0.14, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  o.connect(g).connect(sfxBus);
  o.start(t);
  o.stop(t + 0.05);
}

export const sfx = {
  bounce,
  paddle,
  whoosh,
  swish,
  smash,
  serve,
  cheer,
  fanfare,
  chime,
  hover,
  pop,
  tick,
  rattle,
  unlock,
} as const;
