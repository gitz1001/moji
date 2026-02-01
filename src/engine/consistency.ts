/** Consistency Score Logic */


import type { ConsistencyMetrics, ErrorEvent } from './types';

// Clamp helper
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

// Mean helper
const getMean = (data: number[]) => {
    if (data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
};

// StdDev helper
const getStdDev = (data: number[]) => {
    if (data.length < 2) return 0;
    const m = getMean(data);
    const variance = data.reduce((acc, val) => acc + (val - m) ** 2, 0) / (data.length - 1);
    return Math.sqrt(variance);
};

/**
 * Compute Consistency Score v1
 * Formula: 0.55*speed + 0.25*error + 0.20*recovery
 */
export function calculateConsistency(
    wpmTimeline: number[],
    errorEvents: ErrorEvent[]
): ConsistencyMetrics {
    // 1. Speed Stability (Variance of WPM timeline)
    const mu = getMean(wpmTimeline);
    const sigma = getStdDev(wpmTimeline);
    // Avoid division by zero
    const speedStability = clamp(1 - (sigma / Math.max(mu, 1)), 0, 1);

    // 2. Error Clustering (Bursts vs Spread)
    // Compute consecutive error streak lengths
    // Sort errors by timestamp
    const sortedErrors = [...errorEvents].sort((a, b) => a.timestamp - b.timestamp);

    let streaks: number[] = [];
    if (sortedErrors.length > 0) {
        let currentStreak = 1;
        // Simple heuristic: if errors are within 800ms of each other, they are a streak?
        // OR: just purely consecutive in the event log?
        // Let's use the user's prompt implication: "consecutive error streak lengths".
        // This implies we look at the stream of detailed keystrokes, but we only have `errorEvents`.
        // Let's assume `errorEvents` are discrete errors. 
        // If we don't track every key, we can't know if they are truly consecutive (no correct keys in between).
        // PROXY: If timestamps are very close (< 500ms), consider them a burst.

        for (let i = 1; i < sortedErrors.length; i++) {
            const diff = sortedErrors[i].timestamp - sortedErrors[i - 1].timestamp;
            if (diff < 500) {
                currentStreak++;
            } else {
                streaks.push(currentStreak);
                currentStreak = 1;
            }
        }
        streaks.push(currentStreak);
    } else {
        streaks = [1]; // No errors = perfect stability (actually handled by logic below)
    }

    const avgStreakLen = sortedErrors.length === 0 ? 1 : getMean(streaks);

    // avgStreakLen 1 is ideal. 
    // Penalty: (avg - 1) / 4. So avg streak 5 gives 0 score.
    const clusterPenalty = clamp((avgStreakLen - 1) / 4, 0, 1);
    const errorStability = sortedErrors.length === 0 ? 1 : (1 - clusterPenalty);

    // 3. Recovery Time
    // "for each error time, measure ms until next N correct chars"
    // We need 'recoveredAt' in ErrorEvent.
    // If we don't have it (metrics only), we can't compute it.
    // We will assume `useTypingEngine` populated `recoveredAt` for errors.

    let validRecoveries = 0;
    let totalRecoveryMs = 0;

    for (const err of sortedErrors) {
        if (err.recoveredAt) {
            totalRecoveryMs += (err.recoveredAt - err.timestamp);
            validRecoveries++;
        }
    }

    const recoveryMsAvg = validRecoveries > 0 ? (totalRecoveryMs / validRecoveries) : 0;

    // Score: clamp(1 - (avg / 2000), 0, 1) -> 2s recovery = 0 score
    const recoveryScore = sortedErrors.length === 0 ? 1 : clamp(1 - (recoveryMsAvg / 2000), 0, 1);

    // Weighted Sum
    // 55% Speed, 25% Error, 20% Recovery
    const weightedScore = (0.55 * speedStability) + (0.25 * errorStability) + (0.20 * recoveryScore);
    const score = Math.round(weightedScore * 100);

    // Label
    let label: ConsistencyMetrics['label'] = 'Chaotic';
    if (score >= 90) label = 'Smooth';
    else if (score >= 75) label = 'Steady';
    else if (score >= 60) label = 'Spiky';

    return {
        score,
        label,
        speedStability,
        errorStability,
        recoveryScore,
        avgStreakLen,
        recoveryMsAvg
    };
}
