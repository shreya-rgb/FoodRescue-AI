import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import Loader from '../components/common/Loader';

function AnimatedNumber({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (value === undefined || value === null) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const duration = 1500;
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(parseFloat((eased * value).toFixed(decimals)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

const PIE_COLORS = ['#10B981', '#3B82F6', '#EF4444'];

const BADGES_DATA = [
  { name: 'First Save', icon: '🌱', category: 'impact', criteria: { type: 'meals_rescued', threshold: 1 } },
  { name: 'Meal Hero', icon: '🦸', category: 'rescue', criteria: { type: 'meals_rescued', threshold: 10 } },
  { name: 'Food Guardian', icon: '🛡️', category: 'rescue', criteria: { type: 'meals_rescued', threshold: 50 } },
  { name: 'Planet Saver', icon: '🌍', category: 'impact', criteria: { type: 'co2_saved', threshold: 100 } },
  { name: 'Week Warrior', icon: '🔥', category: 'streak', criteria: { type: 'streak_days', threshold: 7 } },
  { name: 'Month Master', icon: '👑', category: 'streak', criteria: { type: 'streak_days', threshold: 30 } },
  { name: 'Generous Soul', icon: '💚', category: 'donation', criteria: { type: 'donations_count', threshold: 20 } },
  { name: 'Community Star', icon: '⭐', category: 'community', criteria: { type: 'unique_ngos_helped', threshold: 5 } },
  { name: 'Zero Waste Chef', icon: '👨‍🍳', category: 'impact', criteria: { type: 'recipes_used', threshold: 50 } },
  { name: 'Scanner Pro', icon: '📸', category: 'impact', criteria: { type: 'items_scanned', threshold: 100 } },
];

export default function Impact() {
  const [impact, setImpact] = useState(null);
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    fetchImpact();
    fetchBadges();
  }, [timeframe]);

  const fetchImpact = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/impact/me?timeframe=${timeframe}`);
      setImpact(data.impact);
    } catch {} finally { setLoading(false); }
  };

  const fetchBadges = async () => {
    try {
      const { data } = await api.get('/users/me/badges');
      setEarnedBadges(data.earned?.map((b) => b.name) || []);
    } catch {}
  };

  const pieData = impact ? [
    { name: 'Donated', value: impact.categoryBreakdown?.donated || 0 },
    { name: 'Consumed', value: impact.categoryBreakdown?.consumed || 0 },
    { name: 'Wasted', value: impact.categoryBreakdown?.wasted || 0 },
  ] : [];

  if (loading) return <Loader text="Loading your impact..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🌍 Your Impact</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            You've rescued <strong style={{ color: 'var(--primary)' }}>{impact?.totalMealsRescued || 0} meals</strong> from waste!
          </p>
        </div>
        <div className="tabs" style={{ width: 'auto' }}>
          {['week', 'month', 'year', 'alltime'].map((t) => (
            <button key={t} className={`tab ${timeframe === t ? 'active' : ''}`} onClick={() => setTimeframe(t)}>
              {t === 'alltime' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Impact cards */}
      <div className="grid-4">
        {[
          { icon: '🍽️', label: 'Meals Rescued', value: impact?.totalMealsRescued, color: 'var(--primary)' },
          { icon: '🌿', label: 'CO₂ Prevented', value: impact?.totalCO2Saved, unit: 'kg', color: '#34D399', decimals: 1 },
          { icon: '💧', label: 'Water Saved', value: impact?.totalWaterSaved, unit: 'L', color: '#3B82F6' },
          { icon: '💰', label: 'Money Saved', value: impact?.totalMoneySaved, unit: '₹', color: 'var(--secondary)', decimals: 0 },
        ].map((item) => (
          <motion.div key={item.label} className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-display)' }}>
              {item.unit === '₹' && item.unit}<AnimatedNumber value={item.value || 0} decimals={item.decimals || 0} />{item.unit && item.unit !== '₹' && ` ${item.unit}`}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Food Saved Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={impact?.timeline || []}>
              <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="foodSaved" stroke="var(--primary)" strokeWidth={2} dot={false} name="kg saved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Food Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Environmental equivalents */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🌱 Your Impact Equals...</h3>
        <div className="grid-3">
          {[
            { icon: '🌳', label: 'Trees planted', value: Math.round((impact?.totalCO2Saved || 0) / 21) },
            { icon: '🚗', label: 'Car trips avoided', value: Math.round((impact?.totalCO2Saved || 0) / 2.3) },
            { icon: '🚿', label: 'Showers of water', value: Math.round((impact?.totalWaterSaved || 0) / 60) },
          ].map((eq) => (
            <div key={eq.label} style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{eq.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{eq.value}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{eq.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🏆 Achievement Badges</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          {BADGES_DATA.map((badge) => {
            const earned = earnedBadges.includes(badge.name);
            return (
              <motion.div
                key={badge.name}
                whileHover={{ scale: 1.05 }}
                style={{
                  textAlign: 'center', padding: '1rem',
                  background: earned ? 'rgba(16,185,129,0.1)' : 'var(--bg-dark)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${earned ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                  opacity: earned ? 1 : 0.5,
                  filter: earned ? 'none' : 'grayscale(1)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{badge.name}</div>
                {earned && <div style={{ fontSize: '0.6875rem', color: 'var(--primary)', marginTop: '0.25rem' }}>Earned ✓</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
