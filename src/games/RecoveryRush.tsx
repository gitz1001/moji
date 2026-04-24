import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUILTIN_LIBRARY } from '../library/builtin';
import { useTypingEngine } from '../engine';
import { TypingArea } from '../components/TypingArea';
import { saveRun } from '../storage/runs';
import './PaceRunner.css'; // Reuse styles for now
import { DiamondIcon, TimerIcon } from '../components/icons';

export function RecoveryRush() {
    const navigate = useNavigate();

    // Game State
    const [duration, setDuration] = useState(30);
    const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');

    // Content (Random Chapter from Pride & Prejudice)
    const content = useMemo(() => {
        const book = BUILTIN_LIBRARY[2]; // Pride
        // Random start paragraph
        const start = Math.floor(Math.random() * 5);
        const chapter = book.chapters[0];
        return chapter.paragraphs.slice(start, start + 5).join(' ');
    }, []);

    const words = useMemo(() => content.split(/\s+/), [content]);

    // ... 

    // Engine
    const { snapshot, handleKeyDown } = useTypingEngine({
        words,
        durationMs: duration * 1000,
        mode: 'accuracy', // This is the key: blocks space on error
        onFinish: (metrics) => {
            setGameState('finished');
            saveRun(duration * 1000, metrics, {
                mode: 'game',
                gameId: 'recovery-rush',
                gameSettings: { duration }
            });
        }
    });

    // Shake Logic
    const [shake, setShake] = useState(false);
    useEffect(() => {
        if (snapshot.metrics?.errorEvents && snapshot.metrics.errorEvents.length > 0) {
            const lastError = snapshot.metrics.errorEvents[snapshot.metrics.errorEvents.length - 1];
            // If error is recent (< 100ms), trigger shake
            if (Date.now() - lastError.timestamp < 100) {
                setShake(true);
                setTimeout(() => setShake(false), 300);
            }
        }
    }, [snapshot.metrics?.errorEvents]);

    // Shortcuts
    useEffect(() => {
        const handleShortcut = (e: KeyboardEvent) => {
            if (gameState === 'playing' && e.key === 'Tab') {
                e.preventDefault();
                navigate('/practice');
            }
            if ((gameState === 'finished' || gameState === 'setup') && e.key === 'Enter') {
                handleStart();
            }
        };
        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, [gameState, navigate]);

    const handleStart = () => {
        setGameState('playing');
        // Engine starts on first key
    };

    return (
        <div className="page page--runner">
            {gameState === 'setup' && (
                <div className="runner-setup">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Recovery Rush <DiamondIcon /></h1>
                    <p>Accuracy Logic: You <strong>cannot</strong> proceed to the next word until the current one is perfect.</p>

                    <div className="runner-setting">
                        <label>Duration: <span className="highlight">{duration}s</span></label>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className={`btn-small ${duration === 30 ? 'active' : ''}`} onClick={() => setDuration(30)}>30s</button>
                            <button className={`btn-small ${duration === 60 ? 'active' : ''}`} onClick={() => setDuration(60)}>60s</button>
                        </div>
                    </div>

                    <button className="btn-primary" onClick={handleStart}>Start Sprint (Enter)</button>
                    <button className="btn-text" onClick={() => navigate('/practice')}>Cancel</button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="runner-game">
                    <header className="runner-hud">
                        <div className="hud-item">
                            <span className="hud-label">TIME</span>
                            <span className="hud-val">{Math.ceil(snapshot.timeRemainingMs / 1000)}</span>
                        </div>
                        <div className="hud-item">
                            <span className="hud-label">WPM</span>
                            <span className="hud-val">{snapshot.metrics?.correctedWpm || 0}</span>
                        </div>
                        <button className="btn-small" onClick={() => navigate('/practice')}>Quit (Tab)</button>
                    </header>

                    <div className={`runner-arena ${shake ? 'anim-shake' : ''}`} style={{ borderColor: shake ? 'var(--color-error)' : 'var(--accent)' }}>
                        <TypingArea
                            snapshot={snapshot}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="runner-hint">
                        Errors block progress. Fix them instantly!
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div className="runner-result runner-result--won anim-pop-in">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>Time's Up! <TimerIcon /></h1>
                    <div className="stat-grid" style={{ marginBottom: '2rem' }}>
                        <div>
                            <div className="stat-val">{snapshot.metrics?.correctedWpm}</div>
                            <div className="stat-lbl">WPM</div>
                        </div>
                        <div>
                            {/* Since mode=accuracy, this should be high, but tracks raw inputs */}
                            <div className="stat-val">{snapshot.metrics?.accuracy}%</div>
                            <div className="stat-lbl">ACC</div>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => setGameState('setup')}>Play Again (Enter)</button>
                    <button className="btn-text" onClick={() => navigate('/practice')}>Back to Library</button>
                </div>
            )}
        </div>
    );
}
