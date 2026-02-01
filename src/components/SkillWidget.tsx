import { type SkillNode } from '../engine/skills';
import './SkillWidget.css';

interface Props {
    node: SkillNode;
    progress: number;
    isMastered: boolean;
}

export function SkillWidget({ node, progress, isMastered }: Props) {
    const pct = Math.min(100, Math.round((progress / node.requiredCount) * 100));

    return (
        <div className="skill-card">
            <div className="skill-header-mini">
                <span className="skill-title-mini">{isMastered ? 'Mastered' : node.title}</span>
                <span className="skill-count-mini">{progress}/{node.requiredCount}</span>
            </div>
            <div className="skill-bar-mini">
                <div className="skill-fill-mini" style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    );
}
