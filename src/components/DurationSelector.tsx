/** Duration Selector Component */
import './DurationSelector.css';

interface DurationSelectorProps {
    duration: number;
    onChange: (ms: number) => void;
}

const PRESETS = [10, 15, 30, 45, 60, 90, 120];

export function DurationSelector({ duration, onChange }: DurationSelectorProps) {
    const isCustom = !PRESETS.includes(duration / 1000);

    return (
        <div className="duration-selector">
            {PRESETS.map(sec => (
                <button
                    key={sec}
                    className={`duration-chip ${duration === sec * 1000 ? 'active' : ''}`}
                    onClick={() => onChange(sec * 1000)}
                >
                    {sec}
                </button>
            ))}

            {/* Custom Input */}
            <input
                type="number"
                className={`duration-chip duration-custom ${isCustom ? 'active' : ''}`}
                value={duration / 1000}
                onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) onChange(val * 1000);
                }}
                min="1"
                max="300"
                aria-label="Custom duration in seconds"
            />
        </div>
    );
}
