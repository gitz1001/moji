/** Insight Generation Logic */

import type { Insight, TypingMetrics } from './types';

export function generateInsight(metrics: TypingMetrics): Insight {
    const { accuracy, consistency } = metrics;

    // Default fallback
    if (!consistency) {
        return {
            message: "Keep practicing to unlock insights.",
            metrics: { label: "Info", value: "-" },
            nextDrill: { mode: 'standard', label: 'Standard Test' }
        };
    }

    // 1. Check Accuracy First
    if (accuracy < 96) {
        return {
            message: "Accuracy is the foundation of speed. Slow down to speed up.",
            metrics: { label: "Accuracy", value: `${accuracy}%` },
            nextDrill: { mode: 'accuracy', label: 'Accuracy Lock' }
        };
    }

    // 2. Check Consistency Components
    const { speedStability, errorStability, recoveryScore, label } = consistency;

    // Identify weakest link (multiply by weights to normalize impact?)
    // Actually, just compare raw scores (0-1) to see which is lowest
    const scores = [
        { id: 'speed', val: speedStability, msg: "Speed fluctuates—try to find a steady rhythm." },
        { id: 'error', val: errorStability, msg: "Mistakes come in bursts. Reset mentally after an error." },
        { id: 'recovery', val: recoveryScore, msg: "Recovery is slow. Don't panic after a miss." }
    ];

    scores.sort((a, b) => a.val - b.val);
    const weakest = scores[0];

    // If consistency is generally low
    if (consistency.score < 75) {
        // Tie break message based on label
        let msg = weakest.msg;
        if (label === 'Spiky') msg = "Speed drops after mistakes—try Pace Mode.";
        else if (label === 'Chaotic') msg = "Rhythm is uneven. Focus on smooth, continuous flow.";

        return {
            message: msg,
            metrics: { label: "Consistency", value: consistency.score.toString() },
            nextDrill: { mode: 'pace', label: 'Pace Mode' }
        };
    }

    // Good score (Steady/Smooth)
    if (consistency.score >= 90) {
        return {
            message: "Excellent flow! Push your speed while maintaining this rhythm.",
            metrics: { label: "Consistency", value: "Smooth" },
            nextDrill: { mode: 'weakness', label: 'Weakness Drill' }
        };
    }

    // Steady (75-89) - General improvement
    return {
        message: "Solid consistency. working on weak keys will help you break through.",
        metrics: { label: "Consistency", value: "Steady" },
        nextDrill: { mode: 'weakness', label: 'Weakness Drill' }
    };
}
