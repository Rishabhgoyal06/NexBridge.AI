import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface RadarDataPoint {
  subject: string;
  score: number;
  fullMark: number;
}

interface RadarChartProps {
  data?: RadarDataPoint[];
  metrics?: {
    marketDemand: number;
    unitEconomics: number;
    technicalFeasibility: number;
    competitiveMoat: number;
    timingExecution: number;
  };
  height?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  metrics,
  height = 280,
}) => {
  const chartData: RadarDataPoint[] = data || [
    { subject: 'Market Demand', score: metrics?.marketDemand ?? 84, fullMark: 100 },
    { subject: 'Unit Economics', score: metrics?.unitEconomics ?? 72, fullMark: 100 },
    { subject: 'Tech Feasibility', score: metrics?.technicalFeasibility ?? 79, fullMark: 100 },
    { subject: 'Competitive Moat', score: metrics?.competitiveMoat ?? 71, fullMark: 100 },
    { subject: 'Timing & GTM', score: metrics?.timingExecution ?? 82, fullMark: 100 },
  ];

  return (
    <div className="w-full flex items-center justify-center" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#e5e2e1" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#625e59', fontSize: 11, fontFamily: 'Inter', fontWeight: 500 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#bfc9bd" tick={{ fontSize: 9 }} />
          <Radar
            name="Conviction Score"
            dataKey="score"
            stroke="#166534"
            fill="#166534"
            fillOpacity={0.25}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e5e2e1',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(17,17,17,0.06)',
            }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
};
