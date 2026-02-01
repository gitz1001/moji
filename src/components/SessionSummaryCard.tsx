import { useEffect, useState } from 'react';
import { type DailySession } from '../engine/session';
import { getRun, type RunRecord } from '../storage';
import './DailySessionCard.css'; // Reuse styles or create new

interface Props {
    session: DailySession;
}

export function SessionSummaryCard({ session }: Props) {
    const [beforeRun, setBeforeRun] = useState<RunRecord | null>(null);
    const [afterRun, setAfterRun] = useState<RunRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (session.details.baselineRunId && session.details.baselineRunId !== 'pending') {
                const r1 = await getRun(session.details.baselineRunId);
                if (r1) setBeforeRun(r1);
            }
            if (session.details.verifyRunId && session.details.verifyRunId !== 'pending') {
                const r2 = await getRun(session.details.verifyRunId);
                if (r2) setAfterRun(r2);
            }
            setLoading(false);
        }
        load();
    }, [session.details.baselineRunId, session.details.verifyRunId]);

    if (loading) return <div className="session-card">Loading stats...</div>;

    if (!beforeRun || !afterRun) {
        return (
            <div className="session-card">
                <div className="session-header">
                    <div className="session-title">🎉 Session Complete!</div>
                </div>
                <div style={{ padding: '1rem', color: 'var(--color-text-subtle)' }}>
                    Great work today. Come back tomorrow to keep the streak alive.
                </div>
            </div>
        );
    }

    const wpmDiff = afterRun.metrics.correctedWpm - beforeRun.metrics.correctedWpm;
    const accDiff = afterRun.metrics.accuracy - beforeRun.metrics.accuracy;

    return (
        <div className="session-card">
            <div className="session-header">
                <div className="session-title">📊 Session Report</div>
            </div>

            <div className="session-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1.5rem' }}>
                <div className="summary-stat">
                    <div className="label">WPM</div>
                    <div className="value">{afterRun.metrics.correctedWpm}</div>
                    <div className={`diff ${wpmDiff >= 0 ? 'pos' : 'neg'}`} style={{ color: wpmDiff >= 0 ? 'var(--color-success)' : 'var(--color-text-subtle)' }}>
                        {wpmDiff > 0 ? '+' : ''}{wpmDiff}
                    </div>
                </div>
                <div className="summary-stat">
                    <div className="label">Accuracy</div>
                    <div className="value">{afterRun.metrics.accuracy}%</div>
                    <div className={`diff ${accDiff >= 0 ? 'pos' : 'neg'}`} style={{ color: accDiff >= 0 ? 'var(--color-success)' : 'var(--color-text-subtle)' }}>
                        {accDiff > 0 ? '+' : ''}{accDiff}%
                    </div>
                </div>
                <div className="summary-stat">
                    <div className="label">Consistency</div>
                    {/* Lower var is better? Or just show Badge level? */}
                    {/* MVP: Just show raw recovery diff? */}
                    <div className="value">{afterRun.metrics.consistency ? afterRun.metrics.consistency.score + '/100' : '-'}</div>
                </div>
            </div>

            <div className="session-complete-msg" style={{ textAlign: 'center', paddingBottom: '1rem' }}>
                You're getting faster. See you tomorrow!
            </div>
        </div>
    );
}
