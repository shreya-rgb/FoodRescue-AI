import React from 'react';

export function Spinner({ size = 20, color = 'var(--primary)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(255,255,255,0.15)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

export default function Loader({ text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '1rem', padding: '3rem',
    }}>
      <Spinner size={40} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
        <Spinner size={36} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading FoodRescue AI...</p>
      </div>
    </div>
  );
}
