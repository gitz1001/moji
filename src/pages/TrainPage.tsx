/** TrainPage — Drill Modes */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTypingEngine, generateWords, generateWeaknessWords, calculateTargetPace, type DrillMode } from '../engine';
import { TypingArea } from '../components/TypingArea';
import { getAllRuns } from '../storage';
import { ConsistencyBadge } from '../components/Results';
import { saveRun } from '../storage';
import './TrainPage.css';

const DRILL_DURATION = 30_000; // 30s for drills

export function TrainPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState<DrillMode>((searchParams.get('mode') as DrillMode) || 'standard');
    const [words, setWords] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [targetPace, setTargetPace] = useState<number | null>(null);

    // Load resources based on mode
    useEffect(() => {
        async function load() {
            setLoading(true);
            const history = await getAllRuns();

            if (mode === 'weakness') {
                const weakWords = generateWeaknessWords(history, 80);
                setWords(weakWords);
            } else if (mode === 'pace') {
                const pace = calculateTargetPace(history);
                setTargetPace(pace);
                setWords(generateWords(80));
            } else {
                // Accuracy or Standard
                setWords(generateWords(80));
            }
            setLoading(false);
        }
        load();
    }, [mode]);

    // Save run handler
    const handleFinish = useCallback((metrics: any) => {
        // Tag metrics with drill mode? 
        // For MVP, just save as normal run.
        saveRun(DRILL_DURATION, metrics).catch(console.error);
    }, []);

    const { snapshot, handleKeyDown, reset, togglePause } = useTypingEngine({
        words,
        durationMs: DRILL_DURATION,
        mode: mode === 'standard' ? undefined : mode,
        onFinish: handleFinish,
    });

    const { state, metrics, timeRemainingMs } = snapshot;

    // Shortcuts
    useEffect(() => {
        const handleShortcut = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                reset();
            } else if (e.key === 'Escape') {
                togglePause();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                navigate('/test');
            }
        };
        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, [reset, togglePause, navigate]);

    // Handle mode switching
    const switchMode = (newMode: DrillMode) => {
        setMode(newMode);
        reset();
    };

    if (loading) return <div className="train-page">Loading drill...</div>;

    return (
        <div className="train-page">
            <header className="train-header">
                <h1 className="train-title">Training Dojo</h1>
                <div className="train-modes">
                    <button
                        className={`train-mode-btn ${mode === 'accuracy' ? 'active' : ''}`}
                        onClick={() => switchMode('accuracy')}
                    >
                        🎯 Accuracy Lock
                    </button>
                    <button
                        className={`train-mode-btn ${mode === 'pace' ? 'active' : ''}`}
                        onClick={() => switchMode('pace')}
                    >
                        ⏱️ Pace Mode
                    </button>
                    <button
                        className={`train-mode-btn ${mode === 'weakness' ? 'active' : ''}`}
                        onClick={() => switchMode('weakness')}
                    >
                        🧠 Weakness Drill
                    </button>
                </div>
            </header>

            {/* Drill Instructions */}
            <div className="train-instruction">
                {mode === 'accuracy' && "You cannot proceed until the current word is correct."}
                {mode === 'pace' && targetPace && `Target Pace: Keep your speed steady around ${targetPace} WPM.`}
                {mode === 'weakness' && "Words generated from your most frequent mistakes."}
            </div>

            {/* Pace Visualizer (Only in Pace Mode + Running) */}
            {mode === 'pace' && state === 'running' && targetPace && snapshot.metrics && (
                <div className="pace-visualizer">
                    <div className="pace-bar-container">
                        {/* Simple feedback based on current raw WPM */}
                        {(() => {
                            // Use raw WPM for immediate feedback
                            // Need to estimate current WPM from start
                            // useTypingEngine doesn't expose real-time rawWpm in snapshot directly efficiently?
                            // actually snapshot.metrics is null until finish? 
                            // Wait, snapshot.metrics is only set on finish in my engine implementation!
                            // I need real-time WPM for Pace Mode.
                            // FIX: useTypingEngine needs to expose current WPM or I calc it here.

                            // Approximate WPM: (chars / 5) / (elapsed_min)
                            // elapsed = duration - timeRemaining
                            const elapsedSec = (DRILL_DURATION - timeRemainingMs) / 1000;
                            if (elapsedSec < 2) return <span>Starting...</span>;

                            const chars = snapshot.words.slice(0, snapshot.currentWordIndex).reduce((acc, w) => acc + w.typed.length, 0) + snapshot.currentInput.length;
                            const currentWpm = Math.round((chars / 5) / (elapsedSec / 60));

                            const diff = currentWpm - targetPace;
                            let status = "Good Pace";
                            let color = "var(--color-success)";

                            if (diff > 5) {
                                status = "Too Fast! Slow down.";
                                color = "var(--color-warning)";
                            } else if (diff < -5) {
                                status = "Too Slow! Push it.";
                                color = "var(--color-error)";
                            }

                            return (
                                <span style={{ color, fontWeight: 'bold' }}>
                                    {currentWpm} WPM — {status}
                                </span>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Paused Overlay */}
            {state === 'paused' && (
                <div className="test-paused-overlay" onClick={togglePause}>
                    <div className="test-paused-content">
                        <h2>Paused</h2>
                        <p>Press Esc to resume</p>
                    </div>
                </div>
            )}

            <div className="train-timer">
                {Math.ceil(timeRemainingMs / 1000)}s
            </div>

            <div className="train-area-wrapper">
                <TypingArea snapshot={snapshot} onKeyDown={handleKeyDown} />
            </div>

            {/* Results (reuse standard components) */}
            {state === 'finished' && metrics && (
                <div className="train-results">
                    <h2>Drill Complete</h2>
                    <div className="train-stats">
                        <div className="train-stat">
                            <span className="val">{metrics.correctedWpm}</span>
                            <span className="lbl">WPM</span>
                        </div>
                        <div className="train-stat">
                            <span className="val">{metrics.accuracy}%</span>
                            <span className="lbl">Acc</span>
                        </div>
                        {metrics.consistency && <ConsistencyBadge metrics={metrics.consistency} />}
                    </div>
                    <button className="train-retry-btn" onClick={() => reset()}>
                        Retry Drill
                    </button>
                </div>
            )}
        </div>
    );
}
