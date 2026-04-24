/** SettingsPage — Manage Data & Preferences */

import { useRef, useState, useEffect } from 'react';
import { exportBackup, importBackup, deleteDatabase, getStorageDiagnostics, type StorageInfo } from '../storage';
import { CheckIcon, WarningIcon, PlayIcon } from '../components/icons';
import {
    loadAudioSettings,
    saveAudioSettings,
    playPreview,
    AUDIO_PACK_META,
    type AudioSettings,
    type AudioMode,
} from '../engine/audio';
import './SettingsPage.css';

export function SettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
    const [audioSettings, setAudioSettings] = useState<AudioSettings>(loadAudioSettings);

    const updateAudio = (patch: Partial<AudioSettings>) => {
        const next = { ...audioSettings, ...patch };
        setAudioSettings(next);
        saveAudioSettings(next);
    };

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
                                {storageInfo?.mode === 'indexeddb' && <span style={{ color: 'var(--color-primary)' }}><CheckIcon style={{verticalAlign:'middle',marginRight:'4px'}}/> Optimized (IndexedDB)</span>}
                                {storageInfo?.mode === 'localstorage' && <span style={{ color: 'var(--color-warning)' }}><WarningIcon style={{verticalAlign:'middle',marginRight:'4px'}}/> Fallback (LocalStorage)</span>}
                                {storageInfo?.mode === 'hybrid' && <span style={{ color: 'var(--color-warning)' }}><WarningIcon style={{verticalAlign:'middle',marginRight:'4px'}}/> Mixed Data</span>}
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

            {/* ── Sound Settings ─────────────────────────── */}
            <div className="settings-section">
                <h2 className="settings-section-title">Sound</h2>
                <div className="settings-card">

                    {/* Enable toggle */}
                    <div className="settings-row">
                        <div className="settings-info">
                            <h3 className="settings-label">Typing Sounds</h3>
                            <p className="settings-desc">
                                Synthesized keystroke audio. Low-latency, works offline.
                            </p>
                        </div>
                        <button
                            id="audio-toggle-btn"
                            className={`settings-btn ${audioSettings.mode !== 'off' ? 'settings-btn--primary' : ''}`}
                            onClick={() => {
                                const nextMode: AudioMode = audioSettings.mode === 'off' ? 'mechanical' : 'off';
                                updateAudio({ mode: nextMode });
                            }}
                        >
                            {audioSettings.mode !== 'off' ? 'On' : 'Off'}
                        </button>
                    </div>

                    {audioSettings.mode !== 'off' && (
                        <>
                            <div className="settings-separator" />

                            {/* Mode pills */}
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h3 className="settings-label">Sound Pack</h3>
                                    <p className="settings-desc">Choose the character of each keystroke.</p>
                                </div>
                                <div className="settings-pill-group">
                                    {(Object.keys(AUDIO_PACK_META) as AudioMode[]).map(m => (
                                        <button
                                            key={m}
                                            id={`audio-mode-${m}`}
                                            className={`settings-pill ${audioSettings.mode === m ? 'settings-pill--active' : ''}`}
                                            onClick={() => updateAudio({ mode: m })}
                                            title={AUDIO_PACK_META[m as keyof typeof AUDIO_PACK_META]?.desc}
                                        >
                                            {AUDIO_PACK_META[m as keyof typeof AUDIO_PACK_META]?.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="settings-separator" />

                            {/* Volume */}
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h3 className="settings-label">Volume</h3>
                                    <p className="settings-desc">Master volume for all keystroke sounds.</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        id="audio-volume-slider"
                                        type="range"
                                        min="0" max="1" step="0.05"
                                        value={audioSettings.volume}
                                        onChange={e => updateAudio({ volume: parseFloat(e.target.value) })}
                                        style={{ width: '100px' }}
                                    />
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', minWidth: '32px' }}>
                                        {Math.round(audioSettings.volume * 100)}%
                                    </span>
                                </div>
                            </div>

                            <div className="settings-separator" />

                            {/* Silence in Focus Mode */}
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h3 className="settings-label">Focus Mode Silence</h3>
                                    <p className="settings-desc">Mute sounds when Focus Mode is active.</p>
                                </div>
                                <button
                                    id="audio-focus-silence-btn"
                                    className={`settings-btn ${audioSettings.silenceInFocusMode ? 'settings-btn--primary' : ''}`}
                                    onClick={() => updateAudio({ silenceInFocusMode: !audioSettings.silenceInFocusMode })}
                                >
                                    {audioSettings.silenceInFocusMode ? 'Muted' : 'Playing'}
                                </button>
                            </div>

                            <div className="settings-separator" />

                            {/* Test button */}
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h3 className="settings-label">Test Sound</h3>
                                    <p className="settings-desc">Preview the current sound pack now.</p>
                                </div>
                                <button
                                    id="audio-test-btn"
                                    className="settings-btn"
                                    onClick={() => playPreview(audioSettings.mode)}
                                >
                                    <PlayIcon style={{verticalAlign:'middle'}}/> Play Sample
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Appearance ─────────────────────────────── */}
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
