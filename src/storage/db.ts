/** IndexedDB Initialization */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { TypingMetrics } from '../engine';

export interface RunRecord {
    id: string;
    ts: number;
    durationMs: number;
    metrics: TypingMetrics;
    sessionId?: string;
    sessionStep?: 'baseline' | 'drill' | 'verify';
    mode?: 'test' | 'game';
    gameId?: string; // e.g., 'pace-runner', 'recovery-rush'
    gameSettings?: any;
}

interface MojiDB extends DBSchema {
    runs: {
        key: string;
        value: RunRecord;
        indexes: { 'by-ts': number };
    };
}

const DB_NAME = 'moji-db-v2';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MojiDB>>;

export function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<MojiDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('runs')) {
                    const runStore = db.createObjectStore('runs', { keyPath: 'id' });
                    runStore.createIndex('by-ts', 'ts');
                }
            },
        });
    }
    return dbPromise;
}

export async function deleteDatabase() {
    // Close connection if open
    if (dbPromise) {
        const db = await dbPromise;
        db.close();
    }
    await window.indexedDB.deleteDatabase(DB_NAME);
    window.location.reload();
}
