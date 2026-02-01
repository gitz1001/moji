/** Skill Tree Engine */

import type { TypingMetrics } from './types';

export interface SkillCriteria {
    minDurationMs: number;
    minAccuracy?: number;
    minWpm?: number;
    minConsistency?: number; // 0-100 score
    description: string;
}

export interface SkillNode {
    id: string;
    title: string;
    description: string;
    criteria: SkillCriteria;
    requiredCount: number; // How many times to achieve criteria
}

export const SKILL_TREE: SkillNode[] = [
    {
        id: 'clean_start',
        title: 'Clean Start',
        description: 'Focus on accuracy above all else.',
        criteria: {
            minDurationMs: 15_000,
            minAccuracy: 96,
            description: '> 96% Accuracy (15s+)'
        },
        requiredCount: 3
    },
    {
        id: 'steady_rhythm',
        title: 'Steady Rhythm',
        description: 'Find a pace you can maintain smoothly.',
        criteria: {
            minDurationMs: 30_000,
            minConsistency: 70, // 70/100
            description: 'Consistency Score > 70 (30s+)'
        },
        requiredCount: 3
    },
    {
        id: 'endurance_1',
        title: 'Endurance I',
        description: 'Maintain focus for longer stretches.',
        criteria: {
            minDurationMs: 60_000,
            minAccuracy: 95,
            description: '> 95% Accuracy (60s+)'
        },
        requiredCount: 2
    },
    {
        id: 'speed_base',
        title: 'Speed Base',
        description: 'Push your WPM without losing control.',
        criteria: {
            minDurationMs: 30_000,
            minWpm: 40,
            minAccuracy: 94,
            description: '> 40 WPM & > 94% Accuracy'
        },
        requiredCount: 3
    },
    {
        id: 'mastery',
        title: 'Typing Mastery',
        description: 'High speed, high accuracy, high consistency.',
        criteria: {
            minDurationMs: 30_000,
            minWpm: 60,
            minAccuracy: 97,
            minConsistency: 85,
            description: '> 60 WPM, 97% Acc, 85 Consistency'
        },
        requiredCount: 5
    }
];

export interface UserSkillProgress {
    [skillId: string]: number; // count of successes
}

const LS_KEY = 'moji_skill_progress';

export function getSkillProgress(): UserSkillProgress {
    try {
        const item = localStorage.getItem(LS_KEY);
        return item ? JSON.parse(item) : {};
    } catch {
        return {};
    }
}

export function getCurrentSkill(): { node: SkillNode, progress: number, isMastered: boolean } {
    const progress = getSkillProgress();

    // Find first incomplete skill
    for (const node of SKILL_TREE) {
        const currentCount = progress[node.id] || 0;
        if (currentCount < node.requiredCount) {
            return { node, progress: currentCount, isMastered: false };
        }
    }

    // All done
    return {
        node: SKILL_TREE[SKILL_TREE.length - 1],
        progress: SKILL_TREE[SKILL_TREE.length - 1].requiredCount,
        isMastered: true
    };
}

export function evaluateRunForSkill(metrics: TypingMetrics, durationMs: number): { progressed: boolean, skill?: SkillNode, newCount?: number } {
    const { node, progress, isMastered } = getCurrentSkill();

    if (isMastered && progress >= node.requiredCount) return { progressed: false };

    // Check criteria
    const c = node.criteria;

    if (durationMs < c.minDurationMs) return { progressed: false };
    if (c.minAccuracy && metrics.accuracy < c.minAccuracy) return { progressed: false };
    if (c.minWpm && metrics.correctedWpm < c.minWpm) return { progressed: false };
    if (c.minConsistency && (!metrics.consistency || metrics.consistency.score < c.minConsistency)) return { progressed: false };

    // Success!
    const allProgress = getSkillProgress();
    const newCount = (allProgress[node.id] || 0) + 1;
    allProgress[node.id] = newCount;

    localStorage.setItem(LS_KEY, JSON.stringify(allProgress));

    return { progressed: true, skill: node, newCount };
}
