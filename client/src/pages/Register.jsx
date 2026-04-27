import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Spinner } from '../components/common/Loader';

const ROLES = [
  { value: 'household', label: '🏠 Household', desc: 'Track home food & donate surplus' },
  { value: 'restaurant', label: '🍴 Restaurant', desc: 'List daily surplus food' },
  { value: 'ngo', label: '🤝 NGO / Food Bank', desc: 'Collect and distribute food' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'household', restaurantName: '', orgName: '' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const result = await register(form);
    if (result.success) {
      toast.success('Account created! Welcome to FoodRescue AI 🌱');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: 480 }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌱</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)', fontSize: '1.125rem' }}>FoodRescue AI</span>
          </Link>

          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Start saving food and making an impact</p>

          {/* Role selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p className="form-label" style={{ marginBottom: '0.75rem' }}>I am a...</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ROLES.map((role) => (
                <label
                  key={role.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    border: `1px solid ${form.role === role.value ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.role === role.value ? 'rgba(16,185,129,0.08)' : 'transparent',
                    transition: 'var(--transition)',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={form.role === role.value}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{role.label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{role.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>

            {form.role === 'restaurant' && (
              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input type="text" className="form-input" placeholder="Your restaurant name" value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} />
              </div>
            )}
            {form.role === 'ngo' && (
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input type="text" className="form-input" placeholder="Your NGO / food bank name" value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
              {isLoading ? <Spinner size={18} color="white" /> : '🌱 Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div style={{
        flex: 1, display: 'none', background: 'linear-gradient(135deg, #059669, #10B981)',
        alignItems: 'center', justifyContent: 'center', padding: '3rem',
      }} className="auth-illustration">
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🍽️</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '1rem' }}>Join the movement</h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: 360 }}>
            1,520 people are already saving food and feeding communities with FoodRescue AI
          </p>
        </div>
      </div>

      <style>{`@media (min-width: 768px) { .auth-illustration { display: flex !important; } }`}</style>
    </div>
  );
}
