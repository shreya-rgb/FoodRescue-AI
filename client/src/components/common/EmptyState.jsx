import React from 'react';

export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-secondary)', maxWidth: 360, marginBottom: '1.5rem' }}>{description}</p>
      )}
      {action}
    </div>
  );
}
