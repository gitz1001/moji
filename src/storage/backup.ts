/** Backup Logic: Export & Import */

import { getAllRuns, importRuns } from './runs';
import type { RunRecord } from './db';

const BACKUP_VERSION = 1;

export interface BackupData {
    version: number;
    exportedAt: number;
    runs: RunRecord[];
    settings?: any; // Placeholder for future settings
}

/** Generate backup object and trigger download */
export async function exportBackup(): Promise<void> {
    const runs = await getAllRuns();

    // Grab all settings from localStorage
    const settings: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('moji_')) {
            settings[key] = localStorage.getItem(key) || '';
        }
    }

    const backup: BackupData = {
        version: BACKUP_VERSION,
        exportedAt: Date.now(),
        runs,
        settings,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `moji-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/** Parse backup file and import data */
export async function importBackup(file: File): Promise<{ success: boolean; count: number; message: string }> {
    try {
        const text = await file.text();
        const data = JSON.parse(text) as BackupData;

        // Basic validation
        if (!data.version || !Array.isArray(data.runs)) {
            return { success: false, count: 0, message: 'Invalid backup file format' };
        }

        if (data.runs.length === 0) {
            return { success: true, count: 0, message: 'No runs found in backup' };
        }

        // Import runs
        const importedCount = await importRuns(data.runs);
        // Import settings
        if (data.settings) {
            for (const [key, value] of Object.entries(data.settings)) {
                if (key.startsWith('moji_')) {
                    localStorage.setItem(key, value as string);
                }
            }
        }

        return {
            success: true,
            count: importedCount,
            message: `Successfully imported ${importedCount} runs (${data.runs.length - importedCount} duplicates skipped) and restored settings.`
        };

    } catch (error) {
        console.error('Import failed:', error);
        return { success: false, count: 0, message: 'Failed to parse backup file' };
    }
}
