/** Drill Logic & Helpers */

import type { RunRecord } from '../storage';
import { generateWords } from './textGenerator';

/**
 * Generate specific word set for Weakness Drill
 * Analysis past errors to find problem keys, then filters word list.
 */
export function generateWeaknessWords(history: RunRecord[], count: number = 50): string[] {
    // 1. aggregare errors from history
    const errorCounts: Record<string, number> = {};

    // Scan last 20 runs
    const recentRuns = history.slice(0, 20);

    recentRuns.forEach(run => {
        if (!run.metrics.errorEvents) return;
        run.metrics.errorEvents.forEach(err => {
            // Count the EXPECTED char (the one we missed)
            const char = err.expected.toLowerCase();
            if (char.match(/[a-z]/)) {
                errorCounts[char] = (errorCounts[char] || 0) + 1;
            }
        });
    });

    // Find top 3 weak keys
    const weakKeys = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key]) => key);

    // If no specific weaknesses, return random
    if (weakKeys.length === 0) {
        return generateWords(count);
    }

    // 2. Filter common words that contain these keys
    // We'll generate a larger pool and filter
    const pool = generateWords(300); // larger pool from base generator

    // Sort words by how many weak keys they contain
    const weighted = pool.map(word => {
        let score = 0;
        weakKeys.forEach(k => {
            if (word.includes(k)) score++;
        });
        return { word, score };
    });

    // Take top scorers
    return weighted
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map(item => item.word);
}

/**
 * Calculate Target Pace
 * Returns average WPM from last 10 runs, adjusted slightly down for control
 */
export function calculateTargetPace(history: RunRecord[]): number {
    if (history.length === 0) return 40; // Default

    const recent = history.slice(0, 10);
    const sumWpm = recent.reduce((sum, r) => sum + r.metrics.correctedWpm, 0);
    const avg = sumWpm / recent.length;

    // Target: Avg - 5 (but min 20)
    return Math.max(20, Math.round(avg - 5));
}
