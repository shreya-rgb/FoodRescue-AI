import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import {
  MdMyLocation, MdDirections, MdRefresh, MdAccessTime,
  MdStraighten, MdCheckCircle, MdRadioButtonUnchecked,
} from 'react-icons/md';
import api from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import Loader, { Spinner } from '../components/common/Loader';
import StatCard from '../components/common/StatCard';

// Map icons
const createIcon = (color, label) => L.divIcon({
  html: `<div style="
    width:32px;height:32px;background:${color};border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
  ">
    <span style="transform:rotate(45deg);color:white;font-size:11px;font-weight:700;">${label}</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: '',
});

const startIcon = L.divIcon({
  html: `<div style="
    width:36px;height:36px;background:#3B82F6;border-radius:50%;
    border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;font-size:16px;
  ">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: '',
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
    }
  }, [points]);
  return null;
}

export default function PickupRoute() {
  const [listings, setListings] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [routeResult, setRouteResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [loadingListings, setLoadingListings] = useState(true);
  const [completedStops, setCompletedStops] = useState([]);
  const { location, getLocation, loading: geoLoading } = useGeolocation();

  const defaultStart = { lat: 19.076, lng: 72.877 }; // Mumbai fallback
  const startPoint = location || defaultStart;

  useEffect(() => {
    fetchNearbyListings();
  }, [location]);

  const fetchNearbyListings = async () => {
    setLoadingListings(true);
    try {
      const params = {
        lat: startPoint.lat,
        lng: startPoint.lng,
        radius: 25,
        limit: 30,
      };
      const { data } = await api.get('/listings/nearby', { params });
      setListings(data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(listings.map((l) => l._id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setRouteResult(null);
    setCompletedStops([]);
  };

  const optimizeRoute = async () => {
    if (selectedIds.length === 0) return;
    setOptimizing(true);
    try {
      const pickups = listings
        .filter((l) => selectedIds.includes(l._id))
        .map((l) => ({
          id: l._id,
          lat: l.pickupLocation.coordinates[1],
          lng: l.pickupLocation.coordinates[0],
          title: l.title,
          donor: l.donor?.name,
          servings: l.estimatedServings,
        }));

      const { data } = await api.post('/claims/optimize-route', {
        start: startPoint,
        pickups,
      });

      // Enrich route_points with listing data
      const enriched = (data.route_points || []).map((pt) => {
        if (pt.type === 'start') return pt;
        const listing = listings.find((l) => l._id === pt.id);
        return { ...pt, listing };
      });

      setRouteResult({ ...data, route_points: enriched });
      setCompletedStops([]);
    } catch (err) {
      console.error('Route optimization failed', err);
    } finally {
      setOptimizing(false);
    }
  };

  const toggleComplete = (id) => {
    setCompletedStops((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Build polyline path from route points
  const polylinePath = routeResult?.route_points?.map((p) => [p.lat, p.lng]) || [];

  // All map points for fitting bounds
  const allMapPoints = routeResult
    ? routeResult.route_points
    : [startPoint, ...listings.map((l) => ({
        lat: l.pickupLocation.coordinates[1],
        lng: l.pickupLocation.coordinates[0],
      }))];

  const stopsDone = completedStops.length;
  const stopsTotal = routeResult
    ? routeResult.route_points.filter((p) => p.type === 'pickup').length
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🚗 Pickup Route Planner</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Select food listings and get an AI-optimized pickup route
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={getLocation} disabled={geoLoading}>
            {geoLoading ? <Spinner size={16} /> : <MdMyLocation size={18} />}
            {location ? 'Located' : 'Use My Location'}
          </button>
          <button className="btn btn-secondary" onClick={fetchNearbyListings} disabled={loadingListings}>
            <MdRefresh size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats row (shown after optimization) */}
      {routeResult && (
        <motion.div
          className="grid-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatCard icon="📍" label="Total Stops" value={stopsTotal} color="var(--primary)" />
          <StatCard icon={<MdStraighten size={20} />} label="Total Distance" value={routeResult.total_distance_km} unit="km" color="var(--secondary)" />
          <StatCard icon={<MdAccessTime size={20} />} label="Est. Time" value={routeResult.estimated_time_minutes} unit="min" color="#8B5CF6" />
          <StatCard icon="✅" label="Completed" value={`${stopsDone}/${stopsTotal}`} color="var(--primary)" />
        </motion.div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Left panel — listing selection */}
        <div style={{
          width: 300, display: 'flex', flexDirection: 'column', gap: '0.75rem',
          overflowY: 'auto', flexShrink: 0,
        }}>
          {/* Controls */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem' }}
              onClick={selectAll}
              disabled={loadingListings}
            >
              Select All
            </button>
            <button
              className="btn btn-ghost"
              style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem' }}
              onClick={clearSelection}
            >
              Clear
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={optimizeRoute}
            disabled={selectedIds.length === 0 || optimizing}
            style={{ width: '100%' }}
          >
            {optimizing ? <Spinner size={16} /> : <MdDirections size={18} />}
            {optimizing ? 'Optimizing...' : `Optimize Route (${selectedIds.length})`}
          </button>

          {/* Listing cards */}
          {loadingListings ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <Spinner size={24} />
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Loading nearby listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <p style={{ fontSize: '0.875rem' }}>No listings nearby</p>
            </div>
          ) : (
            listings.map((listing) => {
              const isSelected = selectedIds.includes(listing._id);
              return (
                <motion.div
                  key={listing._id}
                  className="card"
                  whileHover={{ y: -2 }}
                  onClick={() => toggleSelect(listing._id)}
                  style={{
                    padding: '0.875rem',
                    cursor: 'pointer',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(16,185,129,0.06)' : 'var(--bg-card)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <span style={{ color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {listing.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        🍽️ {listing.estimatedServings} servings · 📍 {listing.distance?.toFixed(1)}km
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                        by {listing.donor?.name}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right panel — map + route steps */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          {/* Map */}
          <div style={{ flex: 1, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', minHeight: 300 }}>
            <MapContainer
              center={[startPoint.lat, startPoint.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              <FitBounds points={allMapPoints} />

              {/* Start marker */}
              <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
                <Popup>
                  <strong>📍 Your Start Location</strong>
                </Popup>
              </Marker>

              {/* Optimized route */}
              {routeResult ? (
                <>
                  {polylinePath.length > 1 && (
                    <Polyline
                      positions={polylinePath}
                      pathOptions={{ color: '#10B981', weight: 3, dashArray: '8 4', opacity: 0.85 }}
                    />
                  )}
                  {routeResult.route_points
                    .filter((p) => p.type === 'pickup')
                    .map((pt, idx) => {
                      const done = completedStops.includes(pt.id);
                      return (
                        <Marker
                          key={pt.id}
                          position={[pt.lat, pt.lng]}
                          icon={createIcon(done ? '#6B7280' : '#10B981', idx + 1)}
                        >
                          <Popup>
                            <div style={{ minWidth: 160 }}>
                              <strong>Stop {idx + 1}</strong>
                              {pt.listing && (
                                <>
                                  <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>{pt.listing.title}</p>
                                  <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>🍽️ {pt.listing.estimatedServings} servings</p>
                                  <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>👤 {pt.listing.donor?.name}</p>
                                </>
                              )}
                              <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>⏰ ETA: {pt.eta}</p>
                              <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>📏 {pt.distance_from_prev} km from prev</p>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                </>
              ) : (
                // Show unoptimized listings on map
                listings
                  .filter((l) => selectedIds.includes(l._id))
                  .map((listing, idx) => (
                    <Marker
                      key={listing._id}
                      position={[
                        listing.pickupLocation.coordinates[1],
                        listing.pickupLocation.coordinates[0],
                      ]}
                      icon={createIcon('#3B82F6', idx + 1)}
                    >
                      <Popup>
                        <div style={{ minWidth: 160 }}>
                          <strong>{listing.title}</strong>
                          <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>🍽️ {listing.estimatedServings} servings</p>
                          <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>👤 {listing.donor?.name}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))
              )}
            </MapContainer>
          </div>

          {/* Route steps */}
          {routeResult && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ maxHeight: 220, overflowY: 'auto' }}
            >
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                🗺️ Route Steps
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Start */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(59,130,246,0.08)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '1.25rem' }}>📍</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Start — Your Location</p>
                  </div>
                </div>

                {routeResult.route_points
                  .filter((p) => p.type === 'pickup')
                  .map((pt, idx) => {
                    const done = completedStops.includes(pt.id);
                    return (
                      <motion.div
                        key={pt.id}
                        whileHover={{ x: 2 }}
                        onClick={() => toggleComplete(pt.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                          background: done ? 'rgba(107,114,128,0.08)' : 'rgba(16,185,129,0.06)',
                          cursor: 'pointer', transition: 'all 0.15s',
                          opacity: done ? 0.6 : 1,
                        }}
                      >
                        {done
                          ? <MdCheckCircle size={20} color="var(--primary)" />
                          : <MdRadioButtonUnchecked size={20} color="var(--text-secondary)" />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', textDecoration: done ? 'line-through' : 'none' }}>
                            Stop {idx + 1} — {pt.listing?.title || 'Pickup'}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            ⏰ ETA {pt.eta} · 📏 {pt.distance_from_prev} km
                          </p>
                        </div>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem',
                          borderRadius: 999, background: 'var(--bg-dark)', color: 'var(--text-secondary)',
                        }}>
                          {idx + 1}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
