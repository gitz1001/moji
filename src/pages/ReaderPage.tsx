/** ReaderPage — Read & Type Flow */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLibraryItem } from '../library/storage';
import { useTypingEngine } from '../engine';
import { TypingArea } from '../components/TypingArea';
import './ReaderPage.css';

export function ReaderPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // 1. Load Book (Built-in or User)
    const book = useMemo(() => getLibraryItem(id || ''), [id]);

    // 2. State: Location
    // TODO: Load from localStorage
    const [chapterIndex, setChapterIndex] = useState(0);
    const [paragraphIndex, setParagraphIndex] = useState(0);

    // 3. Current Content
    const currentChapter = book?.chapters[chapterIndex];
    const currentParagraph = currentChapter?.paragraphs[paragraphIndex];

    // 4. Words for Engine
    const words = useMemo(() => {
        if (!currentParagraph) return [];
        return currentParagraph.split(/\s+/).filter(w => w.length > 0);
    }, [currentParagraph]);

    // 5. Engine
    const { snapshot, handleKeyDown, reset } = useTypingEngine({
        words,
        durationMs: 0, // Infinite duration (paragraph mode)
    });

    // 6. Navigation Logic
    const nextParagraph = () => {
        if (!book || !currentChapter) return;

        const isLastPara = paragraphIndex >= currentChapter.paragraphs.length - 1;

        if (isLastPara) {
            // Next chapter?
            if (chapterIndex < book.chapters.length - 1) {
                setChapterIndex(ci => ci + 1);
                setParagraphIndex(0);
                reset();
            } else {
                // Book complete
                alert("Book Complete! Well done."); // Placeholder
                navigate('/practice');
            }
        } else {
            setParagraphIndex(pi => pi + 1);
            reset();
        }
    };

    const prevParagraph = () => {
        if (paragraphIndex > 0) {
            setParagraphIndex(pi => pi - 1);
            reset();
        } else if (chapterIndex > 0) {
            // Go to end of prev chapter
            setChapterIndex(ci => ci - 1);
            // TODO: setParagraphIndex(last)
            setParagraphIndex(0); // lazy for now
            reset();
        }
    };

    // Auto-save progress
    useEffect(() => {
        if (book) {
            const key = `moji_progress_${book.id}`;
            const data = { chapterIndex, paragraphIndex };
            localStorage.setItem(key, JSON.stringify(data));
        }
    }, [book, chapterIndex, paragraphIndex]);

    // Initial Load Progress
    useEffect(() => {
        if (book) {
            const key = `moji_progress_${book.id}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    const { chapterIndex: ci, paragraphIndex: pi } = JSON.parse(saved);
                    setChapterIndex(ci);
                    setParagraphIndex(pi);
                } catch (e) { /* ignore corrupt */ }
            }
        }
    }, [book]);

    if (!book) return <div className="page">Book not found.</div>;
    if (!currentChapter || !currentParagraph) return <div className="page">Content error.</div>;

    const progressPercent = useMemo(() => {
        // Simple progress calc: just paragraphs so far / total paragraphs in book? Expensive.
        // Let's do chapter progress for now
        return Math.round(((paragraphIndex + 1) / currentChapter.paragraphs.length) * 100);
    }, [paragraphIndex, currentChapter]);

    return (
        <div className="page page--reader">
            {/* Header: Book Context */}
            <header className="reader-header">
                <button className="reader-back-btn" onClick={() => navigate('/practice')}>
                    ← Dictionary
                </button>
                <div className="reader-meta">
                    <h1 className="reader-book-title">{book.title}</h1>
                    <div className="reader-location">
                        <select
                            className="reader-chapter-select"
                            value={chapterIndex}
                            onChange={(e) => {
                                setChapterIndex(Number(e.target.value));
                                setParagraphIndex(0);
                                reset();
                            }}
                        >
                            {book.chapters.map((ch, idx) => (
                                <option key={ch.id} value={idx}>
                                    {ch.title}
                                </option>
                            ))}
                        </select>
                        <span className="reader-progress">{progressPercent}% of Ch.</span>
                    </div>
                </div>
            </header>

            {/* Main: Typing */}
            <main className="reader-content">
                <div className="reader-card">
                    <TypingArea snapshot={snapshot} onKeyDown={handleKeyDown} />
                </div>
            </main>

            {/* Footer: Controls & Feedback */}
            <footer className="reader-footer">
                {snapshot.state === 'finished' ? (
                    <div className="reader-stats slide-in">
                        <div className="reader-stat-group">
                            <span className="stat-val">{snapshot.metrics?.correctedWpm}</span>
                            <span className="stat-lbl">WPM</span>
                        </div>
                        <div className="reader-stat-group">
                            <span className="stat-val">{snapshot.metrics?.accuracy}%</span>
                            <span className="stat-lbl">Acc</span>
                        </div>
                        <button className="reader-next-btn" autoFocus onClick={nextParagraph}>
                            Next Paragraph →
                        </button>
                    </div>
                ) : (
                    <div className="reader-controls">
                        <button className="reader-nav-btn" onClick={prevParagraph} disabled={chapterIndex === 0 && paragraphIndex === 0}>
                            Prev
                        </button>
                        <div className="reader-hint">
                            Press <strong>Esc</strong> to pause. Type to start.
                        </div>
                        <button className="reader-nav-btn" onClick={nextParagraph} disabled={true}>
                            Next
                        </button>
                    </div>
                )}
            </footer>
        </div>
    );
}
