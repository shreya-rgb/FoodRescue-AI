import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdAccessTime, MdBookmark, MdBookmarkBorder, MdExpandMore, MdExpandLess } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RecipeCard({ recipe, priorityIngredients = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await api.post('/recipes/save', recipe);
      setSaved(true);
      toast.success('Recipe saved!');
    } catch {
      toast.error('Failed to save recipe');
    }
  };

  const difficultyColor = { easy: 'var(--primary)', medium: 'var(--secondary)', hard: 'var(--danger)' };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{recipe.title}</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{recipe.description}</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-ghost"
          style={{ color: saved ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }}
          aria-label="Save recipe"
        >
          {saved ? <MdBookmark size={22} /> : <MdBookmarkBorder size={22} />}
        </button>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <MdAccessTime size={16} /> {recipe.cook_time_minutes || recipe.cookTimeMinutes} min
        </span>
        <span className="badge" style={{ background: `${difficultyColor[recipe.difficulty]}20`, color: difficultyColor[recipe.difficulty] }}>
          {recipe.difficulty}
        </span>
        {recipe.nutrition?.calories && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {recipe.nutrition.calories} kcal
          </span>
        )}
      </div>

      {/* Priority ingredients used */}
      {recipe.uses_priority?.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Uses expiring:</p>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {recipe.uses_priority.map((ing) => (
              <span key={ing} className="badge badge-green" style={{ fontSize: '0.6875rem' }}>{ing}</span>
            ))}
          </div>
        </div>
      )}

      {/* Missing ingredients */}
      {recipe.missing_ingredients?.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Need to buy:</p>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {recipe.missing_ingredients.map((ing) => (
              <span key={ing} className="badge badge-amber" style={{ fontSize: '0.6875rem' }}>{ing}</span>
            ))}
          </div>
        </div>
      )}

      {/* Expand/collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn btn-secondary btn-sm w-full"
        style={{ justifyContent: 'center' }}
      >
        {expanded ? <><MdExpandLess size={16} /> Hide Instructions</> : <><MdExpandMore size={16} /> View Recipe</>}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}
        >
          <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9375rem' }}>Ingredients</h4>
          <ul style={{ listStyle: 'none', marginBottom: '1rem' }}>
            {recipe.ingredients?.map((ing, i) => (
              <li key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '0.375rem 0', borderBottom: '1px solid var(--border)',
                fontSize: '0.875rem',
                color: ing.available === false ? 'var(--text-muted)' : 'var(--text-primary)',
              }}>
                <span>{ing.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{ing.amount}</span>
              </li>
            ))}
          </ul>

          <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9375rem' }}>Instructions</h4>
          <ol style={{ paddingLeft: '1.25rem' }}>
            {recipe.instructions?.map((step, i) => (
              <li key={i} style={{ marginBottom: '0.625rem', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {step}
              </li>
            ))}
          </ol>

          {recipe.nutrition && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
              {[
                { label: 'Calories', value: recipe.nutrition.calories, unit: 'kcal' },
                { label: 'Protein', value: recipe.nutrition.protein, unit: 'g' },
                { label: 'Carbs', value: recipe.nutrition.carbs, unit: 'g' },
                { label: 'Fat', value: recipe.nutrition.fat, unit: 'g' },
              ].map((n) => (
                <div key={n.label} style={{ background: 'var(--bg-dark)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{n.value}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{n.label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
