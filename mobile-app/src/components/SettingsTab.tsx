import React from 'react';
import { 
  Settings, 
  Database, 
  Sliders, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Zap,
  Globe,
  LogOut
} from 'lucide-react';
import { MeterSettings, MeterState, Language } from '../types';
import { useTranslation } from '../utils/translations';

interface SettingsTabProps {
  settings: MeterSettings;
  onUpdateSettings: (newSettings: MeterSettings) => void;
  liveState: MeterState;
  onUpdateLiveState: (partialState: Partial<MeterState>) => void;
  onResetAccumulators: () => void;
  isSimulatedFluctuationOn: boolean;
  onToggleFluctuations: () => void;
  onLogout: () => void;
}

export default function SettingsTab({
  settings,
  onUpdateSettings,
  liveState,
  onUpdateLiveState,
  onResetAccumulators,
  isSimulatedFluctuationOn,
  onToggleFluctuations,
  onLogout
}: SettingsTabProps) {

  const { t } = useTranslation(settings.language || 'en');

  const handleInputChange = (field: keyof MeterSettings, value: any) => {
    onUpdateSettings({
      ...settings,
      [field]: value
    });
  };

  const handleStateChange = (field: keyof MeterState, value: number) => {
    onUpdateLiveState({
      [field]: value
    });
  };

  // Quick preset triggers
  const triggerBrownout = () => {
    onUpdateLiveState({ voltage: 195, current: 8.5 });
  };

  const triggerSurge = () => {
    onUpdateLiveState({ voltage: 258, current: 23.5 });
  };

  const recoverNormal = () => {
    onUpdateLiveState({ voltage: 238.5, current: 12.7, powerFactor: 0.86 });
  };

  return (
    <div className="space-y-6">
      {/* App Language Selector first for convenience */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-sm space-y-3 border border-indigo-950">
        <div className="flex items-center space-x-2 pb-2 border-b border-indigo-800/40">
          <Globe className="w-4 h-4 text-indigo-300 animate-pulse" />
          <h3 className="text-xs font-black tracking-wider uppercase text-indigo-100">{t('app_language')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['en', 'si', 'ta'] as Language[]).map((lang) => {
            const label = lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்';
            const isActive = (settings.language || 'en') === lang;
            return (
              <button
                key={lang}
                onClick={() => handleInputChange('language', lang)}
                className={`cursor-pointer px-3 py-2.5 rounded-xl text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-slate-950/40 font-black' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Consumer Profile Setup card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
          <Settings className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-gray-800">{t('profile_config')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Utility company registry */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {t('utility_name')}
            </label>
            <input
              type="text"
              value={settings.utilityName}
              onChange={(e) => handleInputChange('utilityName', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Phase configuration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {t('phase_standard')}
            </label>
            <select
              value={settings.phase}
              onChange={(e) => handleInputChange('phase', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="Single Phase">{t('single_phase_desc')}</option>
              <option value="Three Phase">{t('three_phase_desc')}</option>
            </select>
          </div>

          {/* Pricing Tariff Rate */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {t('tariff_rate')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">{t('lkr_symbol')}</span>
              <input
                type="number"
                step="0.05"
                min="1"
                value={settings.tariffRate}
                onChange={(e) => handleInputChange('tariffRate', parseFloat(e.target.value) || 4.5)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold font-mono text-gray-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Monthly target budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {t('monthly_limit')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">{t('lkr_symbol')}</span>
              <input
                type="number"
                step="50"
                min="500"
                value={settings.targetBudget}
                onChange={(e) => handleInputChange('targetBudget', parseInt(e.target.value) || 5000)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold font-mono text-gray-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Muted toggle option */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-gray-700 block">{t('alerts_sound')}</span>
            <span className="text-[10px] text-gray-400">{t('sound_desc')}</span>
          </div>
          <button
            onClick={() => handleInputChange('notificationSound', !settings.notificationSound)}
            className="p-2 rounded-xl border border-gray-100 hover:bg-slate-50 focus:outline-none cursor-pointer"
          >
            {settings.notificationSound ? (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Simulator Control Box */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-orange-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">{t('calibration')}</h3>
          </div>
          <span className="text-[9px] font-bold font-mono bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-500/10">
            {t('mock_mode')}
          </span>
        </div>

        <div className="space-y-5">
          {/* Overwrite Voltage Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">{t('calibration_voltage')}</span>
              <span className="font-bold text-orange-400">{liveState.voltage.toFixed(1)} V</span>
            </div>
            <input
              type="range"
              min="190"
              max="270"
              step="0.5"
              value={liveState.voltage}
              onChange={(e) => handleStateChange('voltage', parseFloat(e.target.value))}
              className="w-full accent-orange-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Low (Brownout)</span>
              <span>High (Surge)</span>
            </div>
          </div>

          {/* Overwrite Power Factor Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">{t('calibration_pf')}</span>
              <span className="font-bold text-orange-400">{liveState.powerFactor.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="1.0"
              step="0.01"
              value={liveState.powerFactor}
              onChange={(e) => handleStateChange('powerFactor', parseFloat(e.target.value))}
              className="w-full accent-orange-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Presets Action grid list */}
          <div className="pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              {t('inject_triggers')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={triggerBrownout}
                className="cursor-pointer bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700/50 text-xs font-bold text-amber-500 focus:outline-none hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t('inject_brownout')}
              </button>
              
              <button
                onClick={triggerSurge}
                className="cursor-pointer bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700/50 text-xs font-bold text-rose-400 focus:outline-none hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t('inject_surge')}
              </button>

              <button
                onClick={recoverNormal}
                className="cursor-pointer bg-slate-100 hover:bg-slate-50 p-2.5 rounded-xl text-slate-900 border border-slate-200 text-xs font-bold focus:outline-none hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t('recover_normal')}
              </button>
            </div>
          </div>

          {/* Simulated minor fluctuations toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-300 block">{t('fluctuator')}</span>
              <span className="text-[10px] text-slate-500">{t('fluctuator_desc')}</span>
            </div>
            <button
              onClick={onToggleFluctuations}
              className={`cursor-pointer text-[10px] font-black px-3.5 py-1.5 rounded-xl text-center focus:outline-none transition-all ${
                isSimulatedFluctuationOn 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-950' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {isSimulatedFluctuationOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Database operations box */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
          <Database className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-gray-800">{t('operational_registers')}</h3>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-700 font-bold block">{t('reset_cumulatives')}</span>
            <span className="text-[10px] text-gray-400">{t('reset_desc')} ({t('units_today')}: {liveState.totalUnitsToday} kWh)</span>
          </div>
          <button
            onClick={onResetAccumulators}
            className="cursor-pointer bg-white hover:bg-rose-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 focus:outline-none flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('format_meter')}</span>
          </button>
        </div>
      </div>

      {/* Session Sign-out card */}
      <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-rose-900 font-bold block">{t('logout')}</span>
            <span className="text-[10px] text-rose-500">{t('logout_confirm')}</span>
          </div>
          <button
            onClick={onLogout}
            className="cursor-pointer bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none flex items-center space-x-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-rose-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
