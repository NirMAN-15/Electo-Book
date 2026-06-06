import React from 'react';

interface MeterGaugeProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  unit: string;
  size?: number;
  color?: string;
}

export const MeterGauge: React.FC<MeterGaugeProps> = ({
  value,
  min = 0,
  max = 100,
  label,
  unit,
  size = 200,
  color = 'var(--accent-primary)'
}) => {
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  // Arc represents 75% of circle (starts bottom left, goes over top to bottom right)
  const arcLength = circumference * 0.75; 
  
  const percent = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const strokeDashoffset = arcLength - (percent * arcLength);

  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(135deg)', position: 'absolute', top: 0, left: 0 }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        {/* Progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      
      {/* Center Text Content */}
      <div style={{ textAlign: 'center', zIndex: 1, marginTop: '20px' }}>
        <div style={{ fontSize: `${size / 6}px`, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value.toFixed(1)}
        </div>
        <div style={{ fontSize: `${size / 14}px`, color: 'var(--text-secondary)', marginTop: '4px' }}>
          {unit}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '10px', fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
};
