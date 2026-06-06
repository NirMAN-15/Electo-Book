import React from 'react';
import { StatCard } from '../shared/StatCard';
import { Users, Cpu, DollarSign, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockRevenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 7000 },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="mb-6">Admin Overview</h1>
      
      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Users" value="1,248" icon={Users} trend={12} />
        <StatCard title="Active Meters" value="1,102" icon={Cpu} trend={8} color="success" />
        <StatCard title="Monthly Revenue" value="$42,500" icon={DollarSign} trend={-2} color="warning" />
        <StatCard title="Active Alarms" value="14" icon={AlertCircle} trend={5} color="danger" trendLabel="vs yesterday" />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-title mb-4">Revenue Trends</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'var(--accent-primary)' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', paddingBottom: 'var(--space-3)', borderBottom: i !== 5 ? '1px solid var(--border-color-light)' : 'none' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: i % 2 === 0 ? 'var(--warning)' : 'var(--success)', marginTop: '6px' }} />
                <div>
                  <p className="text-sm">{i % 2 === 0 ? 'High voltage alert on Meter M-102' : 'New payment received ($120)'}</p>
                  <p className="text-xs text-tertiary">{i} hour{i > 1 ? 's' : ''} ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
