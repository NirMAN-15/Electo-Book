import React from 'react';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  Flame, 
  Play 
} from 'lucide-react';
import { MeterState, MeterSettings } from '../types';
import { useTranslation } from '../utils/translations';

interface DashboardTabProps {
  state: MeterState;
  settings: MeterSettings;
  onHeavyLoadToggle: () => void;
  isHeavyLoadActive: boolean;
  onResetAccumulators?: () => void;
}

export default function DashboardTab({ 
  state, 
  settings, 
  onHeavyLoadToggle, 
  isHeavyLoadActive
}: DashboardTabProps) {
  const { t } = useTranslation(settings.language || 'en');

  // Calculate active power live based on state
  const calculatedPower = parseFloat((state.voltage * state.current * state.powerFactor / 1000).toFixed(2));
  
  // Max scale is 10 kW
  const maxKw = 10.0;
  const powerPercentage = Math.min((calculatedPower / maxKw) * 100, 100);
  
  // SVG Arc settings for Gauge
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (powerPercentage / 100) * circumference;

  // Determine indicator color based on active load and state status
  let gaugeColor = 'stroke-emerald-500';
  if (state.status === 'warning') gaugeColor = 'stroke-amber-500';
  if (state.status === 'critical') gaugeColor = 'stroke-rose-500';

  return (
    <div className="space-y-6">
      {/* Prime Blue Gauge Card */}
      <div className="w-full bg-[#0D3276] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
        {/* Decorative ambient background mesh */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1e4eb4]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col items-center">
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium tracking-wider mb-4 border border-white/5">
            <span className={`inline-block w-2 h-2 rounded-full ${state.status === 'normal' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-bounce'}`} />
            <span>GRID LEVEL: {t(state.status).toUpperCase()}</span>
          </div>
 
          {/* SVG Vector Gauge */}
          <div className="relative flex flex-col items-center justify-center h-44 w-full">
            <svg className="w-60 h-32" viewBox="0 0 200 100">
              {/* Underlay Arc */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Dynamic Overlay Fill Arc */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                className={`transition-all duration-1000 ease-out ${gaugeColor}`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner text data */}
            <div className="absolute bottom-4 flex flex-col items-center text-center">
              <span className="text-white/70 text-xs font-mono uppercase tracking-widest">{t('current_power')}</span>
              <span className="text-4xl font-mono font-extrabold tracking-tight mt-0.5">
                {calculatedPower.toFixed(2)} <span className="text-xl font-normal text-white/80">kW</span>
              </span>
            </div>
          </div>

          {/* Cost Metrics Block */}
          <div className="w-full grid grid-cols-2 gap-4 border-t border-white/10 pt-5 mt-2 bg-black/10 rounded-2xl p-4">
            <div className="text-center border-r border-white/10">
              <span className="text-white/60 text-xs font-medium block mb-1">{t('cost_today')}</span>
              <span className="text-2xl font-mono font-bold tracking-tight text-emerald-400">
                {t('lkr_symbol')}{state.accumulatedCostToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-center">
              <span className="text-white/60 text-xs font-medium block mb-1">{t('est_monthly_cost')}</span>
              <span className="text-2xl font-mono font-bold tracking-tight text-amber-200">
                {t('lkr_symbol')}{state.monthlyEstimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of details cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current telemetry */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium text-xs font-sans tracking-tight block truncate uppercase">{t('current')}</span>
            <div className={`p-1.5 rounded-lg ${state.current > 15 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-extrabold text-gray-800">{state.current.toFixed(1)} A</p>
          <div className="flex items-center space-x-1 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${state.current > 15 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className={`text-[11px] font-bold ${state.current > 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {state.current > 15 ? t('warning') : t('normal')}
            </span>
          </div>
        </div>

        {/* Voltage telemetry */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium text-xs font-sans tracking-tight block truncate uppercase">{t('voltage')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-extrabold text-gray-800">{state.voltage.toFixed(1)} V</p>
          <div className="flex items-center space-x-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-605 text-emerald-600 font-sans">{t('normal')}</span>
          </div>
        </div>

        {/* Power Factor telemetry */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium text-xs font-sans tracking-tight block truncate uppercase">{t('power_factor')}</span>
            <div className={`p-1.5 rounded-lg ${state.powerFactor < 0.85 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-extrabold text-gray-800">{state.powerFactor.toFixed(2)}</p>
          <div className="flex items-center space-x-1 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${state.powerFactor < 0.85 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className={`text-[11px] font-bold ${state.powerFactor < 0.85 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {state.powerFactor < 0.85 ? t('warning') : t('normal')}
            </span>
          </div>
        </div>

        {/* Units today telemetry */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium text-xs font-sans tracking-tight block truncate uppercase">{t('units_today')}</span>
            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500">
              <span className="text-xs font-bold leading-none">kWh</span>
            </div>
          </div>
          <p className="text-2xl font-mono font-extrabold text-gray-800">{state.totalUnitsToday.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium font-mono text-ellipsis overflow-hidden whitespace-nowrap">
            {t('lkr_symbol')}{(state.totalUnitsToday * settings.tariffRate).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Simulator Quick Action widget */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-gray-800 flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{t('active_load')}</span>
            </h4>
            <p className="text-xs text-gray-500">{t('heavy_load')}</p>
          </div>
          <button
            onClick={onHeavyLoadToggle}
            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none flex items-center space-x-1.5 ${
              isHeavyLoadActive 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200' 
                : 'bg-white text-gray-700 hover:bg-white border border-gray-200'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isHeavyLoadActive ? 'animate-spin' : ''}`} />
            <span>{isHeavyLoadActive ? 'Deactivate' : 'Turn On'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
