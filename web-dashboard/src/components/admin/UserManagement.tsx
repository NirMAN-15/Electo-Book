import React, { useState } from 'react';
import { DataTable, Column } from '../shared/DataTable';
import { User } from '@/types';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'consumer', meterId: 'M-1001', status: 'active', phone: '+94 77 123 4567' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'consumer', meterId: 'M-1002', status: 'active', phone: '+94 77 987 6543' },
  { id: '3', name: 'Admin User', email: 'admin@electro.lk', role: 'admin', status: 'active' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com', role: 'consumer', meterId: 'M-1003', status: 'inactive', phone: '+94 71 555 1234' },
  { id: '5', name: 'Alice Brown', email: 'alice@example.com', role: 'consumer', meterId: 'M-1004', status: 'active', phone: '+94 72 333 9999' },
];

export const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const columns: Column<User>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', sortable: true, render: (row) => (
      <span className={`badge ${row.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>
        {row.role}
      </span>
    )},
    { key: 'meterId', header: 'Meter ID', render: (row) => row.meterId || '-' },
    { key: 'status', header: 'Status', render: (row) => (
      <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
        {row.status}
      </span>
    )},
    { key: 'actions', header: 'Actions', render: () => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn btn-ghost" style={{ padding: '4px' }}><Edit size={16} /></button>
        <button className="btn btn-ghost" style={{ padding: '4px', color: 'var(--danger)' }}><Trash2 size={16} /></button>
      </div>
    )}
  ];

  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={() => alert('Registration form for admin to add new users/admins.')}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="card mb-6" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="form-input" 
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="form-input" 
          style={{ width: '150px' }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="consumer">Consumer</option>
        </select>
      </div>

      <DataTable data={filteredUsers} columns={columns} />
    </div>
  );
};
