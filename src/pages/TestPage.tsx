/** TestPage — Hero Grid Layout + Focus Mode */
import { EyeOpenIcon, EyeClosedIcon } from '../components/icons';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypingEngine, generateWords } from '../engine';
import { TypingArea } from '../components/TypingArea';
import { WpmChart, ConsistencyBadge } from '../components/Results';
import { DurationSelector } from '../components/DurationSelector';
import { CoachCard } from '../components/CoachCard';
import { DailySessionCard } from '../components/DailySessionCard';
import { SessionSummaryCard } from '../components/SessionSummaryCard';
import { SkillWidget } from '../components/SkillWidget';
import { Toast } from '../components/Toast';
import { saveRun } from '../storage';
import { generateCoachAdvice, type CoachAdvice } from '../engine/coach';
import { getCurrentSession, saveSession, determineNextDrill, type DailySession } from '../engine/session';
import { getCurrentSkill, evaluateRunForSkill } from '../engine/skills';
import './TestPage.css';

const DEFAULT_DURATION = 15_000;

export function TestPage() {
    const navigate = useNavigate();
    const [seed, setSeed] = useState(0);
    const [duration, setDuration] = useState(() => {
        const saved = localStorage.getItem('moji_test_duration');
        return saved ? parseInt(saved, 10) : DEFAULT_DURATION;
    });

    const [focusMode, setFocusMode] = useState(false);

    const [coachAdvice, setCoachAdvice] = useState<CoachAdvice | null>(() => {
        const saved = localStorage.getItem('moji_coach_advice');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return null; }
        }
        return generateCoachAdvice(null);
    });

    const [dailySession, setDailySession] = useState<DailySession>(getCurrentSession());
    const [skillState, setSkillState] = useState(getCurrentSkill());
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'info' } | null>(null);

    // Refresh session & skills on mount (focus)
    useEffect(() => {
        setDailySession(getCurrentSession());
        setSkillState(getCurrentSkill());
    }, []);

    // Persist duration
    useEffect(() => {
        localStorage.setItem('moji_test_duration', duration.toString());
    }, [duration]);

    // Generate words when seed changes
    const words = useMemo(() => generateWords(80), [seed]);

    // Save run on finish and update coach & session
    const handleFinish = useCallback(async (metrics: any) => {
        // 1. Prepare Session Meta
        let sessionId: string | undefined;
        let sessionStep: 'baseline' | 'drill' | 'verify' | undefined;
        const today = new Date().toLocaleDateString('en-CA');

        if (dailySession.date === today) {
            if (dailySession.details.step === 'baseline' && duration === 30000) {
                sessionId = dailySession.date;
                sessionStep = 'baseline';
            } else if (dailySession.details.step === 'verify' && duration === 30000) {
                sessionId = dailySession.date;
                sessionStep = 'verify';
            }
        }

        try {
            const runId = await saveRun(duration, metrics, {
                sessionId,
                sessionStep,
                mode: 'test'
            });

            if (sessionId) {
                if (sessionStep === 'baseline') {
                    const nextDrill = determineNextDrill(metrics);
                    const updated: DailySession = {
                        ...dailySession,
                        details: {
                            ...dailySession.details,
                            step: 'drill',
                            targetDrill: nextDrill,
                            baselineRunId: runId, // Real ID
                        }
                    };
                    saveSession(updated);
                    setDailySession(updated);
                } else if (sessionStep === 'verify') {
                    const updated: DailySession = {
                        ...dailySession,
                        details: {
                            ...dailySession.details,
                            step: 'complete',
                            verifyRunId: runId, // Real ID
                        }
                    };
                    saveSession(updated);
                    setDailySession(updated);
                }
            }

            const skillRes = evaluateRunForSkill(metrics, duration);
            if (skillRes.progressed) {
                const newState = getCurrentSkill();
                setSkillState(newState);

                if (skillRes.newCount === 1 && newState.node.id !== skillState.node.id) {
                    setToast({ msg: `Skill Level Up: ${newState.node.title}!`, type: 'success' });
                } else {
                    setToast({ msg: `Skill Progress: +1 towards ${skillState.node.title}`, type: 'success' });
                }
            }

        } catch (e) {
            console.error('Run save failed', e);
        }

        const newAdvice = generateCoachAdvice(metrics);
        setCoachAdvice(newAdvice);
        localStorage.setItem('moji_coach_advice', JSON.stringify(newAdvice));
    }, [duration, dailySession, skillState]);

    // Session Actions
    const startBaseline = () => {
        setDuration(30000);
        handleRestart();
    };

    const startVerify = () => startBaseline();

    const { snapshot, handleKeyDown, reset, togglePause } = useTypingEngine({
        words,
        durationMs: duration,
        onFinish: handleFinish,
    });

    const { state, timeRemainingMs, metrics } = snapshot;

    // Shortcuts
    useEffect(() => {
        const handleShortcut = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleRestart();
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

    const formatTime = useCallback((ms: number) => {
        const seconds = Math.ceil(ms / 1000);
        return `${seconds}s`;
    }, []);

    const handleRestart = useCallback(() => {
        setSeed(prev => prev + 1);
        reset();
    }, [reset]);

    return (
        <div className={`test-page ${focusMode ? 'focus-mode' : ''}`}>
            {toast && (
                <Toast
                    message={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Grid Layout: Main vs Sidebar */}
            <div className="test-grid">

                {/* 1. Main Column: Typing Hero */}
                <main className="test-main">
                    {/* Header: Timer & Duration & Focus Toggle */}
                    <div className="test-header">
                        <div className="test-timer">
                            <span className={`test-timer-value ${state === 'running' ? 'test-timer-value--running' : ''}`}>
                                {formatTime(timeRemainingMs)}
                            </span>
                        </div>

                        {state === 'idle' && (
                            <div className="header-controls">
                                <DurationSelector duration={duration} onChange={setDuration} />
                                <button
                                    className={`focus-btn ${focusMode ? 'active' : ''}`}
                                    onClick={() => setFocusMode(!focusMode)}
                                    title="Toggle Focus Mode"
                                >
                                    {focusMode ? <EyeOpenIcon /> : <EyeClosedIcon />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Typing Area: The Hero */}
                    <TypingArea snapshot={snapshot} onKeyDown={handleKeyDown} />

                    {/* Results: Slide-in/Appear Below */}
                    {state === 'finished' && metrics && (
                        <div className="test-results slide-in">
                            <h2 className="test-results-title">Results</h2>
                            <div className="test-results-grid">
                                <div className="test-result-item test-result-item--primary">
                                    <span className="test-result-value">{metrics.correctedWpm}</span>
                                    <span className="test-result-label">WPM</span>
                                </div>
                                <div className="test-result-item">
                                    <span className="test-result-value">{metrics.accuracy}%</span>
                                    <span className="test-result-label">Accuracy</span>
                                </div>
                                {metrics.consistency && <ConsistencyBadge metrics={metrics.consistency} />}
                            </div>

                            {/* WPM Chart */}
                            {metrics.wpmTimeline.length > 0 && (
                                <div className="test-results-chart">
                                    <WpmChart data={metrics.wpmTimeline} width={400} height={120} />
                                </div>
                            )}

                            <div className="test-actions">
                                <button className="test-restart-btn" onClick={handleRestart}>
                                    New Test
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Restart when idle (if not results) */}
                    {state === 'idle' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="test-restart-btn" onClick={handleRestart} style={{ fontSize: '0.85rem', padding: '8px 16px', opacity: 0.8 }}>
                                New Test (Enter)
                            </button>
                        </div>
                    )}
                </main>

                {/* 2. Right Rail: Guidance */}
                <aside className="test-sidebar">

                    {/* A. Coach (Compact) */}
                    {coachAdvice && dailySession.details.step !== 'complete' && (
                        <CoachCard advice={coachAdvice} />
                    )}

                    {/* B. Session Stepper */}
                    {dailySession.details.step !== 'complete' && (
                        <DailySessionCard
                            session={dailySession}
                            onStartBaseline={startBaseline}
                            onStartVerify={startVerify}
                        />
                    )}

                    {/* C. Session Summary (if complete) */}
                    {dailySession.details.step === 'complete' && (
                        <SessionSummaryCard session={dailySession} />
                    )}

                    {/* D. Skill Widget (Small) */}
                    <SkillWidget
                        node={skillState.node}
                        progress={skillState.progress}
                        isMastered={skillState.isMastered}
                    />
                </aside>
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
        </div>
    );
}
