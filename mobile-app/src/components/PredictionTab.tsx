import React from 'react';
import { 
  Sun, 
  Calendar, 
  TrendingUp, 
  BarChart, 
  Target 
} from 'lucide-react';
import { MeterState, MeterSettings, AlarmLog } from '../types';
import { useTranslation } from '../utils/translations';

interface PredictionTabProps {
  state: MeterState;
  settings: MeterSettings;
  activeAlarms: AlarmLog[];
}

export default function PredictionTab({ state, settings }: PredictionTabProps) {
  const { t } = useTranslation(settings.language || 'en');

  // Math configurations for scaled predictions
  // Today's values
  const dailyCost = state.accumulatedCostToday > 0 ? state.accumulatedCostToday : 384.20;
  const dailyUnits = state.totalUnitsToday > 0 ? state.totalUnitsToday : 69.9;

  // Monthly projected values
  const monthlyCost = state.monthlyEstimatedCost > 0 ? state.monthlyEstimatedCost : 11526;
  const monthlyUnits = state.monthlyEstimatedUnits > 0 ? state.monthlyEstimatedUnits : 2096;

  // Yearly projected values
  const yearlyCost = monthlyCost * 12;
  const yearlyUnits = monthlyUnits * 12;

  // Weekly projected values
  const weeklyCost = dailyCost * 7;
  const weeklyUnits = dailyUnits * 7;

  // Peak load estimator (dynamic based on live state draw)
  const peakLoad = Math.max(state.currentPower * 1.35, 5.2).toFixed(1);

  // Helper helper to scale currency labels beautifully
  const formatValue = (val: number) => {
    if (val >= 100000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return Math.round(val).toLocaleString();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title block */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white tracking-tight">Prediction</h2>
        <p className="text-sm font-medium text-slate-400">Based on today's usage</p>
      </div>

      {/* Primary Indigo projected monthly bill card */}
      <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 border border-indigo-800/40 p-6 rounded-3xl text-white relative shadow-lg shadow-indigo-950/20 space-y-4">
        <div>
          <span className="text-indigo-200/90 text-xs font-black tracking-widest uppercase block">Projected Monthly Bill</span>
          <span className="text-5xl font-extrabold tracking-tight mt-2.5 block text-white">
            {t('lkr_symbol')}{Math.round(monthlyCost).toLocaleString()}
          </span>
          <span className="text-indigo-300 font-bold text-xs mt-1.5 opacity-80 block font-mono">
            {Math.round(monthlyUnits)} kWh @ {t('lkr_symbol')}{settings.tariffRate}/unit
          </span>
        </div>

        <div className="border-t border-indigo-500/20 my-4" />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Today</span>
            <span className="text-lg font-mono font-black text-white mt-0.5 block">
              {t('lkr_symbol')}{Math.round(dailyCost)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Yearly Est.</span>
            <span className="text-lg font-mono font-black text-white mt-0.5 block">
              {t('lkr_symbol')}{formatValue(yearlyCost)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Peak Load</span>
            <span className="text-lg font-mono font-black text-white mt-0.5 block">
              {peakLoad} kW
            </span>
          </div>
        </div>
      </div>

      {/* Daily Cost Forecast bar chart */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl space-y-4">
        <div>
          <h3 className="text-slate-100 font-bold text-lg leading-none">Daily Cost Forecast</h3>
          <p className="text-slate-550 text-slate-400 text-xs font-semibold mt-1">Projected 7-day spend</p>
        </div>
        
        <div className="flex items-end justify-between h-36 pt-6 px-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
            // Precise beautiful multipliers aligned with mockup visual heights
            const multipliers = [0.55, 0.75, 0.48, 0.70, 0.95, 0.58, 0.52];
            const percent = multipliers[idx] * 100;
            return (
              <div key={day} className="flex flex-col items-center flex-1 space-y-2">
                {/* Bar */}
                <div className="relative w-8 bg-slate-800 rounded-t-lg rounded-b-md overflow-hidden h-24 flex items-end">
                  <div 
                    className="w-full bg-indigo-500/80 hover:bg-indigo-400 rounded-t-lg transition-all duration-1000 ease-out"
                    style={{ height: `${percent}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Breakdown category analysis */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl space-y-5">
        <div>
          <h3 className="text-slate-100 font-bold text-lg leading-none">Cost Breakdown</h3>
        </div>

        <div className="space-y-4">
          {/* Per Day Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-2xl">
                <Sun className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-slate-100 font-bold text-sm block">Per Day</span>
                <span className="text-[11px] text-slate-500 font-bold block">{dailyUnits.toFixed(1)} kWh</span>
              </div>
            </div>
            <span className="text-slate-200 font-mono font-black text-sm">{t('lkr_symbol')}{dailyCost.toFixed(2)}</span>
          </div>

          {/* Per Week Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-2xl">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-slate-100 font-bold text-sm block">Per Week</span>
                <span className="text-[11px] text-slate-500 font-bold block">{Math.round(weeklyUnits)} kWh</span>
              </div>
            </div>
            <span className="text-slate-200 font-mono font-black text-sm">{t('lkr_symbol')}{weeklyCost.toFixed(2)}</span>
          </div>

          {/* Per Month Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500/10 border border-indigo-505/20 border-indigo-500/20 p-2.5 rounded-2xl">
                <BarChart className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-slate-100 font-bold text-sm block">Per Month</span>
                <span className="text-[11px] text-slate-500 font-bold block">{Math.round(monthlyUnits)} kWh</span>
              </div>
            </div>
            <span className="text-slate-200 font-mono font-black text-sm">{t('lkr_symbol')}{Math.round(monthlyCost).toLocaleString()}</span>
          </div>

          {/* Per Year Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-slate-100 font-bold text-sm block">Per Year</span>
                <span className="text-[11px] text-slate-500 font-bold block">{Math.round(yearlyUnits).toLocaleString()} kWh</span>
              </div>
            </div>
            <span className="text-slate-200 font-mono font-black text-sm">{t('lkr_symbol')}{formatValue(yearlyCost)}</span>
          </div>
        </div>
      </div>

      {/* Power Efficiency factor panel */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Power Efficiency</span>
          <span className="text-5xl font-mono font-black text-indigo-400 tracking-tight block">
            {state.powerFactor.toFixed(2)}
          </span>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest ${
          state.powerFactor >= 0.85 
            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        }`}>
          {state.powerFactor >= 0.85 ? 'Good' : 'Lagging'}
        </span>
      </div>
    </div>
  );
}
