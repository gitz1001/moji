/** ConsistencyBadge Component */

import type { ConsistencyMetrics } from '../../engine';
import './ConsistencyBadge.css';

interface ConsistencyBadgeProps {
    metrics: ConsistencyMetrics;
}

export function ConsistencyBadge({ metrics }: ConsistencyBadgeProps) {
    const { score, label } = metrics;

    // Determine color class based on label/score
    let colorClass = 'consistency-badge--chaotic';
    if (score >= 90) colorClass = 'consistency-badge--smooth';
    else if (score >= 75) colorClass = 'consistency-badge--steady';
    else if (score >= 60) colorClass = 'consistency-badge--spiky';

    return (
        <div className={`consistency-badge ${colorClass}`}>
            <div className="consistency-badge-score">{score}</div>
            <div className="consistency-badge-label">{label}</div>
        </div>
    );
}
