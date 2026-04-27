import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { MdMyLocation, MdFilterList } from 'react-icons/md';
import api from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { Spinner } from '../components/common/Loader';

// Custom markers
const createIcon = (color) => L.divIcon({
  html: `<div style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  className: '',
});

const greenIcon = createIcon('#10B981');
const blueIcon = createIcon('#3B82F6');

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 13); }, [center]);
  return null;
}

export default function FoodMapPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(15);
  const { location, getLocation, loading: geoLoading } = useGeolocation();
  const defaultCenter = [19.076, 72.877]; // Mumbai default

  useEffect(() => {
    fetchListings();
  }, [location, radius]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { radius };
      if (location) { params.lat = location.lat; params.lng = location.lng; }
      const { data } = await api.get('/listings/nearby', { params: location ? params : { lat: defaultCenter[0], lng: defaultCenter[1], radius } });
      setListings(data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const mapCenter = location ? [location.lat, location.lng] : defaultCenter;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 4rem)' }}>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🗺️ Food Map</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <MdFilterList size={18} />
            Radius: {radius}km
            <input type="range" min={1} max={50} value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} style={{ accentColor: 'var(--primary)', width: 100 }} />
          </label>
          <button className="btn btn-secondary" onClick={getLocation} disabled={geoLoading}>
            {geoLoading ? <Spinner size={16} /> : <MdMyLocation size={18} />}
            {location ? 'Located' : 'Use My Location'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Map */}
        <div style={{ flex: 1, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <RecenterMap center={location ? [location.lat, location.lng] : null} />
            {listings.map((listing) => (
              <Marker
                key={listing._id}
                position={[listing.pickupLocation.coordinates[1], listing.pickupLocation.coordinates[0]]}
                icon={greenIcon}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <strong>{listing.title}</strong>
                    <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>🍽️ {listing.estimatedServings} servings</p>
                    <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>📍 {listing.distance?.toFixed(1)} km away</p>
                    <p style={{ margin: '4px 0', fontSize: '0.8125rem' }}>👤 {listing.donor?.name}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar list */}
        <div style={{ width: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{listings.length} listings nearby</span>
            {loading && <Spinner size={16} />}
          </div>
          {listings.map((listing) => (
            <motion.div
              key={listing._id}
              className="card"
              style={{ padding: '0.875rem', cursor: 'pointer' }}
              whileHover={{ y: -2 }}
            >
              {listing.images?.[0] && (
                <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }} />
              )}
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{listing.title}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                🍽️ {listing.estimatedServings} servings · 📍 {listing.distance?.toFixed(1)}km
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>by {listing.donor?.name}</p>
            </motion.div>
          ))}
          {listings.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
              <p>No food available in this area</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
