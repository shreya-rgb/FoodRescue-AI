import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, unit = '', color = 'var(--primary)', trend }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color, opacity: 0.08, filter: 'blur(20px)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
            {label}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>
              {value ?? '—'}
            </span>
            {unit && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{unit}</span>}
          </div>
          {trend && (
            <p style={{ fontSize: '0.75rem', color: trend > 0 ? 'var(--primary)' : 'var(--danger)', marginTop: '0.25rem' }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
            </p>
          )}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-sm)',
          background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.375rem', flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
