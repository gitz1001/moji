/** Metrics Calculation — WPM and Accuracy */

import type { TypingMetrics, WordState } from './types';

/**
 * Standard: 5 characters = 1 word
 */
const CHARS_PER_WORD = 5;

/**
 * Calculate typing metrics from completed test
 */
export function calculateMetrics(
    words: WordState[],
    elapsedMs: number,
    wpmTimeline: number[] = []
): TypingMetrics {
    const minutes = elapsedMs / 60000;

    // Don't divide by zero
    if (minutes === 0) {
        return {
            rawWpm: 0,
            correctedWpm: 0,
            accuracy: 100,
            totalChars: 0,
            correctChars: 0,
            incorrectChars: 0,
            elapsedMs,
            wpmTimeline,
        };
    }

    let totalChars = 0;
    let correctChars = 0;
    let incorrectChars = 0;

    for (const word of words) {
        if (!word.typed) continue;

        // Count all typed characters (including space that completed word)
        const typedLen = word.typed.length;
        const targetLen = word.word.length;

        totalChars += typedLen;

        // Compare character by character
        for (let i = 0; i < typedLen; i++) {
            if (i < targetLen && word.typed[i] === word.word[i]) {
                correctChars++;
            } else {
                incorrectChars++;
            }
        }

        // Add space between words as correct char if word was completed correctly
        if (word.isComplete && word.isCorrect) {
            totalChars++;
            correctChars++;
        } else if (word.isComplete) {
            totalChars++;
            incorrectChars++;
        }
    }

    // Raw WPM = all typed chars / 5 / minutes
    const rawWpm = Math.round((totalChars / CHARS_PER_WORD) / minutes);

    // Corrected WPM = correct chars / 5 / minutes
    const correctedWpm = Math.round((correctChars / CHARS_PER_WORD) / minutes);

    // Accuracy = correct / total (avoid division by zero)
    const accuracy = totalChars > 0
        ? Math.round((correctChars / totalChars) * 100)
        : 100;

    return {
        rawWpm,
        correctedWpm,
        accuracy,
        totalChars,
        correctChars,
        incorrectChars,
        elapsedMs,
        wpmTimeline,
    };
}
