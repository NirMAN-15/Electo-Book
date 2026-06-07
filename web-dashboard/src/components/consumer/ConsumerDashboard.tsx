import React, { useState } from 'react';
import { StatCard } from '../shared/StatCard';
import { MeterGauge } from '../shared/MeterGauge';
import { Zap, DollarSign, Activity, Battery, AlertTriangle, Wifi } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ref, set } from 'firebase/database';
import { auth, db } from '../../firebase/config';

const mockMiniChart = [
  { time: '12am', value: 1.2 }, { time: '3am', value: 0.8 }, 
  { time: '6am', value: 1.5 }, { time: '9am', value: 3.2 },
  { time: '12pm', value: 2.8 }, { time: '3pm', value: 4.1 },
  { time: '6pm', value: 5.5 }, { time: '9pm', value: 3.8 }
];

export const ConsumerDashboard: React.FC = () => {
  const [espConnected, setEspConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connectESP32 = async () => {
    setConnecting(true);
    try {
      if (auth.currentUser) {
        await set(ref(db, `meters/${auth.currentUser.uid}/status`), 'connected');
        await set(ref(db, `meters/${auth.currentUser.uid}/live`), { voltage: 230, current: 13.9, powerFactor: 0.95 });
      }
      setEspConnected(true);
      alert('ESP32 successfully paired and registered in Firebase!');
    } catch (error) {
      console.error(error);
      alert('Failed to connect ESP32. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div>
      {!espConnected && (
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-warning" size={24} />
            <div>
              <h3 className="font-semibold text-lg">ESP32 Meter Not Connected</h3>
              <p className="text-secondary text-sm">Please connect your ESP32 Smart Meter to start tracking your live energy usage.</p>
            </div>
          </div>
          <button className="btn btn-primary" disabled={connecting} onClick={connectESP32}>
            <Wifi size={18} className="mr-2" /> {connecting ? 'Connecting...' : 'Connect ESP32'}
          </button>
        </div>
      )}
      <h1 className="mb-6">My Energy Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card flex flex-col items-center justify-center" style={{ gridColumn: 'span 1', minHeight: '350px' }}>
          <h3 className="card-title w-full mb-4">Live Power</h3>
          <MeterGauge value={3.2} max={10} label="Current Usage" unit="kW" size={240} />
          <div className="flex gap-4 mt-6">
             <div className="text-center"><p className="text-xs text-secondary">Voltage</p><p className="font-semibold">230V</p></div>
             <div className="text-center"><p className="text-xs text-secondary">Current</p><p className="font-semibold">13.9A</p></div>
          </div>
        </div>

        <div className="flex flex-col gap-6" style={{ gridColumn: 'span 2' }}>
          <div className="grid grid-cols-2 gap-6">
             <StatCard title="Units Today" value="12.4 kWh" icon={Zap} trend={-5} trendLabel="vs yesterday" />
             <StatCard title="Cost Today" value="Rs. 620" icon={DollarSign} trend={-5} color="warning" />
             <StatCard title="Monthly Est." value="Rs. 15,400" icon={Activity} trend={12} color="info" />
             <StatCard title="Power Factor" value="0.95" icon={Battery} color="success" />
          </div>
          
          <div className="card flex-1">
            <h3 className="card-title mb-4">Today's Usage Trend</h3>
            <div style={{ height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMiniChart}>
                  <defs>
                    <linearGradient id="colorValueConsumer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorValueConsumer)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
