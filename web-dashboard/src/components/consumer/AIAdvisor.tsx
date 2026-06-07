import React from 'react';
import { Lightbulb, ThermometerSun, Leaf, ArrowRight, Zap } from 'lucide-react';

export const AIAdvisor: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">AI Energy Advisor</h1>
          <p className="text-secondary">Powered by Gemini AI - Personalized insights for your home</p>
        </div>
        <div className="flex items-center gap-4 card py-3 px-6 rounded-full border-accent-primary/30 shadow-glow">
          <div className="text-right">
            <p className="text-xs text-secondary font-semibold uppercase tracking-wider">Efficiency Score</p>
            <p className="text-2xl font-bold text-success">85/100</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-success flex items-center justify-center">
             <Leaf size={20} className="text-success" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 card bg-gradient-to-br from-tertiary to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h3 className="flex items-center gap-2 mb-4 text-accent-primary">
            <Lightbulb size={24} /> AI Analysis for October
          </h3>
          <div className="prose prose-invert max-w-none text-secondary">
            <p className="mb-4">
              Your energy consumption is tracking <strong>12% higher</strong> than last month. The main contributor appears to be cooling during the afternoon hours (12 PM - 4 PM).
            </p>
            <p className="mb-4">
              Based on local weather forecasts predicting cooler days next week, you can reduce AC usage. Simply raising your thermostat by 2 degrees can save you approximately <strong>Rs. 2,500</strong> this billing cycle.
            </p>
            <p>
              Your baseline load (power used when you're sleeping) is excellent at just 0.2kW.
            </p>
          </div>
        </div>

        <div className="col-span-1 card">
          <h3 className="mb-4">Budget Tracker</h3>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-secondary">Used: Rs. 15,400</span>
            <span className="font-semibold text-warning">Budget: Rs. 20,000</span>
          </div>
          <div className="w-full bg-tertiary h-3 rounded-full overflow-hidden mb-4">
             <div className="bg-warning h-full rounded-full" style={{ width: '77%' }}></div>
          </div>
          <p className="text-sm text-secondary">You have Rs. 4,600 remaining for the next 12 days. You need to reduce daily usage to stay on budget.</p>
        </div>
      </div>

      <h3 className="mb-4">Actionable Recommendations</h3>
      <div className="grid gap-4">
        {[
          { icon: ThermometerSun, title: 'Optimize AC Usage', desc: 'Set AC to 26°C instead of 24°C during peak hours (6 PM - 10 PM).', savings: 'Rs. 1,200/mo', color: 'text-warning', bg: 'bg-warning/10' },
          { icon: Zap, title: 'Shift Heavy Loads', desc: 'Run washing machine during off-peak hours (after 10:30 PM).', savings: 'Rs. 800/mo', color: 'text-info', bg: 'bg-info/10' },
          { icon: Leaf, title: 'Vampire Drain', desc: 'Unplug the entertainment system in the living room when not in use.', savings: 'Rs. 450/mo', color: 'text-success', bg: 'bg-success/10' },
        ].map((rec, i) => (
          <div key={i} className="card hover:border-accent-primary/50 transition-colors cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${rec.bg} ${rec.color}`}>
                <rec.icon size={24} />
              </div>
              <div>
                <h4 className="font-semibold">{rec.title}</h4>
                <p className="text-sm text-secondary">{rec.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-secondary">Est. Savings</p>
                <p className="font-semibold text-success">{rec.savings}</p>
              </div>
              <ArrowRight size={20} className="text-tertiary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
