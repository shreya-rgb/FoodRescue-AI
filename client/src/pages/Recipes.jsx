import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import RecipeCard from '../components/recipe/RecipeCard';
import EmptyState from '../components/common/EmptyState';
import { Spinner } from '../components/common/Loader';

export default function Recipes() {
  const [mode, setMode] = useState('inventory');
  const [customIngredients, setCustomIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [preferences, setPreferences] = useState({ is_vegetarian: false, is_vegan: false, max_cook_time: null, cuisine: 'any' });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');

  const addIngredient = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setCustomIngredients((prev) => [...new Set([...prev, inputValue.trim().toLowerCase()])]);
      setInputValue('');
    }
  };

  const removeIngredient = (ing) => setCustomIngredients((prev) => prev.filter((i) => i !== ing));

  const generateRecipes = async () => {
    setLoading(true);
    try {
      let result;
      if (mode === 'inventory') {
        result = await api.post('/recipes/from-inventory', { preferences, servings: 2 });
      } else {
        if (customIngredients.length === 0) { toast.error('Add at least one ingredient'); setLoading(false); return; }
        result = await api.post('/recipes/suggest', { ingredients: customIngredients, preferences, servings: 2 });
      }
      setRecipes(result.data.recipes || []);
      if (result.data.recipes?.length === 0) toast('No recipes found. Try different ingredients.', { icon: '🤔' });
    } catch {
      toast.error('Failed to generate recipes. Check AI service.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    try {
      const { data } = await api.get('/recipes/saved');
      setSavedRecipes(data.recipes);
    } catch {}
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>🤖 AI Recipe Suggestions</h1>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>Generate Recipes</button>
        <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => { setActiveTab('saved'); fetchSaved(); }}>Saved Recipes</button>
      </div>

      {activeTab === 'generate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Config card */}
          <div className="card">
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                className={`btn ${mode === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('inventory')}
              >
                🥦 From My Expiring Items
              </button>
              <button
                className={`btn ${mode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('custom')}
              >
                ✏️ Custom Ingredients
              </button>
            </div>

            {/* Custom ingredients */}
            {mode === 'custom' && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Add Ingredients (press Enter)</label>
                <input
                  className="form-input"
                  placeholder="e.g. tomato, cheese, onion..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={addIngredient}
                />
                {customIngredients.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {customIngredients.map((ing) => (
                      <span key={ing} className="badge badge-green" style={{ cursor: 'pointer' }} onClick={() => removeIngredient(ing)}>
                        {ing} ✕
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preferences */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9375rem' }}>
                <input type="checkbox" checked={preferences.is_vegetarian} onChange={(e) => setPreferences({ ...preferences, is_vegetarian: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
                Vegetarian
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9375rem' }}>
                <input type="checkbox" checked={preferences.is_vegan} onChange={(e) => setPreferences({ ...preferences, is_vegan: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
                Vegan
              </label>
              <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={preferences.cuisine} onChange={(e) => setPreferences({ ...preferences, cuisine: e.target.value })}>
                {['any', 'indian', 'italian', 'chinese', 'mexican', 'mediterranean'].map((c) => <option key={c} value={c}>{c === 'any' ? 'Any Cuisine' : c}</option>)}
              </select>
              <select className="form-select" style={{ width: 'auto', minWidth: 160 }} value={preferences.max_cook_time || ''} onChange={(e) => setPreferences({ ...preferences, max_cook_time: e.target.value ? parseInt(e.target.value) : null })}>
                <option value="">Any Cook Time</option>
                <option value="15">Under 15 min</option>
                <option value="30">Under 30 min</option>
                <option value="60">Under 1 hour</option>
              </select>
            </div>

            <button className="btn btn-primary btn-lg" onClick={generateRecipes} disabled={loading}>
              {loading ? <><Spinner size={18} color="white" /> Generating...</> : '🤖 Generate Recipes'}
            </button>
          </div>

          {/* Results */}
          {recipes.length > 0 && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Generated Recipes ({recipes.length})</h2>
              <div className="grid-2">
                {recipes.map((recipe, i) => (
                  <RecipeCard key={i} recipe={recipe} />
                ))}
              </div>
            </div>
          )}

          {!loading && recipes.length === 0 && (
            <EmptyState
              icon="🍳"
              title="No recipes yet"
              description="Click 'Generate Recipes' to get AI-powered recipe suggestions from your ingredients"
            />
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {savedRecipes.length === 0 ? (
            <EmptyState icon="🔖" title="No saved recipes" description="Save recipes you like while generating" />
          ) : (
            <div className="grid-2">
              {savedRecipes.map((recipe) => <RecipeCard key={recipe._id} recipe={recipe} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
