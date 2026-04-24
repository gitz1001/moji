/** LibraryPage — Built-in & User Collection */
import { DocumentIcon, FolderIcon } from '../components/icons';

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary, saveUserItem } from '../library/storage';
import { createFromText, parseFile } from '../library/import';
import type { LibraryItem } from '../library/types';
import './LibraryPage.css';

export function LibraryPage() {
    const items = useLibrary();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Paste Modal State
    const [isPasteModalOpen, setPasteModalOpen] = useState(false);
    const [pasteTitle, setPasteTitle] = useState('');
    const [pasteContent, setPasteContent] = useState('');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const item = await parseFile(file);
            saveUserItem(item);
            alert(`Imported "${item.title}" successfully!`);
        } catch (err) {
            alert("Failed to import file: " + err);
        }

        // Reset
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSavePaste = () => {
        if (!pasteTitle.trim() || !pasteContent.trim()) {
            alert("Please enter a title and content.");
            return;
        }

        const item = createFromText(pasteTitle, pasteContent, 'paste');
        saveUserItem(item);
        setPasteModalOpen(false);
        setPasteTitle('');
        setPasteContent('');
    };

    return (
        <div className="library-container">
            {/* 1. Actions */}
            <h2 className="section-title">Operations</h2>
            <div className="library-grid" style={{ marginBottom: 'var(--space-8)' }}>
                <div className="lib-card lib-card--action" onClick={() => setPasteModalOpen(true)}>
                    <div className="lib-card-icon"><DocumentIcon /></div>
                    <div className="lib-card-content">
                        <h3 className="lib-card-title">Paste Text</h3>
                        <p className="lib-card-desc">Create from clipboard.</p>
                    </div>
                </div>
                <div className="lib-card lib-card--action" onClick={() => fileInputRef.current?.click()}>
                    <div className="lib-card-icon"><FolderIcon /></div>
                    <div className="lib-card-content">
                        <h3 className="lib-card-title">Import File</h3>
                        <p className="lib-card-desc">TXT, MD, PDF supported.</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".txt,.md,.pdf"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>

            {/* 2. Collection */}
            <h2 className="section-title">My Library</h2>
            {items.length === 0 ? (
                <p>No items found.</p>
            ) : (
                <div className="library-grid">
                    {items.map(item => (
                        <LibraryCard key={item.id} item={item} />
                    ))}
                </div>
            )}

            {/* 3. Paste Modal */}
            {isPasteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Paste Content</h3>
                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Book Title"
                            value={pasteTitle}
                            onChange={e => setPasteTitle(e.target.value)}
                            autoFocus
                        />
                        <textarea
                            className="modal-textarea"
                            placeholder="Paste your text here..."
                            value={pasteContent}
                            onChange={e => setPasteContent(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="modal-btn" onClick={() => setPasteModalOpen(false)}>Cancel</button>
                            <button className="modal-btn modal-btn--primary" onClick={handleSavePaste}>Create Book</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function LibraryCard({ item }: { item: LibraryItem }) {
    const navigate = useNavigate();

    return (
        <div
            className="lib-card"
            style={{ '--card-accent': item.coverColor } as any}
            onClick={() => navigate(`/practice/library/${item.id}`)}
        >
            <div className="lib-card-cover">
                <span className="lib-card-initials">{item.title.substring(0, 2)}</span>
            </div>
            <div className="lib-card-content">
                <h3 className="lib-card-title">{item.title}</h3>
                <p className="lib-card-author">{item.author}</p>
                <div className="lib-card-meta">
                    {item.chapters.length} Chapters · {item.sourceType}
                </div>
            </div>
        </div>
    );
}
