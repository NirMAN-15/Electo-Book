import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MeterState, MeterSettings, HourlyReading, DailyReading } from '../types';
import { useTranslation } from '../utils/translations';

interface GraphsTabProps {
  state: MeterState;
  settings: MeterSettings;
  hourlyData: HourlyReading[];
  dailyData: DailyReading[];
}

type MetricType = 'power' | 'current' | 'voltage';

export default function GraphsTab({ state, settings, hourlyData }: GraphsTabProps) {
  const { t } = useTranslation(settings.language || 'en');
  const [activeMetric, setActiveMetric] = useState<MetricType>('power');

  // Math variables
  const computedPower = parseFloat((state.voltage * state.current * state.powerFactor / 1000).toFixed(2));
  const livePower = state.currentPower || computedPower;
  const liveCurrent = state.current;
  const liveVoltage = state.voltage;

  // Determine active dynamic value
  let activeValue = livePower;
  let activeUnit = 'kW';
  let activeLabel = 'Power (kW)';
  
  if (activeMetric === 'current') {
    activeValue = liveCurrent;
    activeUnit = 'A';
    activeLabel = 'Current (A)';
  } else if (activeMetric === 'voltage') {
    activeValue = liveVoltage;
    activeUnit = 'V';
    activeLabel = 'Voltage (V)';
  }

  // Calculate dynamic stats from hourly telemetry
  const values = hourlyData.map(d => {
    if (activeMetric === 'power') return d.power;
    if (activeMetric === 'current') return d.current;
    return d.voltage;
  });

  // Fallback defaults to match mockup closely when data is empty or simulated
  const defaultPeak = activeMetric === 'power' ? 5.19 : activeMetric === 'current' ? 22.5 : 238.4;
  const defaultAvg = activeMetric === 'power' ? 2.91 : activeMetric === 'current' ? 12.6 : 229.8;
  const defaultMin = activeMetric === 'power' ? 1.03 : activeMetric === 'current' ? 4.5 : 215.1;

  const peakVal = values.length > 0 ? Math.max(...values) : defaultPeak;
  const avgVal = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : defaultAvg;
  const minVal = values.length > 0 ? Math.min(...values) : defaultMin;

  // Render chart data nicely formatted
  const chartData = hourlyData.map((item, idx) => {
    // Generate tick labels similar to '0h', '4h', '8h', '12h', '16h' 
    const hr = idx * 2;
    return {
      ...item,
      displayTime: `${hr}h`,
      value: activeMetric === 'power' ? item.power : activeMetric === 'current' ? item.current : item.voltage,
    };
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Title block */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white tracking-tight">Graphs</h2>
        <p className="text-sm font-medium text-slate-400">Today's Usage</p>
      </div>

      {/* Styled Segment Tab Control */}
      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex w-full space-x-1 shadow-md shadow-black/20">
        <button
          onClick={() => setActiveMetric('power')}
          className={`cursor-pointer flex-1 py-3 px-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 ${
            activeMetric === 'power'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Power
        </button>
        <button
          onClick={() => setActiveMetric('current')}
          className={`cursor-pointer flex-1 py-3 px-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 ${
            activeMetric === 'current'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Current
        </button>
        <button
          onClick={() => setActiveMetric('voltage')}
          className={`cursor-pointer flex-1 py-3 px-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 ${
            activeMetric === 'voltage'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Voltage
        </button>
      </div>

      {/* Main Graph Card with active live value on right */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-100 font-extrabold text-lg tracking-tight">
            {activeLabel}
          </h3>
          <div className="flex items-center space-x-2 text-indigo-400 font-extrabold text-sm font-sans">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>
              {activeValue.toFixed(2)} {activeUnit}
            </span>
          </div>
        </div>

        {/* Areas chart visualization */}
        <div className="h-56 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="displayTime" 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
                domain={activeMetric === 'voltage' ? [200, 250] : ['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                formatter={(value: any) => [`${value} ${activeUnit}`, activeLabel]}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#metricGradient)" 
                activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aggregate indicators row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Peak Card */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.03]">
          <div className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" />
          <div className="mt-6 flex flex-col">
            <span className="text-slate-400 text-xs font-bold font-sans tracking-wide">Peak</span>
            <span className="text-2xl font-black font-mono text-white tracking-tight mt-1.5 truncate">
              {peakVal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Average Card */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.03]">
          <div className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50" />
          <div className="mt-6 flex flex-col">
            <span className="text-slate-400 text-xs font-bold font-sans tracking-wide">Average</span>
            <span className="text-2xl font-black font-mono text-white tracking-tight mt-1.5 truncate">
              {avgVal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Min Card */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.03]">
          <div className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
          <div className="mt-6 flex flex-col">
            <span className="text-slate-400 text-xs font-bold font-sans tracking-wide">Min</span>
            <span className="text-2xl font-black font-mono text-white tracking-tight mt-1.5 truncate">
              {minVal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
