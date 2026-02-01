/** Daily Session State Management */

// import { getAllRuns, type RunRecord } from '../storage';

export type SessionStep = 'baseline' | 'drill' | 'verify' | 'complete';
export type DrillType = 'accuracy' | 'pace' | 'weakness' | 'standard';

export interface DailySession {
    date: string; // YYYY-MM-DD
    details: {
        step: SessionStep;
        startTime: number;
        baselineRunId?: string;
        drillRunId?: string;
        verifyRunId?: string;
        // The drill assigned after baseline
        targetDrill?: DrillType;
    };
}

const STORAGE_KEY = 'moji_daily_session';

export function getTodayStr(): string {
    return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

export function getCurrentSession(): DailySession {
    const today = getTodayStr();
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
        try {
            const session = JSON.parse(stored) as DailySession;
            if (session.date === today) {
                return session;
            }
        } catch (e) {
            console.error("Failed to parse session", e);
        }
    }

    // New session for today
    return {
        date: today,
        details: {
            step: 'baseline',
            startTime: Date.now(),
        }
    };
}

export function saveSession(session: DailySession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function determineNextDrill(baselineMetrics: any): DrillType {
    if (baselineMetrics.accuracy < 96) return 'accuracy';
    if (baselineMetrics.consistency && baselineMetrics.consistency.score < 75) return 'pace';
    return 'weakness';
}
