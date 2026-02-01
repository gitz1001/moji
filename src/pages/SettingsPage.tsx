/** SettingsPage — Manage Data & Preferences */

import { useRef, useState } from 'react';
import { exportBackup, importBackup } from '../storage';
import './SettingsPage.css';

export function SettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

    const handleExport = async () => {
        try {
            await exportBackup();
            setStatus({ type: 'success', msg: 'Backup downloaded successfully!' });
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: 'Failed to create backup.' });
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

                {status && (
                    <div className={`settings-status settings-status--${status.type}`}>
                        {status.msg}
                    </div>
                )}
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Appearance</h2>
                <div className="settings-card">
                    <div className="settings-placeholder">
                        Theme selection coming soon...
                    </div>
                </div>
            </div>
        </div>
    );
}
