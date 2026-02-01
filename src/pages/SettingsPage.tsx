/** SettingsPage — Manage Data & Preferences */

import { useRef, useState, useEffect } from 'react';
import { exportBackup, importBackup, deleteDatabase, getStorageDiagnostics, type StorageInfo } from '../storage';
import './SettingsPage.css';

export function SettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

    useEffect(() => {
        getStorageDiagnostics().then(setStorageInfo);
    }, []);

    const handleExport = async () => {
        try {
            await exportBackup();
            setStatus({ type: 'success', msg: 'Backup downloaded successfully!' });
        } catch (err: any) {
            console.error(err);
            setStatus({ type: 'error', msg: `Export failed: ${err.message || 'Unknown error'}` });
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus({ type: 'info', msg: 'Importing...' });

        try {
            const result = await importBackup(file);
            if (result.success) {
                setStatus({ type: 'success', msg: result.message });
                // Reset input so same file can be selected again if needed
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setStatus({ type: 'error', msg: result.message });
            }
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: 'Import failed due to an unexpected error.' });
        }
    };

    return (
        <div className="page page--settings">
            <h1 className="page-title">Settings</h1>
            <p className="page-description">
                Customize your typing experience and manage your data.
            </p>

            <div className="settings-section">
                <h2 className="settings-section-title">Data Management</h2>

                {/* Storage Health Card */}
                <div className="settings-card" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="settings-row">
                        <div className="settings-info">
                            <h3 className="settings-label">Storage Status</h3>
                            <p className="settings-desc">
                                {storageInfo?.mode === 'indexeddb' && <span style={{ color: 'var(--color-primary)' }}>✅ Optimized (IndexedDB)</span>}
                                {storageInfo?.mode === 'localstorage' && <span style={{ color: 'var(--color-warning)' }}>⚠️ Fallback (LocalStorage)</span>}
                                {storageInfo?.mode === 'hybrid' && <span style={{ color: 'var(--color-warning)' }}>⚠️ Mixed Data</span>}
                            </p>
                        </div>
                        <div className="settings-meta" style={{ textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            <div>{storageInfo ? `${storageInfo.runCount} runs saved` : 'Loading...'}</div>
                            <div>{storageInfo ? `~${(storageInfo.usageBytes / 1024).toFixed(1)} KB used` : ''}</div>
                        </div>
                    </div>
                    {storageInfo && storageInfo.mode !== 'indexeddb' && (
                        <div className="settings-alert" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>
                            Running in fallback mode. Browser storage may be limited. Please export backups regularly.
                        </div>
                    )}
                </div>

                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-info">
                            <h3 className="settings-label">Export Data</h3>
                            <p className="settings-desc">Download a backup of your runs and settings.</p>
                        </div>
                        <button className="settings-btn settings-btn--primary" onClick={handleExport}>
                            Export JSON
                        </button>
                    </div>

                    <div className="settings-separator" />

                    <div className="settings-row">
                        <div className="settings-info">
                            <h3 className="settings-label">Import Data</h3>
                            <p className="settings-desc">Restore runs from a backup file (merges with existing data).</p>
                        </div>
                        <button className="settings-btn" onClick={handleImportClick}>
                            Import JSON
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".json"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Danger Zone</h2>
                <div className="settings-card" style={{ borderColor: 'var(--color-error)' }}>
                    <div className="settings-row">
                        <div className="settings-info">
                            <h3 className="settings-label" style={{ color: 'var(--color-error)' }}>Factory Reset</h3>
                            <p className="settings-desc">Delete all history and settings. Cannot be undone.</p>
                        </div>
                        <button
                            className="settings-btn"
                            style={{
                                borderColor: 'var(--color-error)',
                                color: 'var(--color-error)',
                                background: 'transparent'
                            }}
                            onClick={async () => {
                                if (window.confirm('Are you definitely sure? This will wipe all data.')) {
                                    await deleteDatabase();
                                }
                            }}
                        >
                            Reset Everything
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                {status && (
                    <div className={`settings-status settings-status--${status.type}`}>
                        {status.msg}
                    </div>
                )}
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Appearance</h2>
                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-info">
                            <h3 className="settings-label">Interface Theme</h3>
                            <p className="settings-desc">Switch between dark and light mode.</p>
                        </div>
                        <button
                            className="settings-btn"
                            onClick={() => {
                                const current = localStorage.getItem('moji_theme') || 'dark';
                                const next = current === 'light' ? 'dark' : 'light';
                                localStorage.setItem('moji_theme', next);
                                if (next === 'light') {
                                    document.documentElement.setAttribute('data-theme', 'light');
                                } else {
                                    document.documentElement.removeAttribute('data-theme');
                                }
                                // Force re-render of button text (hacky but works for simple toggle)
                                setStatus({ type: 'success', msg: `Theme set to ${next} mode` });
                            }}
                        >
                            Toggle Theme
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
