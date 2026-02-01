/** WpmChart — Simple SVG Line Chart for WPM Timeline */

import './WpmChart.css';

interface WpmChartProps {
    data: number[];
    width?: number;
    height?: number;
}

export function WpmChart({ data, width = 400, height = 120 }: WpmChartProps) {
    if (data.length === 0) {
        return (
            <div className="wpm-chart wpm-chart--empty">
                <span>No timeline data</span>
            </div>
        );
    }

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate bounds
    const maxWpm = Math.max(...data, 1);
    const minWpm = Math.min(...data, 0);
    const range = maxWpm - minWpm || 1;

    // Scale functions
    const xScale = (index: number) =>
        padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;

    const yScale = (value: number) =>
        padding.top + chartHeight - ((value - minWpm) / range) * chartHeight;

    // Generate path
    const pathD = data
        .map((value, index) => {
            const x = xScale(index);
            const y = yScale(value);
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

    // Generate Y-axis labels
    const yLabels = [minWpm, Math.round((minWpm + maxWpm) / 2), maxWpm];

    return (
        <div className="wpm-chart">
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="wpm-chart-svg"
            >
                {/* Grid lines */}
                {yLabels.map((label, i) => (
                    <line
                        key={i}
                        x1={padding.left}
                        y1={yScale(label)}
                        x2={width - padding.right}
                        y2={yScale(label)}
                        className="wpm-chart-grid"
                    />
                ))}

                {/* Y-axis labels */}
                {yLabels.map((label, i) => (
                    <text
                        key={i}
                        x={padding.left - 8}
                        y={yScale(label)}
                        className="wpm-chart-label"
                        textAnchor="end"
                        dominantBaseline="middle"
                    >
                        {Math.round(label)}
                    </text>
                ))}

                {/* X-axis label */}
                <text
                    x={width / 2}
                    y={height - 5}
                    className="wpm-chart-label"
                    textAnchor="middle"
                >
                    Time (seconds)
                </text>

                {/* Data line */}
                <path d={pathD} className="wpm-chart-line" />

                {/* Data points */}
                {data.map((value, index) => (
                    <circle
                        key={index}
                        cx={xScale(index)}
                        cy={yScale(value)}
                        r={3}
                        className="wpm-chart-point"
                    />
                ))}
            </svg>

            {/* Legend */}
            <div className="wpm-chart-legend">
                <span className="wpm-chart-legend-item">
                    {data.length} samples • Peak: {Math.max(...data)} WPM
                </span>
            </div>
        </div>
    );
}
