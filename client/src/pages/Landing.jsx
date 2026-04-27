import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'kg Food Saved', value: 12500, icon: '🌿' },
  { label: 'Meals Rescued', value: 33000, icon: '🍽️' },
  { label: 'kg CO₂ Prevented', value: 31250, icon: '🌍' },
  { label: 'Active Users', value: 1520, icon: '👥' },
];

const FEATURES = [
  { icon: '📸', title: 'AI Food Scanner', desc: 'Snap a photo of your fridge — AI identifies every item instantly' },
  { icon: '🤖', title: 'Smart Recipes', desc: 'Get personalized recipes using your expiring ingredients' },
  { icon: '🛒', title: 'Surplus Marketplace', desc: 'List or claim surplus food from your community' },
  { icon: '🗺️', title: 'Live Food Map', desc: 'See available food near you on an interactive map' },
  { icon: '📊', title: 'Impact Tracking', desc: 'Visualize your environmental impact with beautiful charts' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Compete with your community and earn achievement badges' },
];

const ROLES = [
  { icon: '🏠', title: 'Households', color: 'var(--primary)', benefits: ['Track food inventory', 'Get AI recipe ideas', 'Donate surplus food', 'Earn impact badges'] },
  { icon: '🍴', title: 'Restaurants', color: 'var(--secondary)', benefits: ['List daily surplus', 'AI demand forecasts', 'Reduce food costs', 'Build community trust'] },
  { icon: '🤝', title: 'NGOs & Food Banks', color: 'var(--accent)', benefits: ['Find nearby donations', 'Optimized pickup routes', 'Track rescued meals', 'Coordinate volunteers'] },
];

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🌱</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>FoodRescue AI</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '6rem 0 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="badge badge-green" style={{ marginBottom: '1.5rem', display: 'inline-flex', fontSize: '0.875rem' }}>
              🌍 AI-Powered Food Waste Prevention
            </span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
              Save Food.{' '}
              <span style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Save Money.
              </span>
              <br />Save the Planet.
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
              AI-powered food waste prevention for households, restaurants, and NGOs. Scan, track, share, and make an impact.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                🚀 Get Started Free
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                See How It Works
              </a>
            </div>
          </motion.div>

          {/* Floating food emojis */}
          {['🍎', '🥦', '🥛', '🍞', '🥕', '🍋'].map((emoji, i) => (
            <motion.div
              key={i}
              style={{ position: 'absolute', fontSize: '2rem', opacity: 0.15, userSelect: 'none' }}
              animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
              initial={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ padding: '3rem 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid-4">
            {STATS.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                  <AnimatedCounter target={stat.value} />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Three simple steps to start saving food</p>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '📸', title: 'Scan Your Food', desc: 'Snap a photo of your fridge or pantry. Our AI identifies every food item and predicts expiry dates automatically.' },
              { step: '02', icon: '🔔', title: 'Get Smart Alerts', desc: 'Receive timely notifications before food expires. Get AI-generated recipe suggestions using your expiring ingredients.' },
              { step: '03', icon: '💚', title: 'Share Surplus', desc: 'List extra food on the marketplace. Nearby households, restaurants, and NGOs can claim and pick it up.' },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="card"
                whileHover={{ y: -4, boxShadow: 'var(--shadow-glow-green)' }}
                style={{ textAlign: 'center', padding: '2rem' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>STEP {item.step}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>Everything You Need</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Powerful features to eliminate food waste</p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                className="card-glass"
                whileHover={{ y: -4 }}
                style={{ padding: '1.5rem', border: '1px solid var(--border)' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>Built for Everyone</h2>
          </div>
          <div className="grid-3">
            {ROLES.map((role) => (
              <motion.div
                key={role.title}
                className="card"
                whileHover={{ y: -4 }}
                style={{ borderTop: `3px solid ${role.color}` }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{role.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: role.color }}>{role.title}</h3>
                <ul style={{ listStyle: 'none' }}>
                  {role.benefits.map((b) => (
                    <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: role.color }}>✓</span> {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, rgba(5,150,105,0.2), rgba(16,185,129,0.1))', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Start Saving Food Today</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            Join 1,500+ users already making a difference
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            🌱 Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🌱</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>FoodRescue AI</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            © 2026 FoodRescue AI. Fighting food waste, one meal at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
