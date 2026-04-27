import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdPeople, MdVerified, MdBlock, MdSearch, MdRefresh,
  MdDashboard, MdFilterList,
} from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import Loader, { Spinner } from '../components/common/Loader';
import { formatDate } from '../utils/helpers';

const ROLE_COLORS = {
  household: '#10B981',
  restaurant: '#3B82F6',
  ngo: '#8B5CF6',
  admin: '#EF4444',
};

const ROLE_ICONS = {
  household: '🏠',
  restaurant: '🍴',
  ngo: '🤝',
  admin: '🛡️',
};

function RoleBadge({ role }) {
  return (
    <span style={{
      fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.625rem',
      borderRadius: 999,
      background: `${ROLE_COLORS[role] || '#6B7280'}20`,
      color: ROLE_COLORS[role] || '#6B7280',
      border: `1px solid ${ROLE_COLORS[role] || '#6B7280'}40`,
    }}>
      {ROLE_ICONS[role]} {role}
    </span>
  );
}

function StatusBadge({ isActive, isVerified }) {
  if (!isActive) return (
    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.625rem', borderRadius: 999, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
      Banned
    </span>
  );
  if (isVerified) return (
    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.625rem', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
      ✓ Verified
    </span>
  );
  return (
    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.625rem', borderRadius: 999, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
      Pending
    </span>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
  }, [tab, roleFilter]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = { limit: 100 };
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleVerify = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [`verify_${userId}`]: true }));
    try {
      await api.put(`/admin/users/${userId}/verify`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isVerified: true } : u))
      );
    } catch (err) {
      console.error('Verify failed', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`verify_${userId}`]: false }));
    }
  };

  const handleBan = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    setActionLoading((prev) => ({ ...prev, [`ban_${userId}`]: true }));
    try {
      await api.put(`/admin/users/${userId}/ban`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: false } : u))
      );
    } catch (err) {
      console.error('Ban failed', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`ban_${userId}`]: false }));
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  // Prepare user growth chart data
  const growthData = stats?.userGrowth
    ? [...stats.userGrowth].reverse().slice(-14).map((d) => ({
        date: d._id?.slice(5), // MM-DD
        users: d.count,
      }))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🛡️ Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Platform management and oversight
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchStats} disabled={loadingStats}>
          <MdRefresh size={18} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ width: 'fit-content' }}>
        <button
          className={`tab ${tab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          <MdDashboard size={16} /> Overview
        </button>
        <button
          className={`tab ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          <MdPeople size={16} /> Users
        </button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'dashboard' && (
        <>
          {loadingStats ? (
            <Loader text="Loading admin stats..." />
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid-4">
                <StatCard icon="👥" label="Total Users" value={stats?.totalUsers ?? 0} color="var(--primary)" />
                <StatCard icon="📋" label="Active Listings" value={stats?.activeListings ?? 0} color="var(--secondary)" />
                <StatCard icon="✅" label="Completed Donations" value={stats?.completedDonations ?? 0} color="#10B981" />
                <StatCard icon="🍽️" label="Meals Rescued" value={stats?.totalMealsRescued ?? 0} color="#8B5CF6" />
              </div>

              <div className="grid-2">
                {/* Food saved */}
                <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🌿 Platform Impact</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { label: 'Total Food Saved', value: `${stats?.totalFoodSaved ?? 0} kg`, icon: '🌿', color: 'var(--primary)' },
                      { label: 'Total Meals Rescued', value: stats?.totalMealsRescued ?? 0, icon: '🍽️', color: '#8B5CF6' },
                      { label: 'Active Listings', value: stats?.activeListings ?? 0, icon: '📋', color: 'var(--secondary)' },
                      { label: 'Completed Donations', value: stats?.completedDonations ?? 0, icon: '✅', color: '#10B981' },
                    ].map((item) => (
                      <div key={item.label} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                          <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: item.color, fontSize: '1.125rem' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* User growth chart */}
                <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📈 User Growth (Last 14 Days)</h3>
                  {growthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={growthData}>
                        <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                          labelStyle={{ color: 'var(--text-primary)' }}
                        />
                        <Bar dataKey="users" fill="var(--primary)" radius={[4, 4, 0, 0]} name="New Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                      <p>No growth data yet</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <MdSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                className="input"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MdFilterList size={18} color="var(--text-secondary)" />
              <select
                className="input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: 'auto', minWidth: 140 }}
              >
                <option value="">All Roles</option>
                <option value="household">Household</option>
                <option value="restaurant">Restaurant</option>
                <option value="ngo">NGO</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={fetchUsers} disabled={loadingUsers}>
              <MdRefresh size={18} />
              {loadingUsers ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Summary */}
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing {filteredUsers.length} of {users.length} users
          </p>

          {/* Users table */}
          {loadingUsers ? (
            <Loader text="Loading users..." />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{
                padding: '0.875rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: '1fr 180px 120px 120px 140px',
                gap: '1rem',
                fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Points</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>

              {filteredUsers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                  <p>No users found</p>
                </div>
              ) : (
                filteredUsers.map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.015 }}
                    style={{
                      padding: '0.875rem 1.5rem',
                      borderBottom: '1px solid var(--border)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 180px 120px 120px 140px',
                      gap: '1rem',
                      alignItems: 'center',
                    }}
                  >
                    {/* User info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: ROLE_COLORS[u.role] || 'var(--bg-card-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9375rem', fontWeight: 700, overflow: 'hidden',
                      }}>
                        {u.avatar
                          ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : u.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.email}
                        </p>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          Joined {formatDate(u.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Role */}
                    <div><RoleBadge role={u.role} /></div>

                    {/* Status */}
                    <div><StatusBadge isActive={u.isActive} isVerified={u.isVerified} /></div>

                    {/* Points */}
                    <p style={{ textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }}>
                      {(u.points || 0).toLocaleString()}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {!u.isVerified && u.isActive && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}
                          onClick={() => handleVerify(u._id)}
                          disabled={actionLoading[`verify_${u._id}`]}
                          title="Verify user"
                        >
                          {actionLoading[`verify_${u._id}`]
                            ? <Spinner size={12} />
                            : <MdVerified size={14} color="#10B981" />}
                          Verify
                        </button>
                      )}
                      {u.isActive && u.role !== 'admin' && (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem', color: 'var(--danger)' }}
                          onClick={() => handleBan(u._id)}
                          disabled={actionLoading[`ban_${u._id}`]}
                          title="Ban user"
                        >
                          {actionLoading[`ban_${u._id}`]
                            ? <Spinner size={12} />
                            : <MdBlock size={14} />}
                          Ban
                        </button>
                      )}
                      {!u.isActive && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Banned
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
