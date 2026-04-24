/** Audio Engine — Web Audio API Synthesized Keystroke Sounds (6 Packs)
 *  No external files. All sounds generated in real-time via synthesis.
 *
 *  Packs:
 *   mechanical    — realistic thock/clack (premium default)
 *   cute          — bubbly sine pops (playful)
 *   silent-rhythm — near-silent metronome ticks (focus training)
 *   arcade        — retro 8-bit square wave blips (game modes)
 *   nature        — wood taps, water drops, wind chimes (calming)
 *   coach         — neutral clicks + distinct bell error (instructional)
 */

export type AudioMode =
    | 'mechanical'
    | 'cute'
    | 'silent-rhythm'
    | 'arcade'
    | 'nature'
    | 'coach'
    | 'off';

export type KeystrokeType = 'correct' | 'error' | 'space' | 'backspace';

export interface AudioSettings {
    mode: AudioMode;
    volume: number;              // 0.0 – 1.0
    silenceInFocusMode: boolean;
}

const LS_KEY = 'moji_audio_settings';

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
    mode: 'off',
    volume: 0.65,
    silenceInFocusMode: true,
};

// Pack metadata for the UI
export const AUDIO_PACK_META: Record<Exclude<AudioMode, 'off'>, { label: string; desc: string }> = {
    'mechanical':    { label: 'Mechanical',    desc: 'Realistic thock & clack' },
    'cute':          { label: 'Cute',          desc: 'Bubbly playful pops' },
    'silent-rhythm': { label: 'Silent Rhythm', desc: 'Subtle metronome ticks' },
    'arcade':        { label: 'Arcade',        desc: 'Retro 8-bit blips' },
    'nature':        { label: 'Nature',        desc: 'Wood, water & wind' },
    'coach':         { label: 'Coach',         desc: 'Neutral + clear error chime' },
};

// Keyboard key → stereo pan position (-1 left … +1 right)
const KEY_PAN_MAP: Record<string, number> = {
    q: -0.80, w: -0.60, e: -0.40, r: -0.20, t: -0.05,
    y:  0.05, u:  0.20, i:  0.40, o:  0.60, p:  0.80,
    a: -0.75, s: -0.50, d: -0.30, f: -0.10, g: -0.05,
    h:  0.05, j:  0.15, k:  0.35, l:  0.55,
    z: -0.70, x: -0.50, c: -0.30, v: -0.10, b: -0.05,
    n:  0.05, m:  0.25,
    ' ':       0,
    backspace: 0,
};

// Singleton AudioContext + master gain
let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _settings: AudioSettings = _loadFromStorage();

// ─── Storage helpers ──────────────────────────────────────────────────────────

function _loadFromStorage(): AudioSettings {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...DEFAULT_AUDIO_SETTINGS };
}

export function loadAudioSettings(): AudioSettings {
    _settings = _loadFromStorage();
    return _settings;
}

export function saveAudioSettings(s: AudioSettings): void {
    _settings = { ...s };
    localStorage.setItem(LS_KEY, JSON.stringify(_settings));
    if (_master) _master.gain.value = _settings.volume;
}

export function getAudioSettings(): AudioSettings {
    return _settings;
}

export function initAudio(): void {
    _settings = _loadFromStorage();
}

// ─── AudioContext singleton ──────────────────────────────────────────────────

function _getCtx(): AudioContext | null {
    try {
        if (!_ctx) {
            _ctx = new AudioContext();
            _master = _ctx.createGain();
            _master.gain.value = _settings.volume;
            _master.connect(_ctx.destination);
        }
        if (_ctx.state === 'suspended') _ctx.resume();
        return _ctx;
    } catch {
        return null;
    }
}

// ─── Shared utility ───────────────────────────────────────────────────────────

function _noise(ctx: AudioContext, durationSec: number): AudioBufferSourceNode {
    const len = Math.floor(ctx.sampleRate * durationSec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
}

function _panner(ctx: AudioContext, master: GainNode, pan: number): StereoPannerNode {
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    p.connect(master);
    return p;
}

// ─── 1. Mechanical ───────────────────────────────────────────────────────────

function _mechanical(ctx: AudioContext, master: GainNode, type: KeystrokeType, pan: number, vol: number): void {
    const now = ctx.currentTime;
    const pnr = _panner(ctx, master, pan);

    // Noise burst
    const noise = _noise(ctx, 0.055);
    const filt = ctx.createBiquadFilter();
    filt.type = type === 'error' ? 'lowpass' : 'bandpass';
    filt.frequency.value = type === 'error' ? 700 : type === 'space' ? 1400 : type === 'backspace' ? 1800 : 2400;
    filt.Q.value = type === 'space' ? 0.7 : 1.5;
    const ng = ctx.createGain();
    const nv = type === 'backspace' ? 0.10 : type === 'space' ? 0.20 : 0.16;
    const nd = type === 'space' ? 0.065 : type === 'backspace' ? 0.030 : 0.042;
    ng.gain.setValueAtTime(nv * vol, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + nd);
    noise.connect(filt); filt.connect(ng); ng.connect(pnr);
    noise.start(now); noise.stop(now + nd + 0.02);

    // Body tone
    if (type !== 'backspace') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const base = type === 'error' ? 75 : type === 'space' ? 110 : 175;
        osc.frequency.value = base * (1 + (Math.random() - 0.5) * 0.14);
        const tv = type === 'error' ? 0.13 : type === 'space' ? 0.12 : 0.09;
        const td = type === 'space' ? 0.08 : 0.038;
        const og = ctx.createGain();
        og.gain.setValueAtTime(tv * vol, now);
        og.gain.exponentialRampToValueAtTime(0.0001, now + td);
        osc.connect(og); og.connect(pnr);
        osc.start(now); osc.stop(now + td + 0.01);
    }
}

// ─── 2. Cute ─────────────────────────────────────────────────────────────────

function _cute(ctx: AudioContext, master: GainNode, type: KeystrokeType, pan: number, vol: number): void {
    const now = ctx.currentTime;
    const pnr = _panner(ctx, master, pan);
    const cn = (o: OscillatorNode, g: GainNode) => { o.connect(g); g.connect(pnr); };

    if (type === 'space') {
        [600, 920].forEach((freq, i) => {
            const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
            const g = ctx.createGain(); const t = now + i * 0.028;
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.20 * vol, t + 0.006);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);
            cn(osc, g); osc.start(t); osc.stop(t + 0.12);
        });
    } else if (type === 'error') {
        const osc = ctx.createOscillator(); osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now); osc.frequency.exponentialRampToValueAtTime(190, now + 0.14);
        const g = ctx.createGain(); g.gain.setValueAtTime(0.22 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        cn(osc, g); osc.start(now); osc.stop(now + 0.20);
    } else if (type === 'backspace') {
        const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 380;
        const g = ctx.createGain(); g.gain.setValueAtTime(0.09 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
        cn(osc, g); osc.start(now); osc.stop(now + 0.07);
    } else {
        const osc = ctx.createOscillator(); osc.type = 'sine';
        osc.frequency.value = 820 + Math.random() * 380;
        const g = ctx.createGain(); g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.19 * vol, now + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.082);
        cn(osc, g); osc.start(now); osc.stop(now + 0.10);
    }
}

// ─── 3. Silent Rhythm ────────────────────────────────────────────────────────
// Very subtle — almost imperceptible clicks, like a soft metronome.
// Designed to feel like the keys themselves have tiny weight.

function _silentRhythm(ctx: AudioContext, master: GainNode, type: KeystrokeType, pan: number, vol: number): void {
    const now = ctx.currentTime;
    const pnr = _panner(ctx, master, pan);

    // All sounds are a single ultra-short noise transient, very low gain
    const noise = _noise(ctx, 0.018);
    const filt = ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = type === 'error' ? 200 : 1200; // errors slightly lower
    const g = ctx.createGain();

    if (type === 'error') {
        // Errors: slightly warmer, audible tap to alert without breaking flow
        filt.type = 'lowpass';
        filt.frequency.value = 600;
        g.gain.setValueAtTime(0.12 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    } else if (type === 'space') {
        // Slightly more prominent tick on word complete
        g.gain.setValueAtTime(0.06 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
    } else if (type === 'backspace') {
        g.gain.setValueAtTime(0.03 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
    } else {
        g.gain.setValueAtTime(0.04 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    }

    noise.connect(filt); filt.connect(g); g.connect(pnr);
    noise.start(now); noise.stop(now + 0.03);
}

// ─── 4. Arcade ───────────────────────────────────────────────────────────────
// Retro 8-bit square wave blips with no filtering — raw digital sound.

function _arcade(ctx: AudioContext, master: GainNode, type: KeystrokeType, pan: number, vol: number): void {
    const now = ctx.currentTime;
    const pnr = _panner(ctx, master, pan);
    const cn = (o: OscillatorNode, g: GainNode) => { o.connect(g); g.connect(pnr); };

    if (type === 'correct') {
        // Short square blip, pitch randomized slightly for variety
        const osc = ctx.createOscillator(); osc.type = 'square';
        osc.frequency.value = 700 + Math.floor(Math.random() * 4) * 50; // 700/750/800/850
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.10 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);
        cn(osc, g); osc.start(now); osc.stop(now + 0.045);

    } else if (type === 'error') {
        // Descending two-step buzz — classic "wrong answer" 8-bit
        [320, 200].forEach((freq, i) => {
            const osc = ctx.createOscillator(); osc.type = 'square';
            osc.frequency.value = freq;
            const g = ctx.createGain(); const t = now + i * 0.055;
            g.gain.setValueAtTime(0.12 * vol, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.050);
            cn(osc, g); osc.start(t); osc.stop(t + 0.055);
        });

    } else if (type === 'space') {
        // Ascending two-tone "level up" blip
        [500, 800].forEach((freq, i) => {
            const osc = ctx.createOscillator(); osc.type = 'square';
            osc.frequency.value = freq;
            const g = ctx.createGain(); const t = now + i * 0.040;
            g.gain.setValueAtTime(0.10 * vol, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
            cn(osc, g); osc.start(t); osc.stop(t + 0.040);
        });

    } else { // backspace
        const osc = ctx.createOscillator(); osc.type = 'square';
        osc.frequency.value = 250;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.07 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.030);
        cn(osc, g); osc.start(now); osc.stop(now + 0.035);
    }
}

// ─── 5. Nature ───────────────────────────────────────────────────────────────
// Wood taps (correct), water drop (error), wind chime (space), brush (backspace)

function _nature(ctx: AudioContext, master: GainNode, type: KeystrokeType, pan: number, vol: number): void {
    const now = ctx.currentTime;
    const pnr = _panner(ctx, master, pan);

    if (type === 'correct') {
        // Wood tap: short noise burst with aggressive low-pass (woody thwack)
        const noise = _noise(ctx, 0.040);
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = 350 + Math.random() * 100; // 350–450 Hz woody range
        filt.Q.value = 2.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.28 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
        // Add a slight thump resonance
        const osc = ctx.createOscillator(); osc.type = 'sine';
        osc.frequency.value = 140 + Math.random() * 30;
        const og = ctx.createGain();
        og.gain.setValueAtTime(0.08 * vol, now);
        og.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
        noise.connect(filt); filt.connect(g); g.connect(pnr);
        osc.connect(og); og.connect(pnr);
        noise.start(now); noise.stop(now + 0.05);
        osc.start(now); osc.stop(now + 0.06);

    } else if (type === 'error') {
        // Water drop: sine that descends quickly — "bloop"
        const osc = ctx.createOscillator(); osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.18);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.22 * vol, now + 0.010);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.connect(g); g.connect(pnr);
        osc.start(now); osc.stop(now + 0.25);

    } else if (type === 'space') {
        // Wind chime: two harmonics with longer decay — airy, open
        [880, 1320].forEach((freq, i) => {
            const osc = ctx.createOscillator(); osc.type = 'sine';
            osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.02);
            const g = ctx.createGain(); const t = now + i * 0.025;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.14 * vol, t + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
            osc.connect(g); g.connect(pnr);
            osc.start(t); osc.stop(t + 0.40);
        });

    } else { // backspace — soft brush: low-level white noise very brief
        const noise = _noise(ctx, 0.025);
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.value = 500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.06 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
        noise.connect(filt); filt.connect(g); g.connect(pnr);
        noise.start(now); noise.stop(now + 0.03);
    }
}

// ─── 6. Coach ────────────────────────────────────────────────────────────────
// Neutral neutral clicks for correct, clear bell chime for errors.
// Designed to guide without distraction — instructional tone.

function _coach(ctx: AudioContext, master: GainNode, type: KeystrokeType, pan: number, vol: number): void {
    const now = ctx.currentTime;
    const pnr = _panner(ctx, master, pan);

    if (type === 'correct') {
        // Soft, neutral click — low amplitude noise with mid-range filter
        const noise = _noise(ctx, 0.025);
        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass'; filt.frequency.value = 1600; filt.Q.value = 1.0;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.09 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
        noise.connect(filt); filt.connect(g); g.connect(pnr);
        noise.start(now); noise.stop(now + 0.03);

    } else if (type === 'error') {
        // Bell chime — distinct, musical, not harsh. Sine with slower decay.
        // Uses A4 (440Hz) and its 5th (660Hz) for a gentle "ding"
        const chimeFreqs = [440, 880];
        chimeFreqs.forEach((freq, i) => {
            const osc = ctx.createOscillator(); osc.type = 'sine';
            osc.frequency.value = freq;
            const g = ctx.createGain(); const t = now + i * 0.008;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime((i === 0 ? 0.20 : 0.10) * vol, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
            osc.connect(g); g.connect(pnr);
            osc.start(t); osc.stop(t + 0.50);
        });

    } else if (type === 'space') {
        // Soft confirmation tone — single gentle sine, mid pitch
        const osc = ctx.createOscillator(); osc.type = 'sine';
        osc.frequency.value = 660;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.13 * vol, now + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(g); g.connect(pnr);
        osc.start(now); osc.stop(now + 0.14);

    } else { // backspace — very soft reverse click
        const noise = _noise(ctx, 0.020);
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass'; filt.frequency.value = 2000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.05 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
        noise.connect(filt); filt.connect(g); g.connect(pnr);
        noise.start(now); noise.stop(now + 0.022);
    }
}

// ─── Primary public API ──────────────────────────────────────────────────────

/** Play a synthesized keystroke sound. */
export function playKeystroke(key: string, type: KeystrokeType, focusMode = false): void {
    if (_settings.mode === 'off') return;
    if (focusMode && _settings.silenceInFocusMode) return;

    try {
        const ctx = _getCtx();
        if (!ctx || !_master) return;

        const pan = KEY_PAN_MAP[key.toLowerCase()] ?? 0;
        const vol = _settings.volume;

        switch (_settings.mode) {
            case 'mechanical':    _mechanical(ctx, _master, type, pan, vol);    break;
            case 'cute':          _cute(ctx, _master, type, pan, vol);          break;
            case 'silent-rhythm': _silentRhythm(ctx, _master, type, pan, vol); break;
            case 'arcade':        _arcade(ctx, _master, type, pan, vol);        break;
            case 'nature':        _nature(ctx, _master, type, pan, vol);        break;
            case 'coach':         _coach(ctx, _master, type, pan, vol);         break;
        }
    } catch (e) {
        console.warn('[Moji Audio] playKeystroke failed silently:', e);
    }
}

/** Preview sound for Settings test button — plays a brief sequence. */
export function playPreview(mode: AudioMode): void {
    if (mode === 'off') return;
    const prev = _settings.mode;
    _settings.mode = mode;
    playKeystroke('f', 'correct');
    setTimeout(() => playKeystroke('j', 'correct'), 80);
    setTimeout(() => playKeystroke(' ', 'space'), 180);
    setTimeout(() => { _settings.mode = prev; }, 300);
}

/** Game-specific audio cues (Pace Runner / Recovery Rush). */
export function playGameAlert(type: 'behind' | 'win' | 'lose'): void {
    if (_settings.mode === 'off') return;
    try {
        const ctx = _getCtx();
        const masterNode = _master;
        if (!ctx || !masterNode) return;
        const now = ctx.currentTime;
        const vol = _settings.volume;

        if (type === 'behind') {
            const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 160;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.18 * vol, now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
            osc.connect(g); g.connect(masterNode);
            osc.start(now); osc.stop(now + 0.26);

        } else if (type === 'win') {
            [440, 554, 659, 880].forEach((freq, i) => {
                const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
                const g = ctx.createGain(); const t = now + i * 0.085;
                g.gain.setValueAtTime(0.22 * vol, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.30);
                osc.connect(g); g.connect(masterNode);
                osc.start(t); osc.stop(t + 0.34);
            });

        } else if (type === 'lose') {
            [440, 370, 277].forEach((freq, i) => {
                const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
                const g = ctx.createGain(); const t = now + i * 0.095;
                g.gain.setValueAtTime(0.18 * vol, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
                osc.connect(g); g.connect(masterNode);
                osc.start(t); osc.stop(t + 0.30);
            });
        }
    } catch (e) {
        console.warn('[Moji Audio] playGameAlert failed silently:', e);
    }
}
