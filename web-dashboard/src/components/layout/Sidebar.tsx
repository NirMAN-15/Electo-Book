import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  Receipt, 
  BellRing, 
  LineChart, 
  CreditCard, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Meters', path: '/admin/meters', icon: Cpu },
    { name: 'Billing', path: '/admin/billing', icon: Receipt },
    { name: 'Alerts', path: '/admin/alerts', icon: BellRing },
  ];

  const consumerLinks = [
    { name: 'Dashboard', path: '/consumer/dashboard', icon: LayoutDashboard },
    { name: 'Usage', path: '/consumer/usage', icon: LineChart },
    { name: 'Bills', path: '/consumer/bills', icon: Receipt },
    { name: 'Payment', path: '/consumer/payment', icon: CreditCard },
  ];

  const links = role === 'admin' ? adminLinks : consumerLinks;

  const handleLogout = () => {
    // Mock logout
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside 
      className="sidebar"
      style={{
        width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Logo Area */}
      <div 
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0' : '0 var(--space-6)',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--border-color-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: 'var(--radius-sm)',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Zap size={20} />
          </div>
          {!collapsed && (
            <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Electro Book
            </span>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: '-14px',
          top: '28px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          zIndex: 20
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--space-4) 0', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {links.map((link) => (
            <li key={link.path} style={{ margin: '0 var(--space-3) var(--space-1)' }}>
              <NavLink
                to={link.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  justifyContent: collapsed ? 'center' : 'flex-start'
                })}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '10%',
                        height: '80%',
                        width: '4px',
                        backgroundColor: 'var(--accent-primary)',
                        borderRadius: '0 4px 4px 0'
                      }} />
                    )}
                    <link.icon size={20} style={{ minWidth: 20 }} />
                    {!collapsed && <span style={{ marginLeft: 'var(--space-3)', fontWeight: isActive ? 600 : 500 }}>{link.name}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Area */}
      <div style={{ 
        padding: 'var(--space-4)', 
        borderTop: '1px solid var(--border-color-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}>
        <button 
          onClick={handleLogout}
          className="btn btn-ghost" 
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', padding: 'var(--space-2)' }}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
