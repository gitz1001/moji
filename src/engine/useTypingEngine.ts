/** Typing Engine Hook — State Machine + Keyboard Handling + Timeline + Consistency */

import { useRef, useState, useCallback, useEffect } from 'react';
import type { EngineState, EngineSnapshot, WordState, TypingMetrics, ErrorEvent, DrillMode } from './types';
import { calculateMetrics } from './metrics';
import { calculateConsistency } from './consistency';
import { generateInsight } from './insights';
import { playKeystroke } from './audio';

/** Sampling interval for WPM timeline (ms) */
const TIMELINE_SAMPLE_INTERVAL_MS = 1000;

interface UseTypingEngineOptions {
    words: string[];
    durationMs: number;
    mode?: DrillMode;
    focusMode?: boolean;
    onFinish?: (metrics: TypingMetrics) => void;
}

interface UseTypingEngineReturn {
    snapshot: EngineSnapshot;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    reset: () => void;
    start: () => void;
    togglePause: () => void;
}

export function useTypingEngine({
    words,
    durationMs,
    mode = 'standard',
    focusMode = false,
    onFinish,
}: UseTypingEngineOptions): UseTypingEngineReturn {
    // === React State ===
    const [state, setState] = useState<EngineState>('idle');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentInput, setCurrentInput] = useState('');
    const [timeRemainingMs, setTimeRemainingMs] = useState(durationMs);
    const [metrics, setMetrics] = useState<TypingMetrics | null>(null);

    // === Refs ===
    const wordsRef = useRef<WordState[]>([]);
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);
    const timelineSamplerRef = useRef<number | null>(null);
    const wpmTimelineRef = useRef<number[]>([]);

    // Pause logic
    const pausedDurationRef = useRef<number>(0);
    const pauseStartTimeRef = useRef<number | null>(null);

    // Consistency
    const errorEventsRef = useRef<ErrorEvent[]>([]);
    const lastErrorRef = useRef<ErrorEvent | null>(null);

    // State refs for sampling
    const currentInputRef = useRef<string>('');
    const currentWordIndexRef = useRef<number>(0);

    useEffect(() => { currentInputRef.current = currentInput; }, [currentInput]);
    useEffect(() => { currentWordIndexRef.current = currentWordIndex; }, [currentWordIndex]);

    // Init words
    useEffect(() => {
        wordsRef.current = words.map((word) => ({
            word,
            typed: '',
            isComplete: false,
            isCorrect: false,
        }));
    }, [words]);

    // Cleanup
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, []);

    const clearTimers = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (timelineSamplerRef.current) { clearInterval(timelineSamplerRef.current); timelineSamplerRef.current = null; }
    };

    const sampleWpm = useCallback(() => {
        if (!startTimeRef.current) return;

        // Effective elapsed time excluding pauses
        // If currently running: Date.now() - start - pausedDuration
        // If paused: pauseStartTime - start - pausedDuration (handled by effective elapsed below?)

        // Actually, sampling only runs when 'running'.
        const now = Date.now();
        const effectiveElapsed = now - startTimeRef.current - pausedDurationRef.current;

        if (effectiveElapsed <= 0) return;

        const wordsSnapshot = wordsRef.current.map((w, i) =>
            i === currentWordIndexRef.current
                ? { ...w, typed: currentInputRef.current }
                : w
        );

        const currentMetrics = calculateMetrics(wordsSnapshot, effectiveElapsed, []);
        wpmTimelineRef.current.push(currentMetrics.correctedWpm);
    }, []);

    const finishTest = useCallback(() => {
        clearTimers();

        if (!startTimeRef.current) return;
        const now = Date.now();
        // If finishing while paused (unlikely via timer, but manually possible), handle it?
        // Assuming finish happens while running or via timeout.

        const effectiveElapsed = now - startTimeRef.current - pausedDurationRef.current;

        sampleWpm();

        const basicMetrics = calculateMetrics(
            wordsRef.current,
            effectiveElapsed,
            wpmTimelineRef.current
        );

        const consistency = calculateConsistency(
            wpmTimelineRef.current,
            errorEventsRef.current
        );

        const combinedMetrics: TypingMetrics = {
            ...basicMetrics,
            consistency,
            errorEvents: errorEventsRef.current
        };

        const insight = generateInsight(combinedMetrics);

        const finalMetrics: TypingMetrics = {
            ...basicMetrics,
            consistency,
            insight,
            errorEvents: errorEventsRef.current
        };

        setMetrics(finalMetrics);
        setState('finished');
        onFinish?.(finalMetrics);
    }, [durationMs, onFinish, sampleWpm]);

    const startIntervals = useCallback(() => {
        clearTimers();

        timerRef.current = window.setInterval(() => {
            if (!startTimeRef.current) return;
            const now = Date.now();
            const elapsed = now - startTimeRef.current - pausedDurationRef.current;

            if (durationMs > 0) {
                const remaining = Math.max(0, durationMs - elapsed);
                setTimeRemainingMs(remaining);

                if (remaining <= 0) {
                    finishTest();
                }
            } else {
                // Infinite mode: just running
                setTimeRemainingMs(0);
            }
        }, 100);

        timelineSamplerRef.current = window.setInterval(() => {
            sampleWpm();
        }, TIMELINE_SAMPLE_INTERVAL_MS);
    }, [durationMs, finishTest, sampleWpm]);

    const start = useCallback(() => {
        reset(); // Reset everything first
    }, []); // Logic moved to reset and handleKeyDown

    const reset = useCallback(() => {
        clearTimers();
        startTimeRef.current = null;
        wpmTimelineRef.current = [];
        errorEventsRef.current = [];
        lastErrorRef.current = null;
        pausedDurationRef.current = 0;
        pauseStartTimeRef.current = null;

        wordsRef.current = words.map((word) => ({
            word,
            typed: '',
            isComplete: false,
            isCorrect: false,
        }));

        setState('idle');
        setCurrentWordIndex(0);
        setCurrentInput('');
        setTimeRemainingMs(durationMs);
        setMetrics(null);
    }, [words, durationMs]);

    const togglePause = useCallback(() => {
        if (state === 'idle' || state === 'finished') return;

        if (state === 'running') {
            // Pause
            setState('paused');
            clearTimers();
            pauseStartTimeRef.current = Date.now();
        } else if (state === 'paused') {
            // Resume
            if (pauseStartTimeRef.current) {
                const pausedTime = Date.now() - pauseStartTimeRef.current;
                pausedDurationRef.current += pausedTime;
                pauseStartTimeRef.current = null;
            }
            setState('running');
            startIntervals();
        }
    }, [state, startIntervals]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (state === 'finished' || state === 'paused') return;

        const key = e.key;

        // Start on first character
        if (state === 'idle' && key.length === 1 && !e.ctrlKey && !e.metaKey) {
            setState('running');
            startTimeRef.current = Date.now();
            startIntervals();
        }

        if (e.ctrlKey || e.metaKey) return;

        if (key === 'Backspace') {
            e.preventDefault();
            playKeystroke('Backspace', 'backspace', focusMode);
            setCurrentInput((prev) => prev.slice(0, -1));
            return;
        }

        const now = Date.now();
        const currentWord = wordsRef.current[currentWordIndex];
        if (!currentWord) return;

        if (key === ' ') {
            e.preventDefault();

            const isWordCorrectSoFar = currentInput === currentWord.word;

            if (mode === 'accuracy' && !isWordCorrectSoFar) {
                return; // Accuracy lock
            }

            currentWord.typed = currentInput;
            currentWord.isComplete = true;
            currentWord.isCorrect = isWordCorrectSoFar;

            if (!currentWord.isCorrect) {
                const err: ErrorEvent = {
                    timestamp: now,
                    wordIndex: currentWordIndex,
                    charIndex: currentInput.length,
                    expected: ' ',
                    typed: ' '
                };
                errorEventsRef.current.push(err);
                lastErrorRef.current = err;
                playKeystroke(' ', 'error', focusMode);
            } else {
                if (lastErrorRef.current && !lastErrorRef.current.recoveredAt) {
                    lastErrorRef.current.recoveredAt = now;
                }
                playKeystroke(' ', 'space', focusMode);
            }

            const nextIndex = currentWordIndex + 1;
            if (nextIndex >= wordsRef.current.length) {
                finishTest();
                return;
            }

            setCurrentWordIndex(nextIndex);
            setCurrentInput('');
            return;
        }

        if (key.length === 1) {
            e.preventDefault();

            const charIndex = currentInput.length;
            const expectedChar = currentWord.word[charIndex];
            const isCorrect = key === expectedChar;

            if (!isCorrect) {
                const err: ErrorEvent = {
                    timestamp: now,
                    wordIndex: currentWordIndex,
                    charIndex: charIndex,
                    expected: expectedChar || '',
                    typed: key
                };
                errorEventsRef.current.push(err);
                lastErrorRef.current = err;
                playKeystroke(key, 'error', focusMode);
            } else {
                if (lastErrorRef.current && !lastErrorRef.current.recoveredAt) {
                    lastErrorRef.current.recoveredAt = now;
                }
                playKeystroke(key, 'correct', focusMode);
            }

            setCurrentInput((prev) => prev + key);
        }
    }, [state, currentWordIndex, currentInput, startIntervals, finishTest, mode]);

    const snapshot: EngineSnapshot = {
        state,
        words: wordsRef.current.map((w, i) =>
            i === currentWordIndex
                ? { ...w, typed: currentInput }
                : w
        ),
        currentWordIndex,
        currentInput,
        timeRemainingMs,
        metrics,
    };

    return {
        snapshot,
        handleKeyDown,
        reset,
        start,
        togglePause,
    };
}
