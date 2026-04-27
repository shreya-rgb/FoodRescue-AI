import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdFavorite, MdEdit, MdDelete } from 'react-icons/md';
import { getDaysUntilExpiry, getExpiryLabel, getExpiryClass, getExpiryBorderClass, CATEGORY_ICONS, CATEGORY_COLORS, formatDate } from '../../utils/helpers';
import useFoodStore from '../../store/foodStore';
import toast from 'react-hot-toast';

export default function FoodCard({ food, onEdit }) {
  const { updateFoodStatus, deleteFood } = useFoodStore();
  const [loading, setLoading] = useState(false);

  const handleStatus = async (status) => {
    setLoading(true);
    try {
      await updateFoodStatus(food._id, status);
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove this food item?')) return;
    try {
      await deleteFood(food._id);
      toast.success('Food item removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const days = getDaysUntilExpiry(food.expiryDate);
  const expiryClass = getExpiryClass(food.expiryDate);
  const borderClass = getExpiryBorderClass(food.expiryDate);
  const catColor = CATEGORY_COLORS[food.category] || '#94A3B8';
  const catIcon = CATEGORY_ICONS[food.category] || '📦';

  return (
    <motion.div
      className={`card ${borderClass}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      {/* Image / Icon */}
      <div style={{
        height: 100, borderRadius: 'var(--radius-sm)', overflow: 'hidden',
        background: `${catColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {food.image ? (
          <img src={food.image} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '2.5rem' }}>{catIcon}</span>
        )}
        <span className="badge" style={{
          position: 'absolute', top: 8, right: 8,
          background: `${catColor}25`, color: catColor, fontSize: '0.6875rem',
        }}>
          {food.category}
        </span>
      </div>

      {/* Info */}
      <div>
        <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{food.name}</h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {food.quantity} {food.unit} · {food.storageType}
        </p>
      </div>

      {/* Expiry */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`${expiryClass}`} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
          {getExpiryLabel(food.expiryDate)}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {formatDate(food.expiryDate)}
        </span>
      </div>

      {/* Actions */}
      {food.status === 'fresh' || food.status === 'expiring_soon' ? (
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-sm btn-primary"
            style={{ flex: 1, fontSize: '0.75rem' }}
            onClick={() => handleStatus('consumed')}
            disabled={loading}
          >
            <MdCheckCircle size={14} /> Used
          </button>
          <button
            className="btn btn-sm"
            style={{ flex: 1, fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', border: '1px solid rgba(16,185,129,0.3)' }}
            onClick={() => handleStatus('donated')}
            disabled={loading}
          >
            <MdFavorite size={14} /> Donate
          </button>
          <button className="btn btn-sm btn-ghost" onClick={onEdit} aria-label="Edit">
            <MdEdit size={14} />
          </button>
          <button className="btn btn-sm btn-ghost" onClick={handleDelete} style={{ color: 'var(--danger)' }} aria-label="Delete">
            <MdDelete size={14} />
          </button>
        </div>
      ) : (
        <span className={`badge ${food.status === 'consumed' ? 'badge-green' : food.status === 'donated' ? 'badge-purple' : food.status === 'expired' ? 'badge-red' : 'badge-gray'}`}>
          {food.status}
        </span>
      )}
    </motion.div>
  );
}
