/** TrainPage — Drill Modes */
import { TargetIcon, TimerIcon, BrainIcon } from '../components/icons';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTypingEngine, generateWords, generateWeaknessWords, calculateTargetPace, type DrillMode } from '../engine';
import { TypingArea } from '../components/TypingArea';
import { getAllRuns } from '../storage';
import { ConsistencyBadge } from '../components/Results';
import { Toast } from '../components/Toast';
import { saveRun } from '../storage';
import { getCurrentSession, saveSession, type DailySession } from '../engine/session';
import { evaluateRunForSkill, getCurrentSkill } from '../engine/skills';
import './TrainPage.css';

const DRILL_DURATION = 30_000; // 30s for drills

export function TrainPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState<DrillMode>((searchParams.get('mode') as DrillMode) || 'standard');
    const [words, setWords] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [targetPace, setTargetPace] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'info' } | null>(null);

    // Load resources based on mode
    useEffect(() => {
        let mounted = true;

        async function load() {
            // For standard/accuracy, we don't need history, so we can render instantly
            // but we might want new words.
            if (mode === 'standard' || mode === 'accuracy') {
                if (mounted) {
                    setWords(generateWords(80));
                    setLoading(false);
                }
                return;
            }

            // For pace/weakness, we need history
            if (mounted) setLoading(true);

            try {
                // Potential optimization: fetch only needed count?
                // For now, fetch all is okay if UI is non-blocking.
                const history = await getAllRuns();

                if (!mounted) return;

                if (mode === 'weakness') {
                    const weakWords = generateWeaknessWords(history, 80);
                    setWords(weakWords);
                } else if (mode === 'pace') {
                    const pace = calculateTargetPace(history);
                    setTargetPace(pace);
                    setWords(generateWords(80));
                }
            } catch (e) {
                console.error("Failed to load drill data", e);
                // Fallback
                setWords(generateWords(80));
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();

        return () => { mounted = false; };
    }, [mode]);

    // Save run handler
    const handleFinish = useCallback(async (metrics: any) => {
        const isSession = searchParams.get('session') === 'true';
        let sessionId: string | undefined;
        let sessionStep: 'drill' | undefined;

        // Prepare session meta
        if (isSession) {
            const session = getCurrentSession();
            if (session.date === new Date().toLocaleDateString('en-CA') && session.details.step === 'drill') {
                sessionId = session.date;
                sessionStep = 'drill';
            }
        }

        try {
            const runId = await saveRun(DRILL_DURATION, metrics, { sessionId, sessionStep });

            if (isSession && sessionId) {
                const session = getCurrentSession();
                // Update session to verify phase
                const updated: DailySession = {
                    ...session,
                    details: {
                        ...session.details,
                        step: 'verify',
                        drillRunId: runId
                    }
                };
                saveSession(updated);
            }

            // Update Skill Progress (Drills count too!)
            const skillRes = evaluateRunForSkill(metrics, DRILL_DURATION);
            if (skillRes.progressed) {
                const curSkill = getCurrentSkill();
                if (skillRes.newCount === 1 && curSkill.node.id === skillRes.skill?.id) {
                    // Note: Logic allows checking if we JUST unlocked content?
                    // If we progressed, show toast
                    setToast({ msg: `Skill Progress: +1 towards ${skillRes.skill.title}`, type: 'success' });
                } else {
                    setToast({ msg: `Skill Progress: +1 towards ${skillRes.skill?.title || 'Mastery'}`, type: 'success' });
                }
            }

        } catch (e) {
            console.error(e);
        }
    }, [searchParams]);

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

    return (
        <div className="train-page">
            {/* Toast Overlay */}
            {toast && (
                <Toast
                    message={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="train-header">
                <h1 className="train-title">Training Dojo</h1>
                <div className="train-modes">
                    <button
                        className={`train-mode-btn ${mode === 'accuracy' ? 'active' : ''}`}
                        onClick={() => switchMode('accuracy')}
                    >
                        <TargetIcon className="mode-icon" /> Accuracy Lock
                    </button>
                    <button
                        className={`train-mode-btn ${mode === 'pace' ? 'active' : ''}`}
                        onClick={() => switchMode('pace')}
                    >
                        <TimerIcon className="mode-icon" /> Pace Mode
                    </button>
                    <button
                        className={`train-mode-btn ${mode === 'weakness' ? 'active' : ''}`}
                        onClick={() => switchMode('weakness')}
                    >
                        <BrainIcon className="mode-icon" /> Weakness Drill
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
                        {/* Simple feedback based on current raw WPM (Placeholder) */}
                        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            Pace Guide Active
                        </div>
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

            {loading ? (
                <div className="train-loading">
                    <div className="train-spinner"></div>
                    <p>Preparing Drill...</p>
                </div>
            ) : (
                <>
                    <div className="train-timer">
                        {Math.ceil(timeRemainingMs / 1000)}s
                    </div>

                    <div className="train-area-wrapper">
                        <TypingArea snapshot={snapshot} onKeyDown={handleKeyDown} />
                    </div>
                </>
            )}

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
                    {searchParams.get('session') === 'true' && (
                        <button
                            className="train-retry-btn"
                            style={{ background: 'var(--color-primary)', marginLeft: '1rem' }}
                            onClick={() => navigate('/test')}
                        >
                            Return to Session →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
