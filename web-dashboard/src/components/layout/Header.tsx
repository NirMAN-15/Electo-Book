import React from 'react';
import { Sun, Moon, Bell, Search, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const location = useLocation();
  
  // Format path to title (e.g., /admin/dashboard -> Dashboard)
  const getTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-6)',
      position: 'sticky',
      top: 0,
      zIndex: 5
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{getTitle()}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Search */}
        <div style={{ position: 'relative', display: 'none' /* hidden on mobile typically */ }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="form-input"
            style={{ paddingLeft: '36px', borderRadius: 'var(--radius-full)', width: '200px', backgroundColor: 'var(--bg-secondary)' }}
          />
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost" onClick={() => alert('New current notification: Maintenance scheduled for tonight.')} style={{ padding: '8px', borderRadius: '50%', position: 'relative' }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--danger)',
            borderRadius: '50%',
            border: '2px solid var(--bg-primary)'
          }}></span>
        </button>

        {/* Avatar */}
        <div 
          onClick={() => alert('Profile Edit: Users can update their profiles here.')}
          style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: '2px solid var(--glass-border)'
        }}>
          AD
        </div>
      </div>
    </header>
  );
};
