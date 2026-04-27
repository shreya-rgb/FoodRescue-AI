import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MdAdd, MdCameraAlt, MdArrowForward } from 'react-icons/md';
import useAuthStore from '../store/authStore';
import useFoodStore from '../store/foodStore';
import StatCard from '../components/common/StatCard';
import { getExpiryLabel, getExpiryClass, CATEGORY_ICONS, formatDate } from '../utils/helpers';
import api from '../services/api';

function HouseholdDashboard({ user }) {
  const { foods, expiringItems, stats, fetchFoods, fetchExpiring, fetchStats } = useFoodStore();
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [quickRecipe, setQuickRecipe] = React.useState(null);

  useEffect(() => {
    fetchFoods({ limit: 6 });
    fetchExpiring(5);
    fetchStats();
  }, []);

  const chartData = [
    { day: 'Mon', saved: 2, wasted: 0 },
    { day: 'Tue', saved: 3, wasted: 1 },
    { day: 'Wed', saved: 1, wasted: 0 },
    { day: 'Thu', saved: 4, wasted: 0 },
    { day: 'Fri', saved: 2, wasted: 1 },
    { day: 'Sat', saved: 5, wasted: 0 },
    { day: 'Sun', saved: 3, wasted: 0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stat cards */}
      <div className="grid-4">
        <StatCard icon="📦" label="Total Items" value={stats?.totalItems ?? 0} color="var(--accent)" />
        <StatCard icon="⚠️" label="Expiring Soon" value={stats?.expiringToday ?? 0} color="var(--secondary)" />
        <StatCard icon="🌿" label="Saved This Month" value={user?.totalFoodSaved?.toFixed(1) ?? 0} unit="kg" color="var(--primary)" />
        <StatCard icon="⭐" label="Impact Points" value={user?.points ?? 0} color="#8B5CF6" />
      </div>

      <div className="grid-2">
        {/* Expiring soon */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>⚠️ Expiring Soon</h3>
            <Link to="/inventory" style={{ fontSize: '0.8125rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <MdArrowForward size={14} />
            </Link>
          </div>
          {expiringItems.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>No items expiring soon 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {expiringItems.slice(0, 5).map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{CATEGORY_ICONS[item.category] || '📦'}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.quantity} {item.unit}</p>
                    </div>
                  </div>
                  <span className={`${getExpiryClass(item.expiryDate)}`} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {getExpiryLabel(item.expiryDate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📊 Weekly Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="saved" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Saved" />
              <Bar dataKey="wasted" fill="var(--danger)" radius={[4, 4, 0, 0]} name="Wasted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/add-food" className="btn btn-primary"><MdCameraAlt size={18} /> Scan Food</Link>
          <Link to="/add-food" className="btn btn-secondary"><MdAdd size={18} /> Add Manually</Link>
          <Link to="/recipes" className="btn btn-secondary">🤖 Get Recipes</Link>
          <Link to="/marketplace" className="btn btn-secondary">🛒 Marketplace</Link>
        </div>
      </div>
    </div>
  );
}

function RestaurantDashboard({ user }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="grid-4">
        <StatCard icon="📋" label="Active Listings" value={0} color="var(--primary)" />
        <StatCard icon="🍽️" label="Total Donated" value={user?.totalMealsRescued ?? 0} unit="meals" color="var(--secondary)" />
        <StatCard icon="🌿" label="Food Saved" value={user?.totalFoodSaved?.toFixed(1) ?? 0} unit="kg" color="var(--primary)" />
        <StatCard icon="⭐" label="Points" value={user?.points ?? 0} color="#8B5CF6" />
      </div>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🍴 Restaurant Dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>List your surplus food and help feed the community.</p>
        <Link to="/marketplace" className="btn btn-primary">Create Listing</Link>
      </div>
    </div>
  );
}

function NGODashboard({ user }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="grid-4">
        <StatCard icon="📍" label="Available Nearby" value={0} color="var(--primary)" />
        <StatCard icon="🚗" label="Pending Pickups" value={0} color="var(--secondary)" />
        <StatCard icon="🍽️" label="Meals Rescued" value={user?.totalMealsRescued ?? 0} color="var(--primary)" />
        <StatCard icon="⭐" label="Points" value={user?.points ?? 0} color="#8B5CF6" />
      </div>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🤝 NGO Dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Find available food donations and plan optimized pickup routes.</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/map" className="btn btn-primary">View Food Map</Link>
          <Link to="/pickup-route" className="btn btn-secondary">Plan Route</Link>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {user?.role === 'household' && <HouseholdDashboard user={user} />}
      {user?.role === 'restaurant' && <RestaurantDashboard user={user} />}
      {user?.role === 'ngo' && <NGODashboard user={user} />}
      {user?.role === 'admin' && (
        <div className="card">
          <h2>Admin Dashboard</h2>
          <Link to="/admin" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Admin Panel</Link>
        </div>
      )}
    </div>
  );
}
