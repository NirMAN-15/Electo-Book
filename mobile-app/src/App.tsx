/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  LineChart as ChartIcon, 
  Bell, 
  Lightbulb, 
  Settings as SettingsIcon,
  Zap,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  ShieldCheck,
  CreditCard,
  UserPlus,
  ArrowLeft,
  Mail,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { 
  MeterState, 
  MeterSettings, 
  AlarmThresholds, 
  AlarmLog, 
  HourlyReading, 
  DailyReading 
} from './types';

// Tab imports
import DashboardTab from './components/DashboardTab';
import GraphsTab from './components/GraphsTab';
import AlarmTab from './components/AlarmTab';
import PredictionTab from './components/PredictionTab';
import SettingsTab from './components/SettingsTab';
import PayTab from './components/PayTab';

// Translation helper
import { useTranslation } from './utils/translations';

// Firebase hooks
import { useAuth } from './hooks/useAuth';
import { useMeterData } from './hooks/useMeterData';

// Storage helper guards (retained for settings persistence in fallback mode)
const STORAGE_PREFIX = 'electro_book_';

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // ─── Firebase Auth Hook ───────────────────────────────────────────
  const {
    user,
    userProfile,
    loading: authLoading,
    error: authError,
    isAuthenticated,
    meterId,
    isFirebaseMode,
    signIn,
    signUp,
    signOut,
    clearError,
  } = useAuth();

  // ─── Firebase Meter Data Hook ─────────────────────────────────────
  const {
    liveState,
    hourlyData,
    dailyData,
    alarms,
    thresholds,
    loading: meterLoading,
    isConnected,
    setLiveState,
    setThresholds,
    setHourlyData,
    setDailyData,
    setAlarms,
    syncLiveState,
    syncAlarm,
    syncClearAlarms,
    syncSettings,
    syncThresholds,
  } = useMeterData(meterId);

  // ─── Meter Settings ───────────────────────────────────────────────
  const [settings, setSettings] = useState<MeterSettings>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'settings');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return {
          language: 'en',
          ...parsed
        };
      } catch (e) {}
    }
    return {
      utilityName: 'Sri Lanka Electricity Board (Sleb)',
      phase: 'Single Phase',
      tariffRate: 4.5, // ₹ per kWh
      targetBudget: 5000, // ₹ monthly
      notificationSound: true,
      language: 'en'
    };
  });

  const { t } = useTranslation(settings.language || 'en');

  // ─── Login Form States ────────────────────────────────────────────
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync auth errors from the hook
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  // ─── Login Handler ────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const success = await signIn(emailInput, passwordInput);
    
    if (!success && !authError) {
      setLoginError('Login failed. Please check your credentials.');
    }
    
    setIsSubmitting(false);
  };

  // ─── Registration Handler ────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!nameInput.trim()) {
      setLoginError('Please enter your name.');
      return;
    }
    if (!emailInput.trim()) {
      setLoginError('Please enter your email.');
      return;
    }
    if (passwordInput.length < (isFirebaseMode ? 6 : 4)) {
      setLoginError(isFirebaseMode ? 'Password must be at least 6 characters.' : 'Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    const success = await signUp(emailInput, passwordInput, nameInput, settings.language || 'en');
    
    if (!success && !authError) {
      setLoginError('Registration failed. Please try again.');
    }

    setIsSubmitting(false);
  };

  // ─── Logout Handler ──────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut();
    setEmailInput('');
    setPasswordInput('');
    setNameInput('');
    clearError();
  };

  // ─── Active status triggers for simulations ───────────────────────
  const [isHeavyLoadActive, setIsHeavyLoadActive] = useState<boolean>(false);
  const [isSimulatedFluctuationOn, setIsSimulatedFluctuationOn] = useState<boolean>(true);

  // Keep track of limits previously triggered to avoid duplicate alarm flood sounds
  const triggeredAlarmsRef = useRef<Record<string, boolean>>({});

  // Audio synthetics beep player
  const playAlarmAcoustic = () => {
    if (!settings.notificationSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, audioCtx.currentTime); // high tone chirp
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.16); // play for 160ms
    } catch (e) {}
  };

  // ─── Sync settings to localStorage (and optionally Firebase) ──────
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
    // Also sync to Firebase if connected
    if (isConnected && meterId) {
      syncSettings(meterId, settings).catch(console.error);
    }
  }, [settings]);

  // ─── Electrical Auditing Logic ────────────────────────────────────
  const performElectricalAuditing = (currentState: MeterState) => {
    let systemStatus: 'normal' | 'warning' | 'critical' = 'normal';
    const activeBreaches: string[] = [];

    // Under-voltage
    if (currentState.voltage < thresholds.lowVoltage) {
      systemStatus = 'warning';
      activeBreaches.push('voltage_low');
      registerAlarmEvent('voltage', currentState.voltage, `Under-Voltage warning! Line drops to ${currentState.voltage.toFixed(1)}V.`);
    } else {
      triggeredAlarmsRef.current['voltage_low'] = false;
    }

    // Over-voltage
    if (currentState.voltage > thresholds.highVoltage) {
      systemStatus = 'critical';
      activeBreaches.push('voltage_high');
      registerAlarmEvent('voltage', currentState.voltage, `Over-voltage surge! Line reading spiked to ${currentState.voltage.toFixed(1)}V.`);
    } else {
      triggeredAlarmsRef.current['voltage_high'] = false;
    }

    // Over-current
    if (currentState.current > thresholds.maxCurrent) {
      systemStatus = 'critical';
      activeBreaches.push('current_max');
      registerAlarmEvent('current', currentState.current, `Over-current overload! Flow drawn registered at ${currentState.current.toFixed(1)}A.`);
    } else {
      triggeredAlarmsRef.current['current_max'] = false;
    }

    // Low PF
    if (currentState.powerFactor < thresholds.minPowerFactor) {
      if (systemStatus !== 'critical') systemStatus = 'warning';
      activeBreaches.push('pf_low');
      registerAlarmEvent('pf', currentState.powerFactor, `Inefficient Phase draw warning: PF dropped to ${currentState.powerFactor.toFixed(2)}.`);
    } else {
      triggeredAlarmsRef.current['pf_low'] = false;
    }

    // Budget over spending
    if (currentState.accumulatedCostToday > thresholds.maxDailyCost) {
      if (systemStatus === 'normal') systemStatus = 'warning';
      activeBreaches.push('cost_max');
      registerAlarmEvent('cost', currentState.accumulatedCostToday, `Daily spending alarm limit reached! Cost hit ₹${currentState.accumulatedCostToday.toFixed(1)}.`);
    } else {
      triggeredAlarmsRef.current['cost_max'] = false;
    }

    // Set updated status
    if (liveState.status !== systemStatus) {
      setLiveState(prev => ({ ...prev, status: systemStatus }));
    }
  };

  const registerAlarmEvent = (type: 'voltage' | 'current' | 'pf' | 'cost', value: number, msg: string) => {
    const key = `${type}_${type === 'voltage' && value < thresholds.lowVoltage ? 'low' : type === 'voltage' ? 'high' : 'max'}`;
    
    // Only sound beep and commit log record if this is the first transition breach
    if (!triggeredAlarmsRef.current[key]) {
      triggeredAlarmsRef.current[key] = true;
      playAlarmAcoustic();

      const newLog: AlarmLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type,
        value,
        message: msg,
        isActive: true
      };

      setAlarms(prev => [newLog, ...prev].slice(0, 50)); // cap history at 50 records

      // Sync alarm to Firebase
      if (meterId) {
        syncAlarm(meterId, newLog).catch(console.error);
      }
    }
  };

  // ─── Background Telemetry Simulation Loop ─────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // 1. Calculate active draw (kW) based on calibration controls
      let targetCurrent = liveState.current;
      if (isHeavyLoadActive) {
        targetCurrent = Math.max(targetCurrent, 20.2);
      }

      // Fluctuations (Continual variations)
      let finalVoltage = liveState.voltage;
      let finalCurrent = targetCurrent;
      let finalPF = liveState.powerFactor;

      if (isSimulatedFluctuationOn) {
        finalVoltage += parseFloat((Math.sin(Date.now() / 3000) * 0.9).toFixed(2));
        finalCurrent += parseFloat((Math.cos(Date.now() / 4000) * 0.08).toFixed(2));
        finalPF += parseFloat((Math.sin(Date.now() / 6000) * 0.005).toFixed(3));
        
        finalPF = Math.min(Math.max(finalPF, 0.5), 1.0);
        finalCurrent = Math.max(finalCurrent, 0.5);
      }

      // 2. Mathematically compute power draw kW and energy units kWh
      const updatedKw = parseFloat((finalVoltage * finalCurrent * finalPF / 1000).toFixed(2));
      
      const secondsPassed = 3;
      const consumedUnitsThisTick = parseFloat(((updatedKw * secondsPassed) / 3600).toFixed(6));
      const nextUnitsToday = parseFloat((liveState.totalUnitsToday + consumedUnitsThisTick).toFixed(5));
      const nextCostToday = parseFloat((nextUnitsToday * settings.tariffRate).toFixed(2));

      const estimatedUnitsMonth = parseFloat((nextUnitsToday * 30).toFixed(1));
      const estimatedCostMonth = parseFloat((estimatedUnitsMonth * settings.tariffRate).toFixed(2));

      const updatedState: MeterState = {
        voltage: parseFloat(finalVoltage.toFixed(1)),
        current: parseFloat(finalCurrent.toFixed(1)),
        powerFactor: parseFloat(finalPF.toFixed(2)),
        currentPower: updatedKw,
        totalUnitsToday: nextUnitsToday,
        accumulatedCostToday: nextCostToday,
        monthlyEstimatedUnits: estimatedUnitsMonth,
        monthlyEstimatedCost: estimatedCostMonth,
        status: liveState.status
      };

      setLiveState(updatedState);
      performElectricalAuditing(updatedState);

      // Sync live state to Firebase
      if (meterId) {
        syncLiveState(meterId, updatedState).catch(console.error);
      }

      // Hourly data graph shifting
      setHourlyData(prev => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        copy[lastIdx] = {
          ...copy[lastIdx],
          power: updatedKw,
          voltage: parseFloat(finalVoltage.toFixed(1)),
          current: parseFloat(finalCurrent.toFixed(1))
        };
        return copy;
      });

    }, 3000);

    return () => clearInterval(interval);
  }, [liveState, isHeavyLoadActive, isSimulatedFluctuationOn, settings, thresholds, isAuthenticated, meterId]);

  // ─── Handler Functions ────────────────────────────────────────────
  const handleUpdateLiveState = (partialState: Partial<MeterState>) => {
    setLiveState(prev => {
      const next = { ...prev, ...partialState };
      performElectricalAuditing(next);
      return next;
    });
  };

  const handleResetAccumulators = () => {
    if (window.confirm("Format meter indexing memory? This will reset Units Today to 0.0 kWh.")) {
      const resetState: Partial<MeterState> = {
        totalUnitsToday: 0.0,
        accumulatedCostToday: 0.0,
        monthlyEstimatedUnits: 0.0,
        monthlyEstimatedCost: 0.0
      };
      setLiveState(prev => ({ ...prev, ...resetState }));
    }
  };

  const handlePaymentSuccess = (paidAmount: number) => {
    setLiveState(prev => ({
      ...prev,
      totalUnitsToday: 0.0,
      accumulatedCostToday: 0.0,
      monthlyEstimatedUnits: 0.0,
      monthlyEstimatedCost: 0.0
    }));
  };

  const handleClearAlarmLogs = () => {
    setAlarms([]);
    if (meterId) {
      syncClearAlarms(meterId).catch(console.error);
    }
  };

  const handleHeavyLoadToggle = () => {
    setIsHeavyLoadActive(!isHeavyLoadActive);
  };

  const handleUpdateSettings = (newSettings: MeterSettings) => {
    setSettings(newSettings);
  };

  const handleUpdateThresholds = (newThresholds: AlarmThresholds) => {
    setThresholds(newThresholds);
    if (meterId) {
      syncThresholds(meterId, newThresholds).catch(console.error);
    }
  };

  // ─── Auth Loading Screen ──────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-gradient-to-tr from-amber-400 to-amber-500 p-4 rounded-2xl shadow-xl border border-amber-300/20 mx-auto animate-pulse">
            <Zap className="w-8 h-8 text-indigo-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-300">
              Electro Book
            </h2>
            <div className="flex items-center justify-center space-x-2 mt-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-indigo-300 font-bold">Initializing secure connection...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sm:bg-gradient-to-br sm:from-slate-100 sm:via-slate-200/70 sm:to-indigo-50/50 flex items-center justify-center sm:py-8 sm:px-4 select-none">
      
      {/* Premium Metallic Smartphone Shell Simulator (Fills screen on mobile, looks like physical phone on desktop) */}
      <div className="w-full h-screen sm:h-[840px] sm:max-w-[412px] sm:rounded-[54px] sm:p-3 sm:bg-slate-900 sm:shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] sm:border-4 sm:border-slate-800/80 relative flex flex-col overflow-hidden sm:ring-[12px] sm:ring-slate-950/90 sm:ring-offset-2 sm:ring-offset-slate-200">
        
        {/* Physical Button Mockups (Only visible on wide desktop viewports) */}
        <div className="hidden sm:block absolute top-28 -left-1 w-1.5 h-12 bg-slate-800 rounded-r-md border-r border-slate-700/50" />
        <div className="hidden sm:block absolute top-44 -left-1 w-1.5 h-16 bg-slate-800 rounded-r-md border-r border-slate-700/50" />
        <div className="hidden sm:block absolute top-64 -left-1 w-1.5 h-16 bg-slate-800 rounded-r-md border-r border-slate-700/50" />
        <div className="hidden sm:block absolute top-40 -right-1 w-1.5 h-20 bg-slate-800 rounded-l-md border-l border-slate-700/50" />

        {/* Smartphone Inner Screen Canvas */}
        <div className="flex-1 bg-[#E5E5E5] flex flex-col justify-between selection:bg-indigo-500 selection:text-white sm:rounded-[42px] overflow-hidden relative shadow-inner">
          
          {/* Mobile System Status Bar (Status, WiFi, Battery, Carrier) */}
          <div className="bg-indigo-950 text-white px-6 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-black tracking-tight z-50">
            {/* System Clock */}
            <span className="font-mono text-xs">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            
            {/* Dynamic Island / Sleek Camera Notch (Interactive click easter-egg) */}
            <div className="w-24 h-5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2 flex items-center justify-between px-3 cursor-pointer group hover:w-36 transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/85 group-hover:animate-ping" />
              <div className="flex items-center space-x-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[8px] text-amber-400 font-extrabold animate-pulse uppercase tracking-wider">ELECTRO AI</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            {/* Icons (Signal, Wifi, Battery) */}
            <div className="flex items-center space-x-1.5">
              {/* Cellular Signal Strength */}
              <div className="flex items-end space-x-0.5 h-2.5">
                <div className="w-0.5 h-1 bg-white rounded-2xs" />
                <div className="w-0.5 h-1.5 bg-white rounded-2xs" />
                <div className="w-0.5 h-2 bg-white rounded-2xs" />
                <div className="w-0.5 h-2.5 bg-white rounded-2xs" />
              </div>
              
              {/* 5G label */}
              <span className="text-[8px] font-black leading-none bg-indigo-500/40 px-1 py-0.5 rounded-2xs tracking-widest">5G</span>
              
              {/* Battery percentage */}
              <span className="text-[10px] font-bold">88%</span>
              
              {/* Battery Frame */}
              <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                <div className="h-full w-[88%] bg-emerald-400 rounded-2xs animate-pulse" />
              </div>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex-1 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-between p-6 text-white relative overflow-y-auto">
              {/* Outer ambient decorative stars/grid */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

              <div className="my-auto space-y-7 z-10 w-full">
                {/* Brand Logo & Title Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex bg-gradient-to-tr from-amber-400 to-amber-500 p-4 rounded-2xl shadow-xl border border-amber-300/20 mx-auto animate-pulse">
                    <Zap className="w-8 h-8 text-indigo-950 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-300">
                      Electro Book
                    </h2>
                    <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-extrabold mt-0.5">
                      SMART METERING HUB
                    </p>
                  </div>
                  <p className="text-xs text-slate-300 max-w-[280px] mx-auto leading-relaxed">
                    විදුලි භාවිතය කළමනාකරණය කර සහ සුරක්ෂිත කරන්න
                    <span className="block text-[10px] text-indigo-400 tracking-wide font-medium italic mt-1">Secure Energy Advisory & Consumption Portal</span>
                  </p>
                </div>

                {/* Firebase / Local mode indicator */}
                <div className="flex items-center justify-center space-x-1.5">
                  {isFirebaseMode ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Firebase Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-400" />
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Local Demo Mode</span>
                    </>
                  )}
                </div>

                {/* Form controls component */}
                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
                  
                  {/* Registration: Back button + Name field */}
                  {isRegistering && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setIsRegistering(false); setLoginError(''); clearError(); }}
                        className="flex items-center space-x-1 text-indigo-300 hover:text-white transition text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Back to Login</span>
                      </button>

                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">
                          නම / Full Name
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-slate-400">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="Your full name"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email / Username */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">
                      {isFirebaseMode ? 'විද්‍යුත් තැපැල් / Email' : 'පරිශීලක නාමය / Username'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        {isFirebaseMode ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </span>
                      <input
                        type={isFirebaseMode ? 'email' : 'text'}
                        placeholder={isFirebaseMode ? 'you@example.com' : 'electrobook'}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">
                      මුරපදය / Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-white focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-xs" /> : <Eye className="w-4 h-4 text-xs" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Notification banner */}
                  {loginError && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl text-[10px] text-rose-300 font-semibold text-center">
                      {loginError}
                    </div>
                  )}

                  {/* Submit Trigger */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500/90 hover:to-amber-600/90 active:scale-[0.98] text-indigo-950 text-xs font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center space-x-1.5 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isRegistering ? 'Creating Account...' : 'Signing In...'}</span>
                      </>
                    ) : isRegistering ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>ලියාපදිංචි වන්න / REGISTER</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>ඇතුල් වන්න / LOG IN</span>
                      </>
                    )}
                  </button>

                  {/* Toggle between login and register */}
                  {!isRegistering && (
                    <button
                      type="button"
                      onClick={() => { setIsRegistering(true); setLoginError(''); clearError(); }}
                      className="w-full text-center text-[10px] text-indigo-300 hover:text-white font-bold uppercase tracking-wider transition cursor-pointer py-1"
                    >
                      <span className="flex items-center justify-center space-x-1">
                        <UserPlus className="w-3 h-3" />
                        <span>Don't have an account? Register</span>
                      </span>
                    </button>
                  )}
                </form>
              </div>

              {/* Secure certification seal */}
              <div className="border-t border-white/5 pt-4 text-center flex items-center justify-center space-x-1.5 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] font-bold tracking-wider uppercase">Sleb Secured Meter Connection</span>
              </div>
            </div>
          ) : (
            <>
              {/* App Header top-bar */}
              <header className="bg-indigo-900 border-b border-indigo-950/20 text-white px-5 py-4 sticky top-0 z-40 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-white/10 p-2 rounded-xl border border-white/5">
                    <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-base font-black tracking-tight leading-none uppercase">Electro Book</h1>
                    <span className="text-[10px] text-indigo-300 font-extrabold tracking-wider">{settings.phase.toUpperCase()} GRID METER</span>
                  </div>
                </div>

                {/* Live clock/pulse signal + Firebase status */}
                <div className="text-right flex items-center pr-1 space-x-2">
                  {isConnected && (
                    <span className="text-[8px] font-bold text-emerald-400 flex items-center" title="Synced to Firebase">
                      <Wifi className="w-2.5 h-2.5 mr-0.5" />
                    </span>
                  )}
                  <span className="text-[10px] font-black text-emerald-400 flex items-center space-x-1.5 uppercase">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                    <span>LIVE</span>
                  </span>
                </div>
              </header>

              {/* Primary content area */}
              <main className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                
                {(!isConnected && selectedIndex === 0) && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <WifiOff className="text-rose-500 w-6 h-6" />
                      <div>
                        <h4 className="text-white font-bold text-sm">ESP32 Not Connected</h4>
                        <p className="text-slate-400 text-xs">Connect your Smart Meter</p>
                      </div>
                    </div>
                    <button className="bg-rose-500 hover:bg-rose-600 transition text-white text-xs font-bold px-3 py-1.5 rounded-lg" 
                      onClick={async () => {
                        try {
                          const { ref, set } = await import('firebase/database');
                          const { db } = await import('./firebase/config');
                          if (user && meterId) {
                            await set(ref(db, `meters/${meterId}/status`), 'connected');
                            await set(ref(db, `meters/${meterId}/live`), { voltage: 230, current: 13.9, powerFactor: 0.95 });
                            alert('ESP32 Successfully Connected and Registered in Firebase!');
                          } else {
                            alert('User or Meter ID not found. Please log in.');
                          }
                        } catch (e) {
                          console.error(e);
                          alert('Failed to connect ESP32');
                        }
                      }}>
                      Connect
                    </button>
                  </div>
                )}
                
                {selectedIndex === 0 && (
                  <DashboardTab 
                    state={liveState} 
                    settings={settings}
                    isHeavyLoadActive={isHeavyLoadActive}
                    onHeavyLoadToggle={handleHeavyLoadToggle}
                  />
                )}

                {selectedIndex === 1 && (
                  <GraphsTab 
                    state={liveState}
                    settings={settings}
                    hourlyData={hourlyData} 
                    dailyData={dailyData} 
                  />
                )}

                {selectedIndex === 2 && (
                  <AlarmTab 
                    state={liveState}
                    settings={settings}
                    thresholds={thresholds}
                    onUpdateThresholds={handleUpdateThresholds}
                    logs={alarms}
                    onClearLogs={handleClearAlarmLogs}
                    onUpdateSettings={handleUpdateSettings}
                  />
                )}

                {selectedIndex === 3 && (
                  <PredictionTab 
                    state={liveState}
                    settings={settings}
                    activeAlarms={alarms}
                  />
                )}

                {selectedIndex === 4 && (
                  <SettingsTab 
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    liveState={liveState}
                    onUpdateLiveState={handleUpdateLiveState}
                    onResetAccumulators={handleResetAccumulators}
                    isSimulatedFluctuationOn={isSimulatedFluctuationOn}
                    onToggleFluctuations={() => setIsSimulatedFluctuationOn(!isSimulatedFluctuationOn)}
                    onLogout={handleLogout}
                  />
                )}

                {selectedIndex === 5 && (
                  <PayTab 
                    state={liveState}
                    settings={settings}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                )}

              </main>

              {/* Styled bottom navigation bar matching Flutter items, auto-adjusting for any screen size */}
              <footer className="bg-white border-t border-gray-200 py-2.5 px-1.5 sticky bottom-0 z-40 shadow-2xl flex items-center justify-between gap-1 w-full overflow-x-hidden">
                
                <button
                  onClick={() => setSelectedIndex(0)}
                  className={`cursor-pointer flex flex-col items-center justify-center flex-1 min-w-0 p-1 rounded-lg transition-all focus:outline-none ${
                    selectedIndex === 0 
                      ? 'text-indigo-700 bg-indigo-50 font-extrabold scale-[1.02]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mb-0.5 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[9.5px] uppercase tracking-wider font-semibold truncate w-full text-center block">{t('dashboard')}</span>
                </button>

                <button
                  onClick={() => setSelectedIndex(1)}
                  className={`cursor-pointer flex flex-col items-center justify-center flex-1 min-w-0 p-1 rounded-lg transition-all focus:outline-none ${
                    selectedIndex === 1 
                      ? 'text-indigo-700 bg-indigo-50 font-extrabold scale-[1.02]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <ChartIcon className="w-4 h-4 mb-0.5 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[9.5px] uppercase tracking-wider font-semibold truncate w-full text-center block">{t('graphs')}</span>
                </button>

                <button
                  onClick={() => setSelectedIndex(2)}
                  className={`cursor-pointer flex flex-col items-center justify-center flex-1 min-w-0 p-1 rounded-lg transition-all focus:outline-none relative ${
                    selectedIndex === 2 
                      ? 'text-indigo-700 bg-indigo-50 font-extrabold scale-[1.02]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Bell className="w-4 h-4 mb-0.5 flex-shrink-0" />
                  {alarms.filter(a => a.isActive).length > 0 && (
                    <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse border border-white" />
                  )}
                  <span className="text-[8px] sm:text-[9.5px] uppercase tracking-wider font-semibold truncate w-full text-center block">{t('alarm')}</span>
                </button>

                <button
                  onClick={() => setSelectedIndex(3)}
                  className={`cursor-pointer flex flex-col items-center justify-center flex-1 min-w-0 p-1 rounded-lg transition-all focus:outline-none ${
                    selectedIndex === 3 
                      ? 'text-indigo-700 bg-indigo-50 font-extrabold scale-[1.02]' 
                      : 'text-gray-450 hover:text-gray-600'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 mb-0.5 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[9.5px] uppercase tracking-wider font-semibold truncate w-full text-center block">{t('prediction')}</span>
                </button>

                <button
                  onClick={() => setSelectedIndex(4)}
                  className={`cursor-pointer flex flex-col items-center justify-center flex-1 min-w-0 p-1 rounded-lg transition-all focus:outline-none ${
                    selectedIndex === 4 
                      ? 'text-indigo-700 bg-indigo-50 font-extrabold scale-[1.02]' 
                      : 'text-gray-405 hover:text-gray-600'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4 mb-0.5 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[9.5px] uppercase tracking-wider font-semibold truncate w-full text-center block">{t('settings')}</span>
                </button>

                <button
                  onClick={() => setSelectedIndex(5)}
                  className={`cursor-pointer flex flex-col items-center justify-center flex-1 min-w-0 p-1 rounded-lg transition-all focus:outline-none ${
                    selectedIndex === 5 
                      ? 'text-indigo-700 bg-indigo-50 font-extrabold scale-[1.02]' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-0.5 flex-shrink-0" />
                  <span className="text-[8px] sm:text-[9.5px] uppercase tracking-wider font-semibold truncate w-full text-center block">{t('pay')}</span>
                </button>

              </footer>
            </>
          )}

          {/* iPhone Home Indicator bar at very bottom edge (Only visible in desktop simulator mode to keep preview clean) */}
          <div className="hidden sm:flex bg-white pb-1.5 pt-0.5 justify-center z-40">
            <div className="w-28 h-1 bg-gray-300 rounded-full" />
          </div>

        </div>
      </div>

    </div>
  );
}
