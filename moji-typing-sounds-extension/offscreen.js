/**
 * Moji Typing Sounds — Offscreen Audio Engine
 * Ported from Moji's audio.ts — 6 synthesized sound packs.
 * All sounds generated in real-time via Web Audio API. No audio files.
 */

(() => {
  'use strict';

  const KEY_PAN_MAP = {
    q: -0.80, w: -0.60, e: -0.40, r: -0.20, t: -0.05,
    y:  0.05, u:  0.20, i:  0.40, o:  0.60, p:  0.80,
    a: -0.75, s: -0.50, d: -0.30, f: -0.10, g: -0.05,
    h:  0.05, j:  0.15, k:  0.35, l:  0.55,
    z: -0.70, x: -0.50, c: -0.30, v: -0.10, b: -0.05,
    n:  0.05, m:  0.25,
    ' ': 0, 'backspace': 0, 'enter': 0, 'tab': 0, 'shift': 0
  };

  const CATEGORY_TO_TYPE = {
    letter: 'correct', space: 'space', backspace: 'backspace',
    enter: 'space', modifier: 'backspace', navigation: 'backspace', special: 'correct'
  };

  let ctx = null;
  let master = null;

  function getCtx(volume) {
    try {
      if (!ctx) {
        ctx = new AudioContext();
        master = ctx.createGain();
        master.gain.value = volume;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      if (master) master.gain.value = volume;
      return { ctx, master };
    } catch { return null; }
  }

  function mkNoise(ac, dur) {
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    return src;
  }

  function mkPan(ac, m, pan) {
    const p = ac.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    p.connect(m);
    return p;
  }

  // ─── 1. Mechanical ──────────────────────────────────────────────
  function mechanical(ac, m, type, pan, vol) {
    const now = ac.currentTime;
    const pnr = mkPan(ac, m, pan);
    const n = mkNoise(ac, 0.055);
    const filt = ac.createBiquadFilter();
    filt.type = type === 'error' ? 'lowpass' : 'bandpass';
    filt.frequency.value = type === 'error' ? 700 : type === 'space' ? 1400 : type === 'backspace' ? 1800 : 2400;
    filt.Q.value = type === 'space' ? 0.7 : 1.5;
    const ng = ac.createGain();
    const nv = type === 'backspace' ? 0.10 : type === 'space' ? 0.20 : 0.16;
    const nd = type === 'space' ? 0.065 : type === 'backspace' ? 0.030 : 0.042;
    ng.gain.setValueAtTime(nv * vol, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + nd);
    n.connect(filt); filt.connect(ng); ng.connect(pnr);
    n.start(now); n.stop(now + nd + 0.02);
    if (type !== 'backspace') {
      const osc = ac.createOscillator(); osc.type = 'sine';
      const base = type === 'error' ? 75 : type === 'space' ? 110 : 175;
      osc.frequency.value = base * (1 + (Math.random() - 0.5) * 0.14);
      const tv = type === 'error' ? 0.13 : type === 'space' ? 0.12 : 0.09;
      const td = type === 'space' ? 0.08 : 0.038;
      const og = ac.createGain();
      og.gain.setValueAtTime(tv * vol, now);
      og.gain.exponentialRampToValueAtTime(0.0001, now + td);
      osc.connect(og); og.connect(pnr);
      osc.start(now); osc.stop(now + td + 0.01);
    }
  }

  // ─── 2. Cute ────────────────────────────────────────────────────
  function cute(ac, m, type, pan, vol) {
    const now = ac.currentTime;
    const pnr = mkPan(ac, m, pan);
    const cn = (o, g) => { o.connect(g); g.connect(pnr); };
    if (type === 'space') {
      [600, 920].forEach((freq, i) => {
        const osc = ac.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
        const g = ac.createGain(); const t = now + i * 0.028;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.20 * vol, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);
        cn(osc, g); osc.start(t); osc.stop(t + 0.12);
      });
    } else if (type === 'error') {
      const osc = ac.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now); osc.frequency.exponentialRampToValueAtTime(190, now + 0.14);
      const g = ac.createGain(); g.gain.setValueAtTime(0.22 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      cn(osc, g); osc.start(now); osc.stop(now + 0.20);
    } else if (type === 'backspace') {
      const osc = ac.createOscillator(); osc.type = 'sine'; osc.frequency.value = 380;
      const g = ac.createGain(); g.gain.setValueAtTime(0.09 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      cn(osc, g); osc.start(now); osc.stop(now + 0.07);
    } else {
      const osc = ac.createOscillator(); osc.type = 'sine';
      osc.frequency.value = 820 + Math.random() * 380;
      const g = ac.createGain(); g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.19 * vol, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.082);
      cn(osc, g); osc.start(now); osc.stop(now + 0.10);
    }
  }

  // ─── 3. Silent Rhythm ───────────────────────────────────────────
  function silentRhythm(ac, m, type, pan, vol) {
    const now = ac.currentTime;
    const pnr = mkPan(ac, m, pan);
    const n = mkNoise(ac, 0.018);
    const filt = ac.createBiquadFilter();
    filt.type = 'highpass'; filt.frequency.value = type === 'error' ? 200 : 1200;
    const g = ac.createGain();
    if (type === 'error') {
      filt.type = 'lowpass'; filt.frequency.value = 600;
      g.gain.setValueAtTime(0.12 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    } else if (type === 'space') {
      g.gain.setValueAtTime(0.06 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
    } else if (type === 'backspace') {
      g.gain.setValueAtTime(0.03 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
    } else {
      g.gain.setValueAtTime(0.04 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    }
    n.connect(filt); filt.connect(g); g.connect(pnr);
    n.start(now); n.stop(now + 0.03);
  }

  // ─── 4. Arcade ──────────────────────────────────────────────────
  function arcade(ac, m, type, pan, vol) {
    const now = ac.currentTime;
    const pnr = mkPan(ac, m, pan);
    const cn = (o, g) => { o.connect(g); g.connect(pnr); };
    if (type === 'correct') {
      const osc = ac.createOscillator(); osc.type = 'square';
      osc.frequency.value = 700 + Math.floor(Math.random() * 4) * 50;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.10 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);
      cn(osc, g); osc.start(now); osc.stop(now + 0.045);
    } else if (type === 'error') {
      [320, 200].forEach((freq, i) => {
        const osc = ac.createOscillator(); osc.type = 'square'; osc.frequency.value = freq;
        const g = ac.createGain(); const t = now + i * 0.055;
        g.gain.setValueAtTime(0.12 * vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.050);
        cn(osc, g); osc.start(t); osc.stop(t + 0.055);
      });
    } else if (type === 'space') {
      [500, 800].forEach((freq, i) => {
        const osc = ac.createOscillator(); osc.type = 'square'; osc.frequency.value = freq;
        const g = ac.createGain(); const t = now + i * 0.040;
        g.gain.setValueAtTime(0.10 * vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
        cn(osc, g); osc.start(t); osc.stop(t + 0.040);
      });
    } else {
      const osc = ac.createOscillator(); osc.type = 'square'; osc.frequency.value = 250;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.07 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.030);
      cn(osc, g); osc.start(now); osc.stop(now + 0.035);
    }
  }

  // ─── 5. Nature ──────────────────────────────────────────────────
  function nature(ac, m, type, pan, vol) {
    const now = ac.currentTime;
    const pnr = mkPan(ac, m, pan);
    if (type === 'correct') {
      const n = mkNoise(ac, 0.040);
      const filt = ac.createBiquadFilter();
      filt.type = 'lowpass'; filt.frequency.value = 350 + Math.random() * 100; filt.Q.value = 2.5;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.28 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
      const osc = ac.createOscillator(); osc.type = 'sine';
      osc.frequency.value = 140 + Math.random() * 30;
      const og = ac.createGain();
      og.gain.setValueAtTime(0.08 * vol, now);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      n.connect(filt); filt.connect(g); g.connect(pnr);
      osc.connect(og); og.connect(pnr);
      n.start(now); n.stop(now + 0.05);
      osc.start(now); osc.stop(now + 0.06);
    } else if (type === 'error') {
      const osc = ac.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.18);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.22 * vol, now + 0.010);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.connect(g); g.connect(pnr);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'space') {
      [880, 1320].forEach((freq, i) => {
        const osc = ac.createOscillator(); osc.type = 'sine';
        osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.02);
        const g = ac.createGain(); const t = now + i * 0.025;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.14 * vol, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        osc.connect(g); g.connect(pnr);
        osc.start(t); osc.stop(t + 0.40);
      });
    } else {
      const n = mkNoise(ac, 0.025);
      const filt = ac.createBiquadFilter();
      filt.type = 'lowpass'; filt.frequency.value = 500;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.06 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      n.connect(filt); filt.connect(g); g.connect(pnr);
      n.start(now); n.stop(now + 0.03);
    }
  }

  // ─── 6. Coach ───────────────────────────────────────────────────
  function coach(ac, m, type, pan, vol) {
    const now = ac.currentTime;
    const pnr = mkPan(ac, m, pan);
    if (type === 'correct') {
      const n = mkNoise(ac, 0.025);
      const filt = ac.createBiquadFilter();
      filt.type = 'bandpass'; filt.frequency.value = 1600; filt.Q.value = 1.0;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.09 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      n.connect(filt); filt.connect(g); g.connect(pnr);
      n.start(now); n.stop(now + 0.03);
    } else if (type === 'error') {
      [440, 880].forEach((freq, i) => {
        const osc = ac.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
        const g = ac.createGain(); const t = now + i * 0.008;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime((i === 0 ? 0.20 : 0.10) * vol, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.connect(g); g.connect(pnr);
        osc.start(t); osc.stop(t + 0.50);
      });
    } else if (type === 'space') {
      const osc = ac.createOscillator(); osc.type = 'sine'; osc.frequency.value = 660;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.13 * vol, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(g); g.connect(pnr);
      osc.start(now); osc.stop(now + 0.14);
    } else {
      const n = mkNoise(ac, 0.020);
      const filt = ac.createBiquadFilter();
      filt.type = 'highpass'; filt.frequency.value = 2000;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.05 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
      n.connect(filt); filt.connect(g); g.connect(pnr);
      n.start(now); n.stop(now + 0.022);
    }
  }

  // ─── Pack Registry ──────────────────────────────────────────────
  const PACKS = {
    mechanical, cute, 'silent-rhythm': silentRhythm,
    arcade, nature, coach
  };

  function playKeystroke(key, keyCategory, pack, volume) {
    try {
      const audio = getCtx(volume);
      if (!audio) return;
      const pan = KEY_PAN_MAP[key] ?? 0;
      const type = CATEGORY_TO_TYPE[keyCategory] || 'correct';
      const packFn = PACKS[pack];
      if (packFn) packFn(audio.ctx, audio.master, type, pan, volume);
    } catch (_e) { /* silent */ }
  }

  function playPreview(pack, volume) {
    playKeystroke('f', 'letter', pack, volume);
    setTimeout(() => playKeystroke('j', 'letter', pack, volume), 80);
    setTimeout(() => playKeystroke('k', 'letter', pack, volume), 150);
    setTimeout(() => playKeystroke(' ', 'space', pack, volume), 240);
    setTimeout(() => playKeystroke('d', 'letter', pack, volume), 340);
    setTimeout(() => playKeystroke('l', 'letter', pack, volume), 410);
    setTimeout(() => playKeystroke('enter', 'enter', pack, volume), 520);
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.target !== 'offscreen') return;
    if (message.type === 'PLAY_KEY') {
      playKeystroke(message.key, message.keyCategory, message.pack, message.volume);
    }
    if (message.type === 'PLAY_PREVIEW') {
      playPreview(message.pack, message.volume);
    }
  });
})();
