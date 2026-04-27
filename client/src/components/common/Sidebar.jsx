import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdInventory, MdAddBox, MdRestaurantMenu,
  MdStorefront, MdMap, MdListAlt, MdLocalShipping,
  MdBarChart, MdEmojiEvents, MdPerson, MdAdminPanelSettings,
  MdLogout, MdClose,
} from 'react-icons/md';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'Dashboard', roles: ['household', 'restaurant', 'ngo', 'admin'] },
  { to: '/inventory', icon: MdInventory, label: 'My Inventory', roles: ['household'] },
  { to: '/add-food', icon: MdAddBox, label: 'Add Food', roles: ['household'] },
  { to: '/recipes', icon: MdRestaurantMenu, label: 'Recipes', roles: ['household'] },
  { to: '/marketplace', icon: MdStorefront, label: 'Marketplace', roles: ['household', 'restaurant', 'ngo'] },
  { to: '/map', icon: MdMap, label: 'Food Map', roles: ['household', 'restaurant', 'ngo'] },
  { to: '/my-listings', icon: MdListAlt, label: 'My Listings', roles: ['household', 'restaurant'] },
  { to: '/pickup-route', icon: MdLocalShipping, label: 'Pickup Route', roles: ['ngo'] },
  { to: '/impact', icon: MdBarChart, label: 'Impact', roles: ['household', 'restaurant', 'ngo'] },
  { to: '/leaderboard', icon: MdEmojiEvents, label: 'Leaderboard', roles: ['household', 'restaurant', 'ngo'] },
  { to: '/profile', icon: MdPerson, label: 'Profile', roles: ['household', 'restaurant', 'ngo', 'admin'] },
  { to: '/admin', icon: MdAdminPanelSettings, label: 'Admin Panel', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, closeSidebar } = useUIStore();
  const navigate = useNavigate();

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="modal-overlay"
            style={{ zIndex: 99 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🌱</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)' }}>
              FoodRescue
            </span>
          </div>
          <button className="btn-ghost" onClick={closeSidebar} style={{ display: 'none' }} aria-label="Close sidebar">
            <MdClose size={20} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700, overflow: 'hidden', flexShrink: 0,
              }}>
                {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'var(--transition)',
                textDecoration: 'none',
              })}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            className="btn btn-secondary w-full"
            style={{ justifyContent: 'flex-start', gap: '0.75rem' }}
          >
            <MdLogout size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
