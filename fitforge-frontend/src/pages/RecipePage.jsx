import React, { useState } from 'react';
import { extrasAPI } from '../api';
import toast from 'react-hot-toast';
import { ChefHat, Loader, RefreshCw, Clock, Flame, Users } from 'lucide-react';

function parseRecipesJson(raw) {
  if (!raw) return null;
  try {
    let cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw };
  }
}

const DIET_OPTIONS = [
  { value: 'VEGETARIAN', emoji: '🥦', label: 'Vegetarian' },
  { value: 'VEGAN',      emoji: '🌱', label: 'Vegan' },
  { value: 'NON_VEG',   emoji: '🍗', label: 'Non-Veg' },
  { value: 'KETO',      emoji: '🥑', label: 'Keto' },
];

export default function RecipePage() {
  const [ingredients, setIngredients] = useState('');
  const [dietType, setDietType] = useState('NON_VEG');
  const [targetCalories, setTargetCalories] = useState(400);
  const [recipes, setRecipes] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) { toast.error('Enter some ingredients!'); return; }
    setLoading(true);
    try {
      const res = await extrasAPI.generateRecipes({ ingredients, dietType, targetCalories: String(targetCalories) });
      setRecipes(parseRecipesJson(res.data.result));
      toast.success('🍳 Recipes ready!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not generate recipes. Check the backend and Gemini configuration.');
    } finally { setLoading(false); }
  };

  const recipeList = recipes
    ? (recipes.recipes || recipes.raw ? null : Object.values(recipes)[0] instanceof Array ? Object.values(recipes)[0] : null)
    : null;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">🍳 <span>Recipe Finder</span></h1>
        <p className="page-subtitle">Tell AI what ingredients you have — get delicious healthy recipes</p>
      </div>

      {/* Search Form */}
      <div className="glass-card glass-card-accent" style={{ marginBottom: 28 }}>
        <form onSubmit={handleGenerate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">What ingredients do you have?</label>
              <textarea
                className="form-input"
                placeholder="e.g. chicken, rice, broccoli, olive oil, garlic…"
                rows={3}
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Diet Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DIET_OPTIONS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDietType(d.value)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${dietType === d.value ? 'var(--accent-orange)' : 'var(--border-glass)'}`,
                        background: dietType === d.value ? 'rgba(255,77,0,0.12)' : 'rgba(255,255,255,0.03)',
                        color: dietType === d.value ? 'var(--accent-orange)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                    >
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Target Calories per Meal: <strong style={{ color: 'var(--accent-orange)' }}>{targetCalories} kcal</strong></label>
                <input
                  type="range" min="200" max="1000" step="50"
                  value={targetCalories}
                  onChange={e => setTargetCalories(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-orange)', marginTop: 12 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>200</span><span>600</span><span>1000</span>
                </div>
              </div>
            </div>
            <button id="generate-recipes-btn" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading
                ? <><Loader size={18} className="spin" /> Cooking up recipes…</>
                : <><ChefHat size={18} /> Generate Recipes with AI</>}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {recipes && (
        <div className="animate-fade">
          {recipes.raw ? (
            <div className="glass-card">
              <pre style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{recipes.raw}</pre>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🍽️ Recipe Suggestions</h2>
              <div className="grid-2">
                {(recipes.recipes || recipeList || [recipes]).map((recipe, i) => (
                  <div key={i} className="recipe-card">
                    <div style={{ background: 'var(--gradient-brand)', height: 4, borderRadius: '20px 20px 0 0' }} />
                    <div className="recipe-card-body">
                      <div style={{ fontSize: 32, marginBottom: 8 }}>
                        {['🥗', '🍲', '🥘', '🍱', '🌮', '🍛'][i % 6]}
                      </div>
                      <div className="recipe-name">{recipe.name || recipe.title || `Recipe ${i+1}`}</div>
                      <div className="recipe-desc">{recipe.description || recipe.summary || ''}</div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                        {recipe.calories && <span className="badge badge-orange"><Flame size={10} /> {recipe.calories} kcal</span>}
                        {recipe.servings && <span className="badge badge-blue"><Users size={10} /> {recipe.servings}</span>}
                        {recipe.prepTime && <span className="badge badge-green"><Clock size={10} /> {recipe.prepTime}</span>}
                        {recipe.protein  && <span className="badge badge-purple">P: {recipe.protein}</span>}
                      </div>
                      {recipe.ingredients && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>INGREDIENTS</div>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {(Array.isArray(recipe.ingredients) ? recipe.ingredients : recipe.ingredients.split(','))
                              .slice(0, 8).map((ing, j) => (
                              <li key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-orange)', flexShrink: 0 }} />
                                {typeof ing === 'string' ? ing.trim() : `${ing.amount || ''} ${ing.item || ing.name || ''}`.trim()}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(recipe.instructions || recipe.steps) && (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>INSTRUCTIONS</div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {typeof (recipe.instructions || recipe.steps) === 'string'
                              ? (recipe.instructions || recipe.steps)
                              : (recipe.instructions || recipe.steps).join(' ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={handleGenerate} disabled={loading}>
                <RefreshCw size={16} /> Generate More Recipes
              </button>
            </div>
          )}
        </div>
      )}

      {!recipes && !loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>👨‍🍳</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Enter Ingredients to Start</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Tell me what's in your fridge and I'll create personalized healthy recipes for you!
          </p>
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
