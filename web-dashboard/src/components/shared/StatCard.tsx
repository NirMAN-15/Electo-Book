import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel,
  color = 'primary' 
}) => {
  const getIconColor = () => {
    switch (color) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      case 'info': return 'var(--info)';
      default: return 'var(--accent-primary)';
    }
  };

  const getIconBg = () => {
    switch (color) {
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      case 'warning': return 'rgba(245, 158, 11, 0.1)';
      case 'danger': return 'rgba(239, 68, 68, 0.1)';
      case 'info': return 'rgba(59, 130, 246, 0.1)';
      default: return 'rgba(99, 102, 241, 0.1)';
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div>
          <p className="text-secondary text-sm" style={{ fontWeight: 500, marginBottom: 'var(--space-1)' }}>{title}</p>
          <h3 style={{ fontSize: '1.5rem' }}>{value}</h3>
        </div>
        <div style={{ 
          padding: '10px', 
          backgroundColor: getIconBg(), 
          color: getIconColor(),
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} />
        </div>
      </div>
      
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
            fontWeight: 500
          }}>
            {trend >= 0 ? <TrendingUp size={16} style={{ marginRight: '4px' }} /> : <TrendingDown size={16} style={{ marginRight: '4px' }} />}
            {Math.abs(trend)}%
          </span>
          <span className="text-tertiary">{trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
};
