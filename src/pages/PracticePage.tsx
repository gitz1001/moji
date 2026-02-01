/** PracticePage — Wrapper for Library & Games */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LibraryPage } from './LibraryPage';
import './PracticePage.css';

type Tab = 'library' | 'games';

export function PracticePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('library');

    return (
        <div className="page page--practice">
            <header className="practice-header">
                <h1 className="page-title">Practice Area</h1>
                <p className="page-description">Explore books, drills, and typing games.</p>

                <div className="practice-tabs">
                    <button
                        className={`practice-tab ${activeTab === 'library' ? 'active' : ''}`}
                        onClick={() => setActiveTab('library')}
                    >
                        Library
                    </button>
                    <button
                        className={`practice-tab ${activeTab === 'games' ? 'active' : ''}`}
                        onClick={() => setActiveTab('games')}
                    >
                        Games
                    </button>
                </div>
            </header>

            <main className="practice-content">
                {activeTab === 'library' ? (
                    <LibraryPage />
                ) : (
                    <div className="library-grid">
                        <div className="lib-card" onClick={() => navigate('/practice/pace-runner')}>
                            <div className="lib-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                🏃
                            </div>
                            <div className="lib-card-content">
                                <h3 className="lib-card-title">Pace Runner</h3>
                                <p className="lib-card-desc">Race against a ghost runner.</p>
                                <div className="lib-card-meta">Speed · Focus</div>
                            </div>
                        </div>
                        <div className="lib-card" onClick={() => navigate('/practice/recovery-rush')}>
                            <div className="lib-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                💎
                            </div>
                            <div className="lib-card-content">
                                <h3 className="lib-card-title">Recovery Rush</h3>
                                <p className="lib-card-desc">Fix mistakes instantly.</p>
                                <div className="lib-card-meta">Accuracy · Flow</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
