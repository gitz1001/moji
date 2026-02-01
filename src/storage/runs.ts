/** Runs Repository */

import { getDB, type RunRecord } from './db';
import type { TypingMetrics } from '../engine';

export async function saveRun(
    durationMs: number,
    metrics: TypingMetrics
): Promise<string> {
    const db = await getDB();
    const id = crypto.randomUUID();
    const ts = Date.now();

    const run: RunRecord = {
        id,
        ts,
        durationMs,
        metrics,
    };

    await db.put('runs', run);
    return id;
}

export async function getAllRuns(): Promise<RunRecord[]> {
    const db = await getDB();
    // Get all runs and sort by timestamp desc (newest first)
    const runs = await db.getAllFromIndex('runs', 'by-ts');
    return runs.reverse();
}

export async function getRun(id: string): Promise<RunRecord | undefined> {
    const db = await getDB();
    return db.get('runs', id);
}

export async function importRuns(runs: RunRecord[]): Promise<number> {
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
}
