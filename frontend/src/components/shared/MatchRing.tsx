import React from 'react';

interface MatchRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}

export const MatchRing: React.FC<MatchRingProps> = ({
  percentage,
  size = 48,
  strokeWidth = 4,
  showText = true,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 85) return 'text-primary-container';
    if (val >= 70) return 'text-emerald-600';
    if (val >= 50) return 'text-amber-600';
    return 'text-error';
  };

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-surface-container-high"
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          className={`${getColor(percentage)} transition-all duration-500 ease-out`}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-label-sm text-[11px] font-bold text-on-surface leading-none">
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
};
