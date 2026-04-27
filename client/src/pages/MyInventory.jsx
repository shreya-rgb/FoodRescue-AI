import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdAdd, MdCameraAlt, MdFilterList } from 'react-icons/md';
import useFoodStore from '../store/foodStore';
import FoodCard from '../components/food/FoodCard';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';

const CATEGORIES = ['all', 'fruits', 'vegetables', 'dairy', 'meat', 'grains', 'beverages', 'snacks', 'condiments', 'frozen', 'bakery', 'canned', 'other'];
const STATUSES = ['all', 'fresh', 'expiring_soon', 'expired', 'consumed', 'donated', 'wasted'];

export default function MyInventory() {
  const { foods, total, isLoading, fetchFoods, updateFood } = useFoodStore();
  const [filters, setFilters] = useState({ category: 'all', status: 'all', sort: 'expiryDate' });
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const params = {};
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.status !== 'all') params.status = filters.status;
    params.sort = filters.sort;
    fetchFoods(params);
  }, [filters]);

  const handleEditSave = async () => {
    await updateFood(editItem._id, editForm);
    setEditItem(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Inventory</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{total} items tracked</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/add-food" className="btn btn-secondary"><MdCameraAlt size={18} /> Scan Fridge</Link>
          <Link to="/add-food" className="btn btn-primary"><MdAdd size={18} /> Add Food</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <MdFilterList size={20} color="var(--text-secondary)" />
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 140 }}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 140 }}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 140 }}
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="expiryDate">Sort: Expiry Date</option>
            <option value="name">Sort: Name</option>
            <option value="-createdAt">Sort: Recently Added</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <Loader text="Loading inventory..." />
      ) : foods.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Your inventory is empty"
          description="Scan your fridge or add food manually to start tracking"
          action={<Link to="/add-food" className="btn btn-primary"><MdCameraAlt size={18} /> Scan Fridge</Link>}
        />
      ) : (
        <div className="grid-4">
          {foods.map((food) => (
            <FoodCard key={food._id} food={food} onEdit={() => { setEditItem(food); setEditForm({ name: food.name, quantity: food.quantity, unit: food.unit, notes: food.notes }); }} />
          ))}
        </div>
      )}

      {/* Edit modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Food Item">
        {editItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input type="number" className="form-input" value={editForm.quantity || ''} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" value={editForm.unit || 'pieces'} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}>
                  {['kg', 'g', 'L', 'ml', 'pieces', 'packs', 'dozen'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
