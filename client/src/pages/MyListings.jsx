import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdCancel, MdAccessTime, MdStar } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/helpers';

const STATUS_COLORS = {
  available: 'var(--primary)',
  claimed: 'var(--secondary)',
  completed: '#3B82F6',
  expired: 'var(--text-muted)',
  cancelled: 'var(--danger)',
};

const STATUS_BADGES = {
  available: 'badge-green',
  claimed: 'badge-amber',
  completed: 'badge-blue',
  expired: 'badge-gray',
  cancelled: 'badge-red',
};

function ClaimCard({ claim, onAccept, onReject, onComplete }) {
  return (
    <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>
            {claim.claimer?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{claim.claimer?.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(claim.createdAt)}</p>
          </div>
        </div>
        <span className={`badge ${STATUS_BADGES[claim.status] || 'badge-gray'}`}>{claim.status}</span>
      </div>
      {claim.message && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>"{claim.message}"</p>}
      {claim.estimatedPickupTime && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
          <MdAccessTime size={14} /> Pickup: {formatDate(claim.estimatedPickupTime)}
        </p>
      )}
      {claim.status === 'pending' && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => onAccept(claim._id)}>
            <MdCheckCircle size={14} /> Accept
          </button>
          <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={() => onReject(claim._id)}>
            <MdCancel size={14} /> Reject
          </button>
        </div>
      )}
      {claim.status === 'accepted' && (
        <button className="btn btn-sm btn-primary w-full" onClick={() => onComplete(claim._id)}>
          ✓ Mark as Completed
        </button>
      )}
    </div>
  );
}

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchListings();
    fetchClaims();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/listings/my');
      setListings(data.listings || []);
    } catch {} finally { setLoading(false); }
  };

  const fetchClaims = async () => {
    try {
      const { data } = await api.get('/claims/my?type=received');
      setClaims(data.claims || []);
    } catch {}
  };

  const handleAccept = async (claimId) => {
    try {
      await api.put(`/claims/${claimId}/accept`);
      toast.success('Claim accepted! The claimer has been notified.');
      fetchClaims();
    } catch { toast.error('Failed to accept claim'); }
  };

  const handleReject = async (claimId) => {
    try {
      await api.put(`/claims/${claimId}/reject`, { reason: 'Sorry, unable to fulfill this request.' });
      toast.success('Claim rejected.');
      fetchClaims();
      fetchListings();
    } catch { toast.error('Failed to reject claim'); }
  };

  const handleComplete = (claimId) => setRatingModal(claimId);

  const submitComplete = async () => {
    try {
      const { data } = await api.put(`/claims/${ratingModal}/complete`, { rating });
      toast.success(`Pickup completed! 🎉 ${data.impact?.mealsSaved || 0} meals rescued.`);
      setRatingModal(null);
      fetchClaims();
      fetchListings();
    } catch { toast.error('Failed to complete claim'); }
  };

  const filteredListings = statusFilter === 'all' ? listings : listings.filter((l) => l.status === statusFilter);
  const pendingClaims = claims.filter((c) => c.status === 'pending');
  const allClaims = claims;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Listings</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {listings.length} total · {listings.filter((l) => l.status === 'available').length} active
          {pendingClaims.length > 0 && <span className="badge badge-amber" style={{ marginLeft: '0.75rem' }}>{pendingClaims.length} pending claims</span>}
        </p>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
          My Listings ({listings.length})
        </button>
        <button className={`tab ${activeTab === 'claims' ? 'active' : ''}`} onClick={() => setActiveTab('claims')}>
          Claim Requests {pendingClaims.length > 0 && <span className="badge badge-amber" style={{ marginLeft: '0.25rem', padding: '0.125rem 0.375rem' }}>{pendingClaims.length}</span>}
        </button>
      </div>

      {activeTab === 'listings' && (
        <>
          {/* Status filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['all', 'available', 'claimed', 'completed', 'expired', 'cancelled'].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {loading ? <Loader text="Loading listings..." /> : filteredListings.length === 0 ? (
            <EmptyState icon="📋" title="No listings yet" description="Create a listing to share surplus food with your community" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredListings.map((listing) => (
                <motion.div key={listing._id} className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {listing.images?.[0] && (
                    <img src={listing.images[0]} alt={listing.title} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{listing.title}</h3>
                      <span className={`badge ${STATUS_BADGES[listing.status] || 'badge-gray'}`}>{listing.status}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      🍽️ {listing.estimatedServings} servings · {listing.foodType} · Created {formatDate(listing.createdAt)}
                    </p>
                    {listing.pickupTimeStart && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        <MdAccessTime size={13} style={{ verticalAlign: 'middle' }} /> Pickup: {formatDate(listing.pickupTimeStart)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'claims' && (
        <div>
          {allClaims.length === 0 ? (
            <EmptyState icon="🤝" title="No claim requests yet" description="When someone claims your listing, it will appear here" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allClaims.map((claim) => (
                <div key={claim._id} className="card">
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                    For: {claim.listing?.title}
                  </p>
                  <ClaimCard claim={claim} onAccept={handleAccept} onReject={handleReject} onComplete={handleComplete} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rating modal */}
      <Modal isOpen={!!ratingModal} onClose={() => setRatingModal(null)} title="Complete Pickup">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Rate the pickup experience to complete this donation.</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: star <= rating ? 'var(--secondary)' : 'var(--border)' }}>
                <MdStar />
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitComplete}>✓ Complete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
