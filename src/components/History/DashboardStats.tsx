/** DashboardStats Component */

import { useMemo } from 'react';
import { type RunRecord } from '../../storage';
import { Sparkline } from './Sparkline';
import './History.css';

interface DashboardStatsProps {
    runs: RunRecord[];
}

export function DashboardStats({ runs }: DashboardStatsProps) {
    const stats = useMemo(() => {
        if (runs.length === 0) return null;

        // Sort: runs are already sorted by TS desc (newest first) from getAllRuns
        // We need chronological order for sparkline, so reverse a copy for that
        const recentRuns = runs.slice(0, 10); // Last 10 runs

        // Rolling Averages (Last 10)
        const avgWpm = Math.round(recentRuns.reduce((sum, r) => sum + r.metrics.correctedWpm, 0) / recentRuns.length);
        const avgAcc = Math.round(recentRuns.reduce((sum, r) => sum + r.metrics.accuracy, 0) / recentRuns.length);
        const avgConsistency = Math.round(
            recentRuns.reduce((sum, r) => sum + (r.metrics.consistency?.score || 0), 0) / recentRuns.length
        );

        // Personal Bests (by duration)
        const pbs: Record<string, number> = {};
        runs.forEach(r => {
            const durKey = Math.round(r.durationMs / 1000) + 's';
            if (!pbs[durKey] || r.metrics.correctedWpm > pbs[durKey]) {
                pbs[durKey] = r.metrics.correctedWpm;
            }
        });

        // Trend Data (Last 20 runs chronological)
        const trendData = runs.slice(0, 20).reverse().map(r => r.metrics.correctedWpm);

        return { avgWpm, avgAcc, avgConsistency, pbs, trendData };
    }, [runs]);

    if (!stats) return null;

    return (
        <div className="history-dashboard">
            {/* Rolling Averages */}
            <div className="history-stat-card">
                <div className="history-stat-header">
                    <span className="history-stat-label">Last 10 Avg</span>
                    <Sparkline data={stats.trendData} width={60} height={20} />
                </div>
                <div className="history-stat-value">{stats.avgWpm} <span className="history-stat-unit">WPM</span></div>
                <div className="history-stat-sub">
                    <span>{stats.avgAcc}% Acc</span>
                    <span className="history-stat-sep">•</span>
                    <span>{stats.avgConsistency} Cons</span>
                </div>
            </div>

            {/* Personal Bests */}
            <div className="history-stat-card">
                <div className="history-stat-header">
                    <span className="history-stat-label">Personal Bests</span>
                    <span className="emoji-icon">🏆</span>
                </div>
                <div className="history-pb-list">
                    {Object.entries(stats.pbs).map(([dur, wpm]) => (
                        <div key={dur} className="history-pb-item">
                            <span className="history-pb-dur">{dur}</span>
                            <span className="history-pb-val">{wpm}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Run Count */}
            <div className="history-stat-card">
                <div className="history-stat-header">
                    <span className="history-stat-label">Total Runs</span>
                </div>
                <div className="history-stat-value">{runs.length}</div>
                <div className="history-stat-sub">
                    Keep showing up!
                </div>
            </div>
        </div>
    );
}
