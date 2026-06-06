import React, { useState } from 'react';
import { 
  CreditCard, 
  User, 
  Calendar as CalendarIcon, 
  Lock, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';
import { MeterState, MeterSettings } from '../types';
import { useTranslation } from '../utils/translations';

interface PayTabProps {
  state: MeterState;
  settings: MeterSettings;
  onPaymentSuccess?: (paidAmount: number) => void;
}

export default function PayTab({ state, settings, onPaymentSuccess }: PayTabProps) {
  const { t } = useTranslation(settings.language || 'en');

  // Form Fields State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // UI Flow State
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<'idle' | 'auth' | 'otp' | 'success'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [tempReceiptId, setTempReceiptId] = useState('');

  // Dynamically estimate amount to be paid matching mockup and current calculations
  // Mockup amount is ₹2343. If live cost is empty, fall back to 2343.
  const billingAmount = Math.round(state.monthlyEstimatedCost > 0 ? state.monthlyEstimatedCost : 2343);

  // Expiry Month/Year Formatting (e.g. 12/29)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  // Card Number Formatting (inserts spaces every 4 characters)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Group by 4 digits
    const matches = value.match(/\d{1,4}/g);
    if (matches) {
      setCardNumber(matches.join(' '));
    } else {
      setCardNumber('');
    }
  };

  // CVV limit to 3 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  // Mock Card validation
  const triggerPaymentAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.length < 15) {
      alert("කරුණාකර නිවැරදි කාඩ්පත් අංකයක් ඇතුළත් කරන්න (Please enter valid Card Number)");
      return;
    }
    if (!cardHolder.trim()) {
      alert("කරුණාකර කාඩ්පත් හිමියාගේ නම ඇතුළත් කරන්න (Please enter Cardholder Name)");
      return;
    }
    if (!expiry || expiry.length < 5) {
      alert("කරුණාකර නිවැරදි කල් ඉකුත්වීමේ දිනය ඇතුළත් කරන්න (Please enter expiry date MM/YY)");
      return;
    }
    if (cvv.length < 3) {
      alert("කරුණාකර නිවැරදි CVV අංකය ඇතුළත් කරන්න (Please enter 3-digit CVV)");
      return;
    }

    setIsProcessing(true);
    setPaymentPhase('auth');
    
    // Play synthetic beep effect
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (_) {}

    // Transition to simulated SMS OTP request in 1.8 seconds
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentPhase('otp');
    }, 1800);
  };

  // Submit simulated OTP
  const verifyOtpAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setOtpError("කරුණාකර ලැබුණු ඉලක්කම් 4 කේතය ඇතුළත් කරන්න (Please enter 4-digit code)");
      return;
    }

    setIsProcessing(true);
    setOtpError('');

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentPhase('success');
      const randomReceipt = `SL-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      setTempReceiptId(randomReceipt);

      // Play success chime sounds
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.25);
        osc2.start(audioCtx.currentTime + 0.1);
        osc2.stop(audioCtx.currentTime + 0.35);
      } catch (_) {}

      if (onPaymentSuccess) {
        onPaymentSuccess(billingAmount);
      }
    }, 1500);
  };

  // Close success pane and return to form
  const resetPaymentState = () => {
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    setOtpCode('');
    setOtpError('');
    setPaymentPhase('idle');
  };

  // Current calendar dates for payment metadata
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 pb-8 transition-all duration-300">
      
      {/* Dynamic Shell Adjustments & Title Block */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white tracking-tight">Pay Bill</h2>
        <p className="text-sm font-medium text-slate-400">Monthly electricity bill</p>
      </div>

      {paymentPhase === 'success' ? (
        /* SUCCESS RECEIPT ANIMATED PANEL */
        <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-3xl text-center space-y-6 shadow-xl animate-fade-in relative overflow-hidden">
          {/* Subtle green ambient light */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-full mx-auto animate-bounce mt-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-xl font-extrabold text-white">ප්‍රතිලාභය සාර්ථකයි!</h3>
            <p className="text-xs text-slate-400">Payment Processed Successfully</p>
          </div>

          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt ID:</span>
              <span className="text-indigo-400 font-bold">{tempReceiptId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid For:</span>
              <span className="text-white font-semibold">{currentMonthName} {currentYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {t('lkr_symbol')}{billingAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold text-[10px]">VERIFIED</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => alert('PDF Receipt Downloading...')}
              className="cursor-pointer w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-black tracking-wide uppercase transition hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
            >
              Download PDF
            </button>
            <button 
              onClick={resetPaymentState}
              className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-xs font-black tracking-wide uppercase transition hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
            >
              Go Back
            </button>
          </div>
        </div>
      ) : paymentPhase === 'otp' ? (
        /* SMS / OTP SECURITY PANEL */
        <form onSubmit={verifyOtpAndProceed} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl animate-fade-in relative">
          <div className="text-center space-y-2">
            <div className="bg-indigo-500/10 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-indigo-500/20">
              <Lock className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">OTP සත්‍යාපනය (SMS Code Verification)</h3>
            <p className="text-[11px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
              We have simulated a 4-digit security code sent to your registered phone number for connection validation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase block text-center">
              Enter Verification Code
            </label>
            <input 
              type="text"
              placeholder="0000"
              maxLength={4}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="text-center tracking-[1em] text-xl font-bold font-mono placeholder-slate-700 w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 text-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              autoFocus
            />
            {otpError && (
              <p className="text-[10px] text-rose-400 font-semibold text-center mt-1">{otpError}</p>
            )}
          </div>

          <div className="space-y-3">
            <button 
              type="submit"
              disabled={isProcessing}
              className="cursor-pointer w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-black text-xs text-white py-3.5 rounded-2xl tracking-wide uppercase transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-1.5 focus:outline-none"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify and Pay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => setPaymentPhase('idle')}
              className="w-full text-[11px] text-slate-500 hover:text-slate-400 text-center font-bold focus:outline-none"
            >
              Cancel Payment
            </button>
          </div>
        </form>
      ) : (
        /* STANDARD IDLE PAYMENT GATE FORM WITH CREDIT CARD SIMULATOR */
        <div className="space-y-6">
          
          {/* Main static summary box: Amount Due block */}
          <div className="bg-[#121626] border border-[#212745] p-5 rounded-3xl flex items-center justify-between relative overflow-hidden shadow-md">
            {/* Ambient indicator */}
            <div className="absolute right-0 bottom-0 top-0 w-24 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <span className="text-[11px] text-slate-400/80 font-bold uppercase tracking-wider block">Amount Due</span>
              <span className="text-3xl font-extrabold text-indigo-300 font-mono tracking-tight block">
                {t('lkr_symbol')}{billingAmount.toLocaleString()}
              </span>
            </div>

            {/* Simulated Month indicator Pill */}
            <div className="bg-indigo-950/80 border border-indigo-900/40 py-2 px-3.5 rounded-2xl flex items-center space-x-1.5 z-10 shadow-inner">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse fill-amber-400" />
              <span className="text-[11px] text-indigo-200 font-black tracking-wide uppercase">
                {currentMonthName} {currentYear}
              </span>
            </div>
          </div>

          {/* REALTIME INTERACTIVE CREDIT CARD VISUALIZER */}
          {/* Scales down dynamically relative to container width using aspect-ratio so it is perfectly responsive */}
          <div className="w-full aspect-[1.586/1] max-w-[340px] mx-auto bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 rounded-2xl p-5 text-white flex flex-col justify-between shadow-xl shadow-blue-950/30 border border-blue-500/30 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
            {/* Ambient laser glow streak */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
            
            {/* Chip & Network Symbol */}
            <div className="flex items-center justify-between">
              {/* Chip Visualizer */}
              <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-100/30 relative flex items-center justify-center overflow-hidden shadow-inner">
                {/* Chip metallic grids */}
                <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-slate-900/10" />
                <div className="absolute top-0 bottom-0 right-1/3 w-0.5 bg-slate-900/10" />
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-900/10" />
                <div className="w-5 h-4 border border-slate-905/10 rounded-2xs bg-transparent" />
              </div>

              {/* Dynamic Wi-Fi contactless symbol */}
              <div className="opacity-75 flex flex-col items-center">
                <svg className="w-5 h-5 text-indigo-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12a1 1 0 0 0 2 0 8 8 0 0 1 16 0 1 1 0 0 0 2 0A10 10 0 0 0 12 2zm0 4a6 6 0 0 0-6 6 1 1 0 0 0 2 0 4 4 0 0 1 8 0 1 1 0 0 0 2 0 6 6 0 0 0-6-6zm0 4a2 2 0 0 0-2 2 1 1 0 0 0 2 0v-.01c0-.1.08-.19.18-.19H12a1 1 0 0 0 0-1.8z" />
                </svg>
              </div>
            </div>

            {/* Printed Card Number block */}
            <div className="my-3 text-center">
              <span className="font-mono text-lg font-black tracking-widest text-[#FFFFFF] drop-shadow-sm select-all">
                {cardNumber || '••••  ••••  ••••  ••••'}
              </span>
            </div>

            {/* Bottom details block */}
            <div className="flex items-end justify-between font-sans">
              <div className="space-y-0.5 max-w-[180px]">
                <span className="text-[7.5px] font-black tracking-widest text-blue-200 uppercase block truncate leading-none">Card Holder</span>
                <span className="text-xs font-black uppercase text-white tracking-wide block truncate leading-none drop-shadow-sm">
                  {cardHolder.trim() || 'YOUR NAME'}
                </span>
              </div>
              
              <div className="space-y-0.5 text-right">
                <span className="text-[7.5px] font-black tracking-widest text-blue-200 uppercase block leading-none">Expires</span>
                <span className="text-xs font-semibold font-mono text-white tracking-widest block leading-none drop-shadow-sm">
                  {expiry || 'MM/YY'}
                </span>
              </div>

              <div className="text-right pl-3">
                <span className="italic font-black text-lg tracking-wide text-white drop-shadow">VISA</span>
              </div>
            </div>
          </div>

          {/* DATA INPUT CARD FORM FIELDS */}
          <form onSubmit={triggerPaymentAuth} className="space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-2">Card Details</h3>

            {/* Card Number input wrapper */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-1 flex items-center relative transition-colors focus-within:border-indigo-500">
              <div className="h-11 w-11 flex items-center justify-center text-slate-500 bg-slate-950/30 rounded-xl mr-2">
                <CreditCard className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Card Number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="w-full bg-transparent text-xs font-black font-mono text-white placeholder-slate-600 focus:outline-none pr-3 py-2.5"
                required
              />
            </div>

            {/* Cardholder Name input wrapper */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-1 flex items-center relative transition-colors focus-within:border-indigo-500">
              <div className="h-11 w-11 flex items-center justify-center text-slate-500 bg-slate-950/30 rounded-xl mr-2">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Cardholder Name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                maxLength={32}
                className="w-full bg-transparent text-xs font-bold text-white placeholder-slate-600 focus:outline-none pr-3 py-2.5"
                required
              />
            </div>

            {/* Expiry Date and CVV double row */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Expiry Input */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-1 flex items-center relative transition-colors focus-within:border-indigo-500">
                <div className="h-11 w-11 flex items-center justify-center text-slate-500 bg-slate-950/30 rounded-xl mr-2">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={handleExpiryChange}
                  className="w-full bg-transparent text-xs font-bold font-mono text-white placeholder-slate-600 focus:outline-none pr-2 py-2.5"
                  required
                />
              </div>

              {/* CVV Input */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-1 flex items-center relative transition-colors focus-within:border-indigo-500">
                <div className="h-11 w-11 flex items-center justify-center text-slate-500 bg-slate-950/30 rounded-xl mr-2">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  placeholder="CVV"
                  maxLength={3}
                  value={cvv}
                  onChange={handleCvvChange}
                  className="w-full bg-transparent text-xs font-bold font-mono text-white placeholder-slate-600 focus:outline-none pr-2 py-2.5"
                  required
                />
              </div>

            </div>

            {/* Glowing Payment Submission Trigger */}
            <button
              type="submit"
              disabled={isProcessing}
              className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 active:scale-[0.98] mt-2.5 text-xs text-white tracking-widest uppercase font-black py-4 rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center space-x-2 transition focus:outline-none"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>PAY NOW ({t('lkr_symbol')}{billingAmount.toLocaleString()})</span>
                </>
              )}
            </button>
            
          </form>

          {/* Secure gateway seal */}
          <div className="flex items-center justify-center space-x-1 px-4 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>🛡️ SSL Secured Multi-Channel Core Encrypted Gateway</span>
          </div>

        </div>
      )}
    </div>
  );
}
