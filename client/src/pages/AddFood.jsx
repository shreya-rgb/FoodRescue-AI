import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCloudUpload, MdCheckCircle, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';
import useFoodStore from '../store/foodStore';
import { Spinner } from '../components/common/Loader';

const CATEGORIES = ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'beverages', 'snacks', 'condiments', 'frozen', 'bakery', 'canned', 'other'];
const UNITS = ['kg', 'g', 'L', 'ml', 'pieces', 'packs', 'dozen'];
const STORAGE = ['fridge', 'freezer', 'pantry', 'counter'];

function ManualForm() {
  const { addFood } = useFoodStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: 'vegetables', quantity: 1, unit: 'pieces',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '', storageType: 'fridge', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.expiryDate) { toast.error('Expiry date is required'); return; }
    setLoading(true);
    try {
      await addFood(form);
      toast.success(`${form.name} added to inventory!`);
      if (addAnother) {
        setForm({ ...form, name: '', quantity: 1, notes: '' });
      } else {
        navigate('/inventory');
      }
    } catch {
      toast.error('Failed to add food item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Food Name *</label>
          <input className="form-input" placeholder="e.g. Tomatoes" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Storage *</label>
          <select className="form-select" value={form.storageType} onChange={(e) => setForm({ ...form, storageType: e.target.value })}>
            {STORAGE.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantity *</label>
          <input type="number" className="form-input" min="0" step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="form-select" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Purchase Date</label>
          <input type="date" className="form-input" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Expiry Date *</label>
          <input type="date" className="form-input" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Notes</label>
          <input className="form-input" placeholder="Optional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9375rem' }}>
        <input type="checkbox" checked={addAnother} onChange={(e) => setAddAnother(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
        Add another item after saving
      </label>

      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
        {loading ? <Spinner size={18} color="white" /> : '✓ Save to Inventory'}
      </button>
    </form>
  );
}

function ScanTab() {
  const { scanFood, bulkAddFood } = useFoodStore();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);
  const [saving, setSaving] = useState(false);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setScanning(true);
    try {
      const result = await scanFood(file);
      setDetectedItems(result.detectedItems || []);
      if (result.detectedItems?.length === 0) toast('No food items detected. Try a clearer photo.', { icon: '📸' });
    } catch {
      toast.error('Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  }, [scanFood]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const updateItem = (i, field, value) => {
    setDetectedItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const removeItem = (i) => setDetectedItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleAddAll = async () => {
    setSaving(true);
    try {
      const items = detectedItems.map((item) => ({
        name: item.name,
        category: item.category || 'other',
        quantity: 1,
        unit: 'pieces',
        expiryDate: item.suggestedExpiry,
        storageType: item.storageType || 'fridge',
        confidenceScore: item.confidence,
      }));
      await bulkAddFood(items);
      toast.success(`${items.length} items added to inventory!`);
      navigate('/inventory');
    } catch {
      toast.error('Failed to add items');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Upload area */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '3rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'rgba(16,185,129,0.05)' : 'var(--bg-dark)',
          transition: 'var(--transition)',
        }}
      >
        <input {...getInputProps()} />
        {imagePreview ? (
          <img src={imagePreview} alt="Uploaded" style={{ maxHeight: 200, borderRadius: 'var(--radius-sm)', margin: '0 auto' }} />
        ) : (
          <>
            <MdCloudUpload size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Drop a photo of your fridge or pantry</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>or click to browse · JPG, PNG, WebP</p>
          </>
        )}
      </div>

      {/* Scanning overlay */}
      {scanning && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner size={36} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>🤖 AI is analyzing your food...</p>
        </div>
      )}

      {/* Detected items */}
      {detectedItems.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>Detected Items ({detectedItems.length})</h3>
            <button className="btn btn-primary" onClick={handleAddAll} disabled={saving}>
              {saving ? <Spinner size={16} color="white" /> : <><MdCheckCircle size={18} /> Add All to Inventory</>}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {detectedItems.map((item, i) => (
              <motion.div key={i} className="card" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <input className="form-input" value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} style={{ fontWeight: 600 }} />
                  </div>
                  <select className="form-select" style={{ width: 140 }} value={item.category} onChange={(e) => updateItem(i, 'category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="date" className="form-input" style={{ width: 160 }} value={item.suggestedExpiry ? new Date(item.suggestedExpiry).toISOString().split('T')[0] : ''} onChange={(e) => updateItem(i, 'suggestedExpiry', e.target.value)} />
                  <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>{Math.round((item.confidence || 0) * 100)}% sure</span>
                  <button className="btn-ghost" onClick={() => removeItem(i)} style={{ color: 'var(--danger)' }} aria-label="Remove item">
                    <MdDelete size={18} />
                  </button>
                </div>
                {item.storageTip && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>💡 {item.storageTip}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddFood() {
  const [activeTab, setActiveTab] = useState('scan');

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Add Food</h1>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>
          📸 Scan with AI
        </button>
        <button className={`tab ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
          ✏️ Add Manually
        </button>
      </div>

      <div className="card">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {activeTab === 'scan' ? <ScanTab /> : <ManualForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
