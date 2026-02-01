/** Sparkline Component — Minimal SVG Trend Line */

import './History.css';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
}

export function Sparkline({
    data,
    width = 120,
    height = 40,
    color = "var(--color-accent)"
}: SparklineProps) {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    // Points generation
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        // Invert Y (SVG 0 is top)
        const y = height - padding - ((val - min) / range) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="sparkline">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Last point dot */}
            <circle
                cx={width}
                cy={height - padding - ((data[data.length - 1] - min) / range) * (height - 2 * padding)}
                r="3"
                fill={color}
            />
        </svg>
    );
}
