import { useEffect } from 'react';
import './Toast.css';

interface Props {
    message: string;
    type?: 'success' | 'info' | 'error';
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">
                {type === 'success' && '🎉'}
                {type === 'info' && 'ℹ️'}
                {type === 'error' && '⚠️'}
            </span>
            <span className="toast-msg">{message}</span>
        </div>
    );
}
