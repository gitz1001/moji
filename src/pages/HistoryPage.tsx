import { useEffect, useState } from 'react';
import { getAllRuns, type RunRecord } from '../storage';
import { DashboardStats } from '../components/History';
import './HistoryPage.css';

// Helper for Rank
function getRank(wpm: number, accuracy: number) {
    if (wpm >= 120 && accuracy >= 98) return 'S+';
    if (wpm >= 100 && accuracy >= 95) return 'S';
    if (wpm >= 80 && accuracy >= 90) return 'A';
    if (wpm >= 60 && accuracy >= 85) return 'B';
    if (wpm >= 40) return 'C';
    return 'D';
}

function RankBadge({ rank }: { rank: string }) {
    const colorMap: Record<string, string> = {
        'S+': '#ec4899', // Pink
        'S': '#f59e0b',  // Gold
        'A': '#10b981',  // Emerald
        'B': '#3b82f6',  // Blue
        'C': '#6b7280',  // Gray
        'D': '#374151',  // Dark Gray
    };
    return (
        <span
            className="history-rank"
            style={{
                color: colorMap[rank] || colorMap['D'],
                border: `1px solid ${colorMap[rank] || colorMap['D']}`,
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginLeft: '8px'
            }}
        >
            {rank}
        </span>
    );
}

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
                                    {run.mode === 'game'
                                        ? (run.gameId === 'pace-runner' ? 'Pace Runner' : 'Recovery Rush')
                                        : `${Math.round(run.durationMs / 1000)}s Test`
                                    }
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

                            <RankBadge rank={getRank(run.metrics.correctedWpm, run.metrics.accuracy)} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
