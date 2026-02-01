import { useNavigate } from 'react-router-dom';
import { type DailySession } from '../engine/session';
import './DailySessionCard.css';

interface Props {
    session: DailySession;
    onStartBaseline: () => void;
    onStartVerify: () => void;
}

export function DailySessionCard({ session, onStartBaseline, onStartVerify }: Props) {
    const navigate = useNavigate();
    const step = session.details.step;

    return (
        <div className="session-card">
            <h3 className="rail-title">Today's Session</h3>

            <div className="session-stepper">
                {/* Step 1: Baseline */}
                <StepRow
                    label="Baseline"
                    // If at baseline -> current. Else -> done.
                    status={step === 'baseline' ? 'current' : 'done'}
                    onAction={onStartBaseline}
                    actionLabel="Start"
                />

                {/* Step 2: Drill */}
                <StepRow
                    label="Drill"
                    sub={session.details.targetDrill}
                    // If baseline -> locked. If drill -> current. Else -> done.
                    status={step === 'baseline' ? 'locked' : step === 'drill' ? 'current' : 'done'}
                    onAction={() => navigate(`/train?mode=${session.details.targetDrill || 'weakness'}&session=true`)}
                    actionLabel="Go"
                />

                {/* Step 3: Verify */}
                <StepRow
                    label="Verify"
                    // If baseline/drill -> locked. If verify -> current. if complete -> done.
                    status={['baseline', 'drill'].includes(step) ? 'locked' : step === 'verify' ? 'current' : 'done'}
                    onAction={onStartVerify}
                    actionLabel="Verify"
                />
            </div>
        </div>
    );
}

function StepRow({ label, sub, status, onAction, actionLabel }: { label: string, sub?: string, status: 'current' | 'done' | 'locked', onAction: () => void, actionLabel: string }) {
    return (
        <div className={`step-row step-${status}`}>
            <div className="step-check">
                {status === 'done' ? '✓' : status === 'current' ? '●' : '○'}
            </div>
            <div className="step-info">
                <span className="step-label">{label}</span>
                {sub && <span className="step-sub"> — {sub}</span>}
            </div>
            {status === 'current' && (
                <button className="step-btn-mini" onClick={onAction}>{actionLabel}</button>
            )}
        </div>
    );
}
