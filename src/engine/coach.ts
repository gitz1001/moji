/** Moji Coach Logic */
import type { TypingMetrics } from './types';

export interface CoachAdvice {
    title: string;
    description: string;
    action: string;
    actionLink: string;
}

export function generateCoachAdvice(metrics: TypingMetrics | null): CoachAdvice {
    if (!metrics) {
        return {
            title: "Welcome to Moji",
            description: "Start your journey by setting a baseline.",
            action: "Start 15s Test",
            actionLink: "/test"
        };
    }

    // Check Consistency
    const consistency = metrics.consistency;
    const accuracy = metrics.accuracy;

    if (accuracy < 94) {
        return {
            title: "Focus: Precision",
            description: `Your accuracy dropped to ${accuracy}%. Speed means nothing if you have to backspace.`,
            action: "Try Accuracy Lock",
            actionLink: "/train?mode=accuracy"
        };
    }

    if (consistency && consistency.score < 70) {
        return {
            title: "Focus: Rhythm",
            description: "Your pace is uneven. Smoothness leads to speed.",
            action: "Practice Pace Mode",
            actionLink: "/train?mode=pace"
        };
    }

    // Default: Push speed or weakness
    return {
        title: "Focus: Speed",
        description: "Your foundation is solid. Time to push your limits.",
        action: "Sprint 30s",
        actionLink: "/test" // OR custom duration if supported
    };
}
