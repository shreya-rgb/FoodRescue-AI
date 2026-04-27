import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-dark)', padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: 480 }}
      >
        <div style={{ fontSize: '6rem', marginBottom: '1.5rem' }}>🍽️</div>
        <h1 style={{
          fontSize: '6rem', fontWeight: 900, fontFamily: 'var(--font-display)',
          background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1, marginBottom: '1rem',
        }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Looks like this page went to waste. Let's get you back to saving food.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            🏠 Go to Dashboard
          </Link>
          <Link to="/" className="btn btn-secondary btn-lg">
            🌱 Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
