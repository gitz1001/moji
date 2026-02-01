import { useEffect, useState } from 'react';
import { getAllRuns, type RunRecord } from '../storage';
import { DashboardStats } from '../components/History';
import './HistoryPage.css';

export function HistoryPage() {
    const [runs, setRuns] = useState<RunRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRuns();
    }, []);

    async function loadRuns() {
        try {
            const data = await getAllRuns();
            setRuns(data);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="history-page">Loading...</div>;
    }

    return (
        <div className="history-page">
            <header className="history-header">
                <h1 className="history-title">History</h1>
                <span>{runs.length} runs</span>
            </header>

            <DashboardStats runs={runs} />

            {runs.length === 0 ? (
                <div className="history-empty">
                    <p>No runs recorded yet.</p>
                    <p>Complete a test to start tracking your progress.</p>
                </div>
            ) : (
                <div className="history-list">
                    {runs.map((run) => (
                        <div key={run.id} className="history-item">
                            <div className="history-date">
                                <span className="history-date-time">
                                    {new Date(run.ts).toLocaleDateString()} {new Date(run.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="history-date-ago">
                                    {Math.round(run.durationMs / 1000)}s Test
                                </span>
                            </div>

                            <div className="history-metric">
                                <span className="history-metric-value">{run.metrics.correctedWpm}</span>
                                <span className="history-metric-label">WPM</span>
                            </div>

                            <div className="history-metric">
                                <span className="history-metric-value">{run.metrics.accuracy}%</span>
                                <span className="history-metric-label">Acc</span>
                            </div>

                            {run.metrics.consistency && (
                                <div
                                    className={`history-score ${run.metrics.consistency.score >= 90 ? 'history-score--high' :
                                        run.metrics.consistency.score >= 75 ? 'history-score--med' :
                                            'history-score--low'
                                        }`}
                                    title={`Consistency: ${run.metrics.consistency.label}`}
                                >
                                    {run.metrics.consistency.score}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
