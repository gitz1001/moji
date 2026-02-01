/** TypingArea Component — Renders words with caret and captures input */

import { useRef, useEffect } from 'react';
import type { EngineSnapshot } from '../../engine';
import './TypingArea.css';

interface TypingAreaProps {
    snapshot: EngineSnapshot;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function TypingArea({ snapshot, onKeyDown }: TypingAreaProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const activeWordRef = useRef<HTMLSpanElement>(null);

    const { state, words, currentWordIndex, currentInput } = snapshot;

    // Auto-focus hidden input on mount and when state changes
    useEffect(() => {
        if (state !== 'finished') {
            hiddenInputRef.current?.focus();
        }
    }, [state]);

    // Scroll active word into view
    useEffect(() => {
        if (activeWordRef.current) {
            activeWordRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentWordIndex]);

    // Focus on container click
    const handleContainerClick = () => {
        if (state !== 'finished') {
            hiddenInputRef.current?.focus();
        }
    };

    // Render a single word
    const renderWord = (wordState: typeof words[0], index: number) => {
        const isActive = index === currentWordIndex;
        const isCompleted = wordState.isComplete;
        const typed = isActive ? currentInput : wordState.typed;

        return (
            <span
                key={index}
                ref={isActive ? activeWordRef : undefined}
                className={`typing-word ${isActive ? 'typing-word--active' : ''} ${isCompleted ? (wordState.isCorrect ? 'typing-word--correct' : 'typing-word--incorrect') : ''
                    }`}
            >
                {wordState.word.split('').map((char, charIndex) => {
                    const typedChar = typed[charIndex];
                    const isCurrentChar = isActive && charIndex === typed.length;

                    let charClass = 'typing-char';
                    if (typedChar !== undefined) {
                        charClass += typedChar === char ? ' typing-char--correct' : ' typing-char--incorrect';
                    } else if (isCompleted && !wordState.isCorrect) {
                        charClass += ' typing-char--missed';
                    }

                    return (
                        <span key={charIndex} className={charClass}>
                            {isCurrentChar && <span className="typing-caret" />}
                            {char}
                        </span>
                    );
                })}
                {/* Extra typed characters beyond word length */}
                {typed.length > wordState.word.length && (
                    <span className="typing-extra">
                        {typed.slice(wordState.word.length)}
                    </span>
                )}
                {/* Caret at end of word if needed */}
                {isActive && typed.length >= wordState.word.length && (
                    <span className="typing-caret typing-caret--end" />
                )}
            </span>
        );
    };

    return (
        <div
            ref={containerRef}
            className={`typing-area ${state === 'finished' ? 'typing-area--finished' : ''}`}
            onClick={handleContainerClick}
        >
            {/* Hidden input for reliable key capture */}
            <input
                ref={hiddenInputRef}
                type="text"
                className="typing-input-hidden"
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Type the words shown above"
            />

            {/* Visual typing area */}
            <div className="typing-words">
                {words.map((word, index) => renderWord(word, index))}
            </div>

            {/* Click to focus hint */}
            {state === 'idle' && (
                <div className="typing-hint">
                    Click here and start typing...
                </div>
            )}
        </div>
    );
}
