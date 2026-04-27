import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdFilterList, MdLocationOn, MdAccessTime, MdPeople, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/helpers';

const FOOD_TYPES = ['all', 'cooked', 'raw', 'packaged', 'mixed'];

function ListingCard({ listing, onClaim }) {
  const distKm = listing.distance ? listing.distance.toFixed(1) : null;
  const pickupStart = listing.pickupTimeStart ? new Date(listing.pickupTimeStart) : null;
  const pickupEnd = listing.pickupTimeEnd ? new Date(listing.pickupTimeEnd) : null;

  const formatTime = (d) => d?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
    >
      {/* Image */}
      <div style={{ height: 140, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-dark)', position: 'relative' }}>
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
            {listing.foodType === 'cooked' ? '🍲' : listing.foodType === 'raw' ? '🥦' : listing.foodType === 'packaged' ? '📦' : '🍱'}
          </div>
        )}
        <span className="badge badge-green" style={{ position: 'absolute', top: 8, left: 8, fontSize: '0.6875rem' }}>
          {listing.foodType}
        </span>
        {listing.dietaryInfo?.isVegetarian && (
          <span className="badge" style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(16,185,129,0.9)', color: 'white', fontSize: '0.6875rem' }}>🌱 Veg</span>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.375rem' }}>{listing.title}</h3>
        {listing.description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {listing.description}
          </p>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <MdPeople size={15} /> {listing.estimatedServings} servings
          {distKm && <><span style={{ margin: '0 0.25rem' }}>·</span><MdLocationOn size={15} /> {distKm} km away</>}
        </div>
        {pickupStart && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <MdAccessTime size={15} /> {formatTime(pickupStart)} – {formatTime(pickupEnd)}
          </div>
        )}
      </div>

      {/* Donor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
          {listing.donor?.avatar ? <img src={listing.donor.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : listing.donor?.name?.[0]?.toUpperCase()}
        </div>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1 }}>{listing.donor?.name}</span>
        <button className="btn btn-sm btn-primary" onClick={() => onClaim(listing)}>
          Claim
        </button>
      </div>
    </motion.div>
  );
}

function CreateListingModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', foodType: 'cooked', totalWeight: '', estimatedServings: '',
    pickupAddress: '', pickupTimeStart: '', pickupTimeEnd: '', pickupInstructions: '',
    isVegetarian: false, isVegan: false, isHalal: false,
  });
  const [loading, setLoading] = useState(false);
  const { location, getLocation } = useGeolocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.foodType || !form.pickupTimeStart || !form.pickupTimeEnd) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        foodType: form.foodType,
        totalWeight: parseFloat(form.totalWeight) || 0,
        estimatedServings: parseInt(form.estimatedServings) || 0,
        pickupTimeStart: form.pickupTimeStart,
        pickupTimeEnd: form.pickupTimeEnd,
        pickupInstructions: form.pickupInstructions,
        pickupAddress: JSON.stringify({ street: form.pickupAddress }),
        pickupLocation: JSON.stringify({
          type: 'Point',
          coordinates: location ? [location.lng, location.lat] : [72.877, 19.076],
        }),
        dietaryInfo: JSON.stringify({ isVegetarian: form.isVegetarian, isVegan: form.isVegan, isHalal: form.isHalal }),
        items: JSON.stringify([]),
      };
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
      await api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing created! Nearby users have been notified.');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Food Listing">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" placeholder="e.g. Leftover biryani for 10 people" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={2} placeholder="What's included, any special notes..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Food Type *</label>
            <select className="form-select" value={form.foodType} onChange={(e) => setForm({ ...form, foodType: e.target.value })}>
              {['cooked', 'raw', 'packaged', 'mixed'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Servings</label>
            <input type="number" className="form-input" min="1" placeholder="10" value={form.estimatedServings} onChange={(e) => setForm({ ...form, estimatedServings: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Total Weight (kg)</label>
            <input type="number" className="form-input" min="0" step="0.1" placeholder="2.5" value={form.totalWeight} onChange={(e) => setForm({ ...form, totalWeight: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Pickup Address</label>
            <input className="form-input" placeholder="Street address" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Pickup From *</label>
            <input type="datetime-local" className="form-input" value={form.pickupTimeStart} onChange={(e) => setForm({ ...form, pickupTimeStart: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Pickup Until *</label>
            <input type="datetime-local" className="form-input" value={form.pickupTimeEnd} onChange={(e) => setForm({ ...form, pickupTimeEnd: e.target.value })} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Pickup Instructions</label>
          <input className="form-input" placeholder="Ring doorbell, ask for John..." value={form.pickupInstructions} onChange={(e) => setForm({ ...form, pickupInstructions: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[['isVegetarian', '🌱 Vegetarian'], ['isVegan', '🌿 Vegan'], ['isHalal', '☪️ Halal']].map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9375rem' }}>
              <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
              {label}
            </label>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={getLocation} style={{ alignSelf: 'flex-start' }}>
          <MdLocationOn size={16} /> {location ? '✓ Location captured' : 'Use My Location'}
        </button>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : '🍱 Create Listing'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ClaimModal({ listing, isOpen, onClose, onClaimed }) {
  const [message, setMessage] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      await api.post('/claims', { listingId: listing._id, message, estimatedPickupTime: pickupTime || undefined });
      toast.success('Claim submitted! The donor will be notified.');
      onClaimed();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Claim: ${listing?.title}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Send a message to the donor to coordinate pickup.
        </p>
        <div className="form-group">
          <label className="form-label">Message to Donor</label>
          <textarea className="form-input" rows={3} placeholder="Hi! I'd like to pick up this food. I can come by..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Estimated Pickup Time</label>
          <input type="datetime-local" className="form-input" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleClaim} disabled={loading}>
            {loading ? 'Submitting...' : '✓ Confirm Claim'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function SurplusMarketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ foodType: 'all', isVegetarian: false });
  const [showCreate, setShowCreate] = useState(false);
  const [claimTarget, setClaimTarget] = useState(null);
  const { location, getLocation } = useGeolocation();

  useEffect(() => {
    fetchListings();
  }, [filters, location]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { status: 'available' };
      if (filters.foodType !== 'all') params.foodType = filters.foodType;
      if (filters.isVegetarian) params.isVegetarian = true;
      if (location) { params.lat = location.lat; params.lng = location.lng; params.sort = 'nearest'; }
      const { data } = await api.get('/listings', { params });
      setListings(data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🛒 Surplus Marketplace</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{listings.length} listings available</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={getLocation}>
            <MdLocationOn size={18} /> {location ? 'Located' : 'Near Me'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <MdAdd size={18} /> Create Listing
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <MdFilterList size={20} color="var(--text-secondary)" />
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={filters.foodType} onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}>
            {FOOD_TYPES.map((t) => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9375rem' }}>
            <input type="checkbox" checked={filters.isVegetarian} onChange={(e) => setFilters({ ...filters, isVegetarian: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
            Vegetarian only
          </label>
          <Link to="/map" className="btn btn-secondary btn-sm">🗺️ Map View</Link>
        </div>
      </div>

      {/* Listings grid */}
      {loading ? (
        <Loader text="Loading listings..." />
      ) : listings.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="No listings available"
          description="Be the first to list surplus food in your area"
          action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><MdAdd size={18} /> Create Listing</button>}
        />
      ) : (
        <div className="grid-3">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} onClaim={setClaimTarget} />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateListingModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchListings} />
      {claimTarget && (
        <ClaimModal listing={claimTarget} isOpen={!!claimTarget} onClose={() => setClaimTarget(null)} onClaimed={fetchListings} />
      )}
    </div>
  );
}
