/** TestPage — Typing Test with 15s Timer */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypingEngine, generateWords } from '../engine';
import { TypingArea } from '../components/TypingArea';
import { WpmChart, ConsistencyBadge } from '../components/Results';
import { saveRun } from '../storage';
import './TestPage.css';

const TEST_DURATION_MS = 15_000; // 15 seconds

export function TestPage() {
    const navigate = useNavigate();
    const [showDetails, setShowDetails] = useState(false);

    // Generate words once (memoized)
    const words = useMemo(() => generateWords(80), []);

    // Save run on finish
    const handleFinish = useCallback((metrics: any) => {
        saveRun(TEST_DURATION_MS, metrics).catch(console.error);
    }, []);

    const { snapshot, handleKeyDown, reset, togglePause } = useTypingEngine({
        words,
        durationMs: TEST_DURATION_MS,
        onFinish: handleFinish,
    });

    const { state, timeRemainingMs, metrics } = snapshot;

    // Shortcuts
    useEffect(() => {
        const handleShortcut = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                reset();
                // If we want to immediately focus input? Handled by TypingArea usually
            } else if (e.key === 'Escape') {
                togglePause();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                navigate('/train');
            }
        };

        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, [reset, togglePause, navigate]);

    // Format time display
    const formatTime = useCallback((ms: number) => {
        const seconds = Math.ceil(ms / 1000);
        return `${seconds}s`;
    }, []);

    // Handle restart with new words
    const handleRestart = useCallback(() => {
        // Generate new words and reset
        window.location.reload(); // Simple approach for now
    }, []);

    return (
        <div className="test-page">
            {/* Header with timer */}
            <div className="test-header">
                <div className="test-timer">
                    <span className={`test-timer-value ${state === 'running' ? 'test-timer-value--running' : ''}`}>
                        {formatTime(timeRemainingMs)}
                    </span>
                </div>
                <div className="test-duration-label">15s test</div>
            </div>

            {/* Paused Overlay */}
            {state === 'paused' && (
                <div className="test-paused-overlay" onClick={togglePause}>
                    <div className="test-paused-content">
                        <h2>Paused</h2>
                        <p>Press Esc to resume</p>
                    </div>
                </div>
            )}

            {/* Typing area */}
            <TypingArea snapshot={snapshot} onKeyDown={handleKeyDown} />

            {/* Results */}
            {state === 'finished' && metrics && (
                <div className="test-results">
                    <h2 className="test-results-title">Results</h2>

                    {/* Primary Metrics */}
                    <div className="test-results-grid">
                        <div className="test-result-item test-result-item--primary">
                            <span className="test-result-value">{metrics.correctedWpm}</span>
                            <span className="test-result-label">WPM</span>
                        </div>

                        <div className="test-result-item">
                            <span className="test-result-value">{metrics.accuracy}%</span>
                            <span className="test-result-label">Accuracy</span>
                        </div>

                        {metrics.consistency && (
                            <ConsistencyBadge metrics={metrics.consistency} />
                        )}
                    </div>

                    {/* Insight Card */}
                    {metrics.insight && (
                        <div className="test-insight">
                            <div className="test-insight-icon">💡</div>
                            <div className="test-insight-content">
                                <p className="test-insight-msg">{metrics.insight.message}</p>
                                <button
                                    className="test-insight-btn"
                                    onClick={() => navigate(`/train?mode=${metrics.insight?.nextDrill.mode}`)}
                                >
                                    Next: {metrics.insight.nextDrill.label} →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Details Toggle */}
                    <button
                        className="test-details-toggle"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>

                    {/* Details Section */}
                    {showDetails && (
                        <div className="test-details">
                            <div className="test-details-stats">
                                <div className="test-detail-row">
                                    <span>Raw WPM:</span>
                                    <strong>{metrics.rawWpm}</strong>
                                </div>
                                <div className="test-detail-row">
                                    <span>Characters:</span>
                                    <span>{metrics.correctChars} / {metrics.incorrectChars}</span>
                                </div>
                                {metrics.consistency && (
                                    <div className="test-detail-row">
                                        <span>Recovery Avg:</span>
                                        <span>{Math.round(metrics.consistency.recoveryMsAvg)}ms</span>
                                    </div>
                                )}
                            </div>

                            {/* WPM Timeline Chart */}
                            {metrics.wpmTimeline.length > 0 && (
                                <div className="test-results-chart">
                                    <h3 className="test-results-chart-title">WPM Timeline</h3>
                                    <WpmChart data={metrics.wpmTimeline} width={360} height={140} />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="test-actions">
                        <button className="test-restart-btn" onClick={handleRestart}>
                            Restart Test
                        </button>
                    </div>
                </div>
            )}

            {/* Restart button when idle */}
            {state === 'idle' && (
                <div className="test-actions">
                    <button className="test-restart-btn" onClick={reset}>
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
