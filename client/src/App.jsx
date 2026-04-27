import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';

// Layout
import Sidebar from './components/common/Sidebar';
import NotificationBell from './components/notifications/NotificationBell';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyInventory from './pages/MyInventory';
import AddFood from './pages/AddFood';
import Recipes from './pages/Recipes';
import SurplusMarketplace from './pages/SurplusMarketplace';
import FoodMapPage from './pages/FoodMapPage';
import MyListings from './pages/MyListings';
import PickupRoute from './pages/PickupRoute';
import Impact from './pages/Impact';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

import useUIStore from './store/uiStore';
import { MdMenu } from 'react-icons/md';

// Protected route wrapper
function ProtectedRoute({ roles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Dashboard layout with sidebar
function DashboardLayout() {
  const { toggleSidebar } = useUIStore();
  useSocket(); // init socket connection

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          marginBottom: '1.5rem', gap: '0.75rem',
        }}>
          <button
            className="btn-ghost"
            onClick={toggleSidebar}
            style={{ display: 'none' }}
            id="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            <MdMenu size={24} />
          </button>
          <div style={{ flex: 1 }} />
          <NotificationBell />
        </div>
        <Outlet />
      </div>
      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<MyInventory />} />
          <Route path="/add-food" element={<AddFood />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/marketplace" element={<SurplusMarketplace />} />
          <Route path="/map" element={<FoodMapPage />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/pickup-route" element={<PickupRoute />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
