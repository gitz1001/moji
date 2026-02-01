/** DashboardStats Component */

import { useMemo } from 'react';
import { type RunRecord, calculateStats } from '../../storage';
import { Sparkline } from './Sparkline';
import './History.css';

interface DashboardStatsProps {
    runs: RunRecord[];
}

export function DashboardStats({ runs }: DashboardStatsProps) {
    const stats = useMemo(() => {
        if (runs.length === 0) return null;
        return calculateStats(runs);
    }, [runs]);

    const recentTrend = useMemo(() => {
        // Last 20 runs (test mode only for WPM trend?) 
        // Or all? Let's do all for now, or filter by mode='test'
        return runs
            .filter(r => !r.mode || r.mode === 'test')
            .slice(0, 20)
            .reverse()
            .map(r => r.metrics.correctedWpm);
    }, [runs]);

    if (!stats) return null;

    return (
        <div className="history-dashboard">
            {/* General Stats */}
            <div className="history-stat-card">
                <div className="history-stat-header">
                    <span className="history-stat-label">Average WPM</span>
                    <Sparkline data={recentTrend} width={80} height={24} />
                </div>
                <div className="history-stat-value">{stats.avgWpm}</div>
                <div className="history-stat-sub">
                    <span>{stats.avgAccuracy}% Acc</span>
                    <span className="history-stat-sep">•</span>
                    <span>{stats.totalRuns} Runs</span>
                </div>
            </div>

            {/* Best WPM */}
            <div className="history-stat-card">
                <div className="history-stat-header">
                    <span className="history-stat-label">Best WPM</span>
                    <span className="emoji-icon">🏆</span>
                </div>
                <div className="history-stat-value">{stats.bestWpm}</div>
                <div className="history-stat-sub">
                    Personal Record
                </div>
            </div>

            {/* Game Stats (if any) */}
            {Object.keys(stats.gameStats).length > 0 && (
                <div className="history-stat-card">
                    <div className="history-stat-header">
                        <span className="history-stat-label">Games</span>
                        <span className="emoji-icon">🎮</span>
                    </div>
                    <div className="history-game-list">
                        {Object.entries(stats.gameStats).map(([gameId, data]: [string, { played: number; bestWpm: number }]) => (
                            <div key={gameId} className="history-game-row">
                                <span className="game-name">{gameId === 'pace-runner' ? 'Pace Runner' : 'Recovery Rush'}</span>
                                <span className="game-val">{data.bestWpm} WPM (Best)</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
