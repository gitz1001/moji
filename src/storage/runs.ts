/** Runs Repository with LocalStorage Fallback */

import { getDB, type RunRecord } from './db';
import type { TypingMetrics } from '../engine';

const LS_KEY = 'moji_runs_fallback';

export interface StorageInfo {
    mode: 'indexeddb' | 'localstorage' | 'hybrid';
    usageBytes: number;
    runCount: number;
    lsFallbackCount: number;
}

export async function getStorageDiagnostics(): Promise<StorageInfo> {
    let mode: 'indexeddb' | 'localstorage' | 'hybrid' = 'indexeddb';
    let runCount = 0;
    let lsFallbackCount = 0;

    // Check LocalStorage
    const lsData = localStorage.getItem(LS_KEY);
    if (lsData) {
        try {
            const lsRuns = JSON.parse(lsData);
            lsFallbackCount = lsRuns.length;
        } catch (e) { /* ignore */ }
    }

    // Check IndexedDB
    try {
        const db = await getDB();
        runCount = await db.count('runs');
    } catch (e) {
        mode = 'localstorage';
        // In full fallback, LS count is the main count
        runCount = lsFallbackCount;
    }

    if (mode === 'indexeddb' && lsFallbackCount > 0) {
        mode = 'hybrid';
        runCount += lsFallbackCount;
    }

    // Estimate usage (rough)
    let usageBytes = 0;
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const est = await navigator.storage.estimate();
            if (est.usage) usageBytes = est.usage;
        } catch (e) { /* ignore */ }
    } else {
        // Fallback size check (LS only)
        usageBytes = (lsData || '').length * 2;
    }

    return { mode, usageBytes, runCount, lsFallbackCount };
}

// Safe UUID generator
function safeUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export async function saveRun(
    durationMs: number,
    metrics: TypingMetrics,
    sessionMeta?: {
        sessionId?: string;
        sessionStep?: 'baseline' | 'drill' | 'verify';
        mode?: 'test' | 'game';
        gameId?: string;
        gameSettings?: any;
    }
): Promise<string> {
    const id = safeUUID();
    const ts = Date.now();

    const run: RunRecord = {
        id,
        ts,
        durationMs,
        metrics,
        ...sessionMeta
    };

    try {
        const db = await getDB();
        await db.put('runs', run);
    } catch (e) {
        console.warn('IDB write failed, falling back to LocalStorage', e);
        try {
            const ls = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
            ls.push(run);
            localStorage.setItem(LS_KEY, JSON.stringify(ls));
        } catch (lsErr) {
            console.error('LocalStorage write also failed', lsErr);
            // We suppress error to avoid crashing app flow, but user data is lost if this hits.
        }
    }
    return id;
}

export async function getAllRuns(): Promise<RunRecord[]> {
    try {
        const db = await getDB();
        // Get all runs and sort by timestamp desc (newest first)
        const runs = await db.getAllFromIndex('runs', 'by-ts');
        return runs.reverse();
    } catch (e) {
        console.warn('IDB read failed, falling back to LocalStorage', e);
        const ls = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        // Sort LS desc
        return ls.sort((a: RunRecord, b: RunRecord) => b.ts - a.ts);
    }
}

export async function getRun(id: string): Promise<RunRecord | undefined> {
    try {
        const db = await getDB();
        return await db.get('runs', id);
    } catch (e) {
        // Fallback to LS
        const ls = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        return ls.find((r: RunRecord) => r.id === id);
    }
}

export async function importRuns(runs: RunRecord[]): Promise<number> {
    try {
        const db = await getDB();
        const tx = db.transaction('runs', 'readwrite');
        let count = 0;

        for (const run of runs) {
            const existing = await tx.store.get(run.id);
            if (!existing) {
                await tx.store.add(run);
                count++;
            }
        }

        await tx.done;
        return count;
    } catch (e) {
        // Fallback Import
        console.warn('IDB import failed, using LS', e);
        const ls = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        let count = 0;
        for (const run of runs) {
            if (!ls.find((r: RunRecord) => r.id === run.id)) {
                ls.push(run);
                count++;
            }
        }
        localStorage.setItem(LS_KEY, JSON.stringify(ls));
        return count;
    }
}

export interface StatsSummary {
    totalRuns: number;
    totalTimeMs: number;
    bestWpm: number;
    avgWpm: number;
    avgAccuracy: number;
    gameStats: Record<string, { played: number; bestWpm: number }>;
}

export function calculateStats(runs: RunRecord[]): StatsSummary {
    const summary: StatsSummary = {
        totalRuns: runs.length,
        totalTimeMs: 0,
        bestWpm: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        gameStats: {}
    };

    let totalWpm = 0;
    let totalAcc = 0;

    runs.forEach(run => {
        summary.totalTimeMs += run.durationMs;
        if (run.metrics.correctedWpm > summary.bestWpm) {
            summary.bestWpm = run.metrics.correctedWpm;
        }
        totalWpm += run.metrics.correctedWpm;
        totalAcc += run.metrics.accuracy;

        // Game Stats
        if (run.mode === 'game' && run.gameId) {
            if (!summary.gameStats[run.gameId]) {
                summary.gameStats[run.gameId] = { played: 0, bestWpm: 0 };
            }
            const gs = summary.gameStats[run.gameId];
            gs.played++;
            if (run.metrics.correctedWpm > gs.bestWpm) {
                gs.bestWpm = run.metrics.correctedWpm;
            }
        }
    });

    if (runs.length > 0) {
        summary.avgWpm = Math.round(totalWpm / runs.length);
        summary.avgAccuracy = Math.round((totalAcc / runs.length) * 10) / 10;
    }

    return summary;
}
