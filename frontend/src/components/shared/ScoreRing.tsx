import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  signalTier?: string;
  showBreakdown?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 176,
  strokeWidth = 8,
  label = '/100',
  signalTier = 'Strong Signal',
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStrokeColor = (val: number) => {
    if (val >= 75) return 'text-primary-container';
    if (val >= 60) return 'text-amber-600';
    return 'text-error';
  };

  const getTierBg = (val: number) => {
    if (val >= 75) return 'bg-primary-fixed/40 text-primary-container';
    if (val >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-error-container text-on-error-container';
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            className="text-surface-container-high"
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            className={`${getStrokeColor(score)} transition-all duration-700 ease-out`}
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

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <div className="flex items-baseline">
            <span className="font-headline-xl text-[44px] font-bold text-on-surface tracking-tighter leading-none">
              {score}
            </span>
            <span className="font-body-md text-body-md text-secondary ml-0.5 font-medium">
              {label}
            </span>
          </div>
          {signalTier && (
            <span className={`mt-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${getTierBg(score)}`}>
              {signalTier}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
