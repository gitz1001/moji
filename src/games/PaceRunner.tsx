/** PaceRunner — Specific Speed Training Game */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUILTIN_LIBRARY } from '../library/builtin';
import { useTypingEngine } from '../engine';
import { TypingArea } from '../components/TypingArea';
import { saveRun } from '../storage/runs';
import './PaceRunner.css';

// Helper to calc ghost position
function usePaceGhost(
    startTime: number | null,
    targetWpm: number,
    words: string[],
    isPaused: boolean
) {
    const [ghostIndex, setGhostIndex] = useState<{ wordIndex: number, charIndex: number } | undefined>(undefined);

    useEffect(() => {
        if (!startTime || isPaused) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedMinutes = (now - startTime) / 60000;
            // Map targetWordsTyped to word/char index

            // Note: standard word is 5 chars. WPM is based on 5 chars.
            // So characters typed = elapsedMinutes * targetWpm * 5;
            const targetCharsTyped = elapsedMinutes * targetWpm * 5;

            let charCount = 0;
            let currentWordIdx = 0;
            let currentCharIdx = 0;
            let found = false;

            for (let i = 0; i < words.length; i++) {
                const wLen = words[i].length;
                // Add 1 for space
                const wTotal = wLen + 1;

                if (charCount + wTotal > targetCharsTyped) {
                    // Ghost is in this word
                    currentWordIdx = i;
                    currentCharIdx = Math.floor(targetCharsTyped - charCount);
                    // Cap at word length
                    if (currentCharIdx > wLen) currentCharIdx = wLen;
                    found = true;
                    break;
                }
                charCount += wTotal;
            }

            if (!found) {
                // Ghost finished?
                currentWordIdx = words.length - 1;
                currentCharIdx = words[words.length - 1].length;
            }

            setGhostIndex({ wordIndex: currentWordIdx, charIndex: currentCharIdx });

        }, 100);

        return () => clearInterval(interval);
    }, [startTime, targetWpm, words, isPaused]);

    return ghostIndex;
}

export function PaceRunner() {
    const navigate = useNavigate();

    // Game State
    const [targetWpm, setTargetWpm] = useState(60);
    const [gameState, setGameState] = useState<'setup' | 'playing' | 'won' | 'lost'>('setup');

    // Content (Random Chapter from Sherlock)
    const content = useMemo(() => {
        const book = BUILTIN_LIBRARY[0]; // Sherlock
        const chapter = book.chapters[1]; // Scandal in Bohemia
        // Take first 3 paragraphs joined
        return chapter.paragraphs.slice(0, 3).join(' ');
    }, []);

    const words = useMemo(() => content.split(/\s+/), [content]);

    // Engine
    const { snapshot, handleKeyDown } = useTypingEngine({
        words,
        durationMs: 0,
        mode: 'standard'
    });

    // Ghost
    // Actually engine doesn't expose startTime directly in snapshot. 
    // We need to track our own start for the ghost or expose it.
    // Let's rely on a local start time ref sync'd with engine running state.
    const [localStartTime, setLocalStartTime] = useState<number | null>(null);

    useEffect(() => {
        if (snapshot.state === 'running' && !localStartTime) {
            setLocalStartTime(Date.now());
        }
        if (snapshot.state === 'idle') {
            setLocalStartTime(null);
        }
    }, [snapshot.state, localStartTime]);

    const ghostIndex = usePaceGhost(localStartTime, targetWpm, words, snapshot.state === 'paused');

    // Win/Loss Logic
    useEffect(() => {
        if (gameState !== 'playing') return;

        // Check Win
        if (snapshot.state === 'finished') {
            setGameState('won');
            if (snapshot.metrics) {
                saveRun(snapshot.timeRemainingMs /* elapsed? no, duration */, snapshot.metrics, {
                    mode: 'game',
                    gameId: 'pace-runner',
                    gameSettings: { targetWpm }
                });
            }
        }

        // Check Loss: Ghost passes user by X words?
        if (ghostIndex && snapshot.currentWordIndex) {
            if (ghostIndex.wordIndex > snapshot.currentWordIndex + 2) {
                // setGameState('lost'); // Disable losing for now, just let it run
                // Maybe just visual RED border?
            }
        }
    }, [gameState, snapshot.state, ghostIndex, snapshot.currentWordIndex]);

    const handleStart = () => {
        setGameState('playing');
        // Engine starts on first key
    };

    // Shortcuts
    useEffect(() => {
        const handleShortcut = (e: KeyboardEvent) => {
            if (gameState === 'playing' && e.key === 'Tab') {
                e.preventDefault();
                navigate('/practice');
            }
            if ((gameState === 'won' || gameState === 'setup') && e.key === 'Enter') {
                handleStart();
            }
        };
        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, [gameState, navigate]);

    return (
        <div className="page page--runner">
            {gameState === 'setup' && (
                <div className="runner-setup">
                    <h1>Pace Runner 🏃</h1>
                    <p>Race against a ghost runner set to your target speed.</p>

                    <div className="runner-setting">
                        <label>Target Speed: <span className="highlight">{targetWpm} WPM</span></label>
                        <input
                            type="range"
                            min="30" max="150" step="5"
                            value={targetWpm}
                            onChange={e => setTargetWpm(Number(e.target.value))}
                        />
                    </div>

                    <button className="btn-primary" onClick={handleStart}>Start Race (Enter)</button>
                    <button className="btn-text" onClick={() => navigate('/practice')}>Cancel</button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="runner-game">
                    <header className="runner-hud">
                        <div className="hud-item">
                            <span className="hud-label">TARGET</span>
                            <span className="hud-val">{targetWpm}</span>
                        </div>
                        <div className="hud-item">
                            <span className="hud-label">YOU</span>
                            {/* Real WPM is in metrics, defaulting to 0 */}
                            <span className="hud-val">{snapshot.metrics?.correctedWpm || 0}</span>
                        </div>
                        <button className="btn-small" onClick={() => navigate('/practice')}>Quit (Tab)</button>
                    </header>

                    <div className={`runner-arena ${ghostIndex && ghostIndex.wordIndex > snapshot.currentWordIndex ? 'arena--behind' : ''}`}>
                        <TypingArea
                            snapshot={snapshot}
                            onKeyDown={handleKeyDown}
                            ghostIndex={ghostIndex}
                        />
                    </div>

                    <div className="runner-hint">
                        Blue Caret = You. Hollow Caret = {targetWpm} WPM Ghost.
                    </div>
                </div>
            )}

            {gameState === 'won' && (
                <div className="runner-result runner-result--won anim-pop-in">
                    <h1>Finished! 🎉</h1>
                    <p>You maintained pace with the {targetWpm} WPM runner.</p>
                    <button className="btn-primary" onClick={() => setGameState('setup')}>Race Again (Enter)</button>
                    <button className="btn-text" onClick={() => navigate('/practice')}>Back to Library</button>
                </div>
            )}
        </div>
    );
}
