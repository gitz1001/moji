import { useEffect, useState } from 'react';
import { getAllRuns, type RunRecord } from '../storage';
import { DashboardStats } from '../components/History';
import './HistoryPage.css';

// ── Rank Helpers ──────────────────────────────────────────────────────────────
function getRank(wpm: number, accuracy: number): string {
    if (wpm >= 120 && accuracy >= 98) return 'S+';
    if (wpm >= 100 && accuracy >= 95) return 'S';
    if (wpm >= 80  && accuracy >= 90) return 'A';
    if (wpm >= 60  && accuracy >= 85) return 'B';
    if (wpm >= 40)                    return 'C';
    return 'D';
}

function rankClass(rank: string): string {
    const map: Record<string, string> = {
        'S+': 'history-rank--sp',
        'S':  'history-rank--s',
        'A':  'history-rank--a',
        'B':  'history-rank--b',
        'C':  'history-rank--c',
        'D':  'history-rank--d',
    };
    return map[rank] ?? 'history-rank--d';
}

function RankBadge({ rank }: { rank: string }) {
    return (
        <span className={`history-rank ${rankClass(rank)}`}>
            {rank}
        </span>
    );
}

// ── Mode label ────────────────────────────────────────────────────────────────
function modeLabel(run: RunRecord): string {
    if (run.mode === 'game') {
        return run.gameId === 'pace-runner' ? 'Pace Runner' : 'Recovery Rush';
    }
    return `${Math.round(run.durationMs / 1000)}s Test`;
}

// ── Page ──────────────────────────────────────────────────────────────────────
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
        return (
            <div className="history-page">
                <div className="history-empty">
                    <p>Loading your runs…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <header className="history-header">
                <h1 className="history-title">History</h1>
                <span className="history-count">{runs.length} runs</span>
            </header>

            <DashboardStats runs={runs} />

            {runs.length === 0 ? (
                <div className="history-empty">
                    <p>No runs recorded yet.</p>
                    <p>Complete a test to start tracking your progress.</p>
                </div>
            ) : (
                <div className="history-list">
                    {runs.map((run) => {
                        const rank = getRank(run.metrics.correctedWpm, run.metrics.accuracy);
                        return (
                            <div key={run.id} className="history-item">
                                <div className="history-date">
                                    <span className="history-date-time">
                                        {new Date(run.ts).toLocaleDateString()}{' '}
                                        {new Date(run.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="history-date-ago">{modeLabel(run)}</span>
                                </div>

                                <div className="history-metric">
                                    <span className="history-metric-value">{run.metrics.correctedWpm}</span>
                                    <span className="history-metric-label">WPM</span>
                                </div>

                                <div className="history-metric">
                                    <span className="history-metric-value">{run.metrics.accuracy}%</span>
                                    <span className="history-metric-label">Acc</span>
                                </div>

                                <RankBadge rank={rank} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
