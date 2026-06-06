import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    if (email.includes('admin')) {
      localStorage.setItem('role', 'admin');
      localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
      navigate('/admin/dashboard');
    } else {
      localStorage.setItem('role', 'consumer');
      localStorage.setItem('user', JSON.stringify({ email, role: 'consumer' }));
      navigate('/consumer/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 20%)',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', top: '10%', right: '20%', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: '250px', height: '250px', background: 'var(--success)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }} />

      <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '440px', padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto var(--space-4)',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Zap size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }}>Electro Book</h1>
          <p className="text-secondary">Smart Energy Monitoring Platform</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <a href="#" style={{ fontSize: '0.875rem' }}>Forgot?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <input type="checkbox" id="remember" style={{ accentColor: 'var(--accent-primary)' }} />
            <label htmlFor="remember" className="text-sm text-secondary">Remember me for 30 days</label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', justifyContent: 'center' }}>
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: '0.875rem' }}>
          <p className="text-tertiary">Try <span style={{color:'var(--text-primary)'}}>admin@test.com</span> or <span style={{color:'var(--text-primary)'}}>user@test.com</span></p>
        </div>
      </div>
    </div>
  );
};
