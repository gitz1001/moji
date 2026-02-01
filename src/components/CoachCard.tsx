/** Coach Card Component */
import { useNavigate } from 'react-router-dom';
import type { CoachAdvice } from '../engine/coach';
import './CoachCard.css';

interface CoachCardProps {
    advice: CoachAdvice;
}

export function CoachCard({ advice }: CoachCardProps) {
    const navigate = useNavigate();

    return (
        <div className="coach-card">
            <h3 className="rail-title">Coach</h3>
            <div className="coach-content-mini">
                <div className="coach-text">
                    <span className="coach-focus">Focus: {advice.title}</span>
                    <p className="coach-desc-mini">{advice.description}</p>
                </div>
                <button className="coach-btn-mini" onClick={() => navigate(advice.actionLink)}>
                    {advice.action}
                </button>
            </div>
        </div>
    );
}
