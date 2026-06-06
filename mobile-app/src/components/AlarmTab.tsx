import React, { useState } from 'react';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  Trash2, 
  Sliders, 
  Settings, 
  Radio, 
  CheckCircle 
} from 'lucide-react';
import { AlarmThresholds, AlarmLog, MeterState, MeterSettings } from '../types';

interface AlarmTabProps {
  state: MeterState;
  settings: MeterSettings;
  thresholds: AlarmThresholds;
  onUpdateThresholds: (newThresholds: AlarmThresholds) => void;
  logs: AlarmLog[];
  onClearLogs: () => void;
  onUpdateSettings: (newSettings: MeterSettings) => void;
}

export default function AlarmTab({
  state,
  settings,
  thresholds,
  onUpdateThresholds,
  logs,
  onClearLogs,
  onUpdateSettings
}: AlarmTabProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'config'>('status');

  // Check if there are any currently active alarms based on live metrics
  const activeAlarmsList: { type: string; val: number; limit: number; msg: string }[] = [];

  if (state.voltage < thresholds.lowVoltage) {
    activeAlarmsList.push({
      type: 'Voltage Drop',
      val: state.voltage,
      limit: thresholds.lowVoltage,
      msg: `Under-Voltage alert: Local grid voltage dropped to ${state.voltage.toFixed(1)}V (Limit: ${thresholds.lowVoltage}V)`
    });
  }
  if (state.voltage > thresholds.highVoltage) {
    activeAlarmsList.push({
      type: 'Voltage Surge',
      val: state.voltage,
      limit: thresholds.highVoltage,
      msg: `Over-Voltage limit: Spike detected at ${state.voltage.toFixed(1)}V (Limit: ${thresholds.highVoltage}V)`
    });
  }
  if (state.current > thresholds.maxCurrent) {
    activeAlarmsList.push({
      type: 'Current Spike',
      val: state.current,
      limit: thresholds.maxCurrent,
      msg: `Over-Current flow triggered at ${state.current.toFixed(1)}A. Excessive grid inductive drain (Limit: ${thresholds.maxCurrent}A)`
    });
  }
  if (state.powerFactor < thresholds.minPowerFactor) {
    activeAlarmsList.push({
      type: 'Low Power Factor',
      val: state.powerFactor,
      limit: thresholds.minPowerFactor,
      msg: `Phase lag detected. Power Factor is extremely low at ${state.powerFactor.toFixed(2)} (Limit: ${thresholds.minPowerFactor})`
    });
  }
  if (state.accumulatedCostToday > thresholds.maxDailyCost) {
    activeAlarmsList.push({
      type: 'Daily Budget Overrun',
      val: state.accumulatedCostToday,
      limit: thresholds.maxDailyCost,
      msg: `Expenditure register: Daily cost of ₹${state.accumulatedCostToday.toFixed(2)} crossed cap (Limit: ₹${thresholds.maxDailyCost})`
    });
  }

  const handleSliderChange = (field: keyof AlarmThresholds, value: number) => {
    onUpdateThresholds({
      ...thresholds,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Inner Toggles */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('status')}
          className={`cursor-pointer flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5 ${
            activeTab === 'status' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${activeAlarmsList.length > 0 ? 'text-rose-500 animate-pulse' : ''}`} />
          <span>Active Status ({activeAlarmsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`cursor-pointer flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5 ${
            activeTab === 'config' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Update Limits</span>
        </button>
      </div>

      {activeTab === 'status' ? (
        <div className="space-y-6">
          {/* Active alerts panel */}
          {activeAlarmsList.length > 0 ? (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-rose-700 text-xs font-extrabold flex items-center space-x-1.5 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                  <span>{activeAlarmsList.length} Operational Alarm Breaches!</span>
                </span>
                <button
                  onClick={() => onUpdateSettings({ ...settings, notificationSound: !settings.notificationSound })}
                  className="p-1 px-2.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-[10px] font-bold flex items-center space-x-1 focus:outline-none cursor-pointer"
                >
                  {settings.notificationSound ? (
                    <>
                      <Bell className="w-3 h-3 text-rose-600" />
                      <span>Sound On</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3 h-3 text-rose-400" />
                      <span>Sound Muted</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                {activeAlarmsList.map((alarm, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-sm flex items-start space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0 animate-ping" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-800 uppercase tracking-tight">{alarm.type}</h4>
                      <p className="text-xs text-rose-600 font-medium mt-0.5">{alarm.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-emerald-800">All Systems Nominal</h3>
              <p className="text-xs text-emerald-600 max-w-xs mx-auto">
                Voltage is balanced, current flow parameters are strictly safe, and PF is above limits.
              </p>
            </div>
          )}

          {/* Alarm history log */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Operational Alarm Logs</h3>
                <p className="text-xs text-gray-500">Chronological history of registered metric limits</p>
              </div>
              {logs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="cursor-pointer text-xs text-rose-500 hover:text-rose-600 flex items-center space-x-1 font-semibold border border-rose-50 hover:bg-rose-50 px-2 py-1.5 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {logs.length > 0 ? (
              <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {log.type.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">{log.message}</p>
                      <span className="text-[10px] text-gray-400 block font-mono">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No historic alarms have been registered yet.</p>
            )}
          </div>
        </div>
      ) : (
        /* Configuration Panel */
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <Settings className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-gray-800">Operational Margin Triggers</h3>
          </div>

          {/* Controls Sliders */}
          <div className="space-y-5">
            {/* Low voltage range */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 font-medium">Under-Voltage Trip Threshold</span>
                <span className="font-mono font-bold text-indigo-600">{thresholds.lowVoltage} V</span>
              </div>
              <input
                type="range"
                min="200"
                max="225"
                value={thresholds.lowVoltage}
                onChange={(e) => handleSliderChange('lowVoltage', parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-gray-400">Triggers if incoming voltage drops blockages below this limit.</p>
            </div>

            {/* High voltage range */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 font-medium">Over-Voltage Trip Threshold</span>
                <span className="font-mono font-bold text-indigo-600">{thresholds.highVoltage} V</span>
              </div>
              <input
                type="range"
                min="240"
                max="260"
                value={thresholds.highVoltage}
                onChange={(e) => handleSliderChange('highVoltage', parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-gray-400">Triggers on line grid surges exceeding limit registers.</p>
            </div>

            {/* Max Current range */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 font-medium">Max Amperage Flow Cap</span>
                <span className="font-mono font-bold text-indigo-600">{thresholds.maxCurrent} A</span>
              </div>
              <input
                type="range"
                min="10"
                max="25"
                step="0.5"
                value={thresholds.maxCurrent}
                onChange={(e) => handleSliderChange('maxCurrent', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-gray-400">Protects internal home wiring spikes above load rating limits.</p>
            </div>

            {/* Min Power Factor */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 font-medium">Minimum Power Factor Limit</span>
                <span className="font-mono font-bold text-indigo-600">{thresholds.minPowerFactor.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="0.95"
                step="0.01"
                value={thresholds.minPowerFactor}
                onChange={(e) => handleSliderChange('minPowerFactor', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-gray-400">Alerts inductive heating efficiency losses beneath metric cap.</p>
            </div>

            {/* Max Daily Cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 font-medium">Max Daily Cost Alarm</span>
                <span className="font-mono font-bold text-indigo-600">₹{thresholds.maxDailyCost}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="10"
                value={thresholds.maxDailyCost}
                onChange={(e) => handleSliderChange('maxDailyCost', parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-gray-400">Keeps financial cost parameters disciplined dial. Warns on spending surges.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
