/** Typing Engine State Machine Types */

export type EngineState = 'idle' | 'running' | 'paused' | 'finished';

export type DrillMode = 'standard' | 'accuracy' | 'pace' | 'weakness';

export type ConsistencyLabel = 'Smooth' | 'Steady' | 'Spiky' | 'Chaotic';

export interface ConsistencyMetrics {
    score: number; // 0-100
    label: ConsistencyLabel;
    speedStability: number; // 0-1
    errorStability: number; // 0-1
    recoveryScore: number; // 0-1
    avgStreakLen: number;
    recoveryMsAvg: number;
}

export interface Insight {
    message: string;
    metrics: {
        label: string;
        value: string;
    };
    nextDrill: {
        mode: DrillMode;
        label: string;
    };
}

export interface ErrorEvent {
    timestamp: number;
    wordIndex: number;
    charIndex: number;
    expected: string;
    typed: string;
    recoveredAt?: number; // timestamp when flow resumed (optional for now)
}

export interface TypingMetrics {
    rawWpm: number;
    correctedWpm: number;
    accuracy: number;
    totalChars: number;
    correctChars: number;
    incorrectChars: number;
    elapsedMs: number;
    wpmTimeline: number[];
    consistency?: ConsistencyMetrics;
    insight?: Insight;
    errorEvents?: ErrorEvent[];
}

export interface WordState {
    word: string;
    typed: string;
    isComplete: boolean;
    isCorrect: boolean;
}

export interface EngineSnapshot {
    state: EngineState;
    words: WordState[];
    currentWordIndex: number;
    currentInput: string;
    timeRemainingMs: number;
    metrics: TypingMetrics | null;
}

export interface EngineConfig {
    durationMs: number;
    words: string[];
}

/** Keystroke event for tracking */
export interface KeystrokeEvent {
    timestamp: number;
    key: string;
    isCorrect: boolean;
    wordIndex: number;
    charIndex: number;
}
