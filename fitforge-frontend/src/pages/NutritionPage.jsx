import React, { useEffect, useState } from 'react';
import { nutritionAPI, profileAPI } from '../api';
import toast from 'react-hot-toast';
import { RefreshCw, Plus, Trash2, Loader, ChevronLeft, ChevronRight, Circle, CheckCircle } from 'lucide-react';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
const MEAL_EMOJIS = { BREAKFAST: '🌅', LUNCH: '☀️', DINNER: '🌙', SNACK: '🍎' };
const MEAL_ORDER = ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'];
const MEAL_LABEL = {
  breakfast: '🌅 Breakfast',
  morningSnack: '🍎 Morning Snack',
  lunch: '☀️ Lunch',
  eveningSnack: '🍵 Evening Snack',
  dinner: '🌙 Dinner',
};
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parsePlanJson(raw) {
  if (!raw) return null;
  try {
    let cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw };
  }
}

function MealPlanDisplay({ plan, dayIdx, onChangeDay, onLogMeal, mealLogs, generating }) {
  if (plan.weeklyPlan && Array.isArray(plan.weeklyPlan)) {
    const days = plan.weeklyPlan;
    const day = days[dayIdx] || {};
    const meals = day.meals || {};
    return (
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {days.map((d, i) => (
            <button key={i} onClick={() => onChangeDay(i)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              border: i === dayIdx ? '1.5px solid var(--accent-orange)' : '1.5px solid var(--border-glass)',
              background: i === dayIdx ? 'rgba(255,77,0,0.15)' : 'rgba(255,255,255,0.03)',
              color: i === dayIdx ? 'var(--accent-orange)' : 'var(--text-secondary)',
            }}>
              {DAYS_SHORT[i] || d.day || ('Day '+(i+1))}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '10px 14px', background: 'rgba(255,77,0,0.06)', borderRadius: 10, border: '1px solid rgba(255,77,0,0.12)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>{day.day || DAYS_SHORT[dayIdx]}</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {day.totalCalories && <span><strong style={{ color: 'var(--accent-orange)', fontSize: 16 }}>{day.totalCalories}</strong><span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>kcal</span></span>}
            {day.protein != null && <span><strong style={{ color: 'var(--accent-blue)' }}>{day.protein}g</strong><span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>protein</span></span>}
            {day.carbs   != null && <span><strong style={{ color: 'var(--accent-amber)' }}>{day.carbs}g</strong><span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>carbs</span></span>}
            {day.fats    != null && <span><strong style={{ color: 'var(--accent-purple)' }}>{day.fats}g</strong><span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>fats</span></span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MEAL_ORDER.map(key => {
            const meal = meals[key];
            if (!meal) return null;
            const mealType = key.toLowerCase().includes('breakfast') ? 'BREAKFAST'
              : key.toLowerCase().includes('lunch') ? 'LUNCH'
              : key.toLowerCase().includes('dinner') ? 'DINNER' : 'SNACK';
            const isLogged = mealLogs.some(log =>
              log.foodName?.trim().toLowerCase() === (meal.name || '').trim().toLowerCase()
              && log.mealType === mealType
            );
            return (
              <div key={key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{MEAL_LABEL[key]}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>{meal.name}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-orange)', flexShrink: 0, marginLeft: 8 }}>{meal.calories} kcal</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {meal.protein != null && <span className="badge badge-blue">P: {meal.protein}g</span>}
                  {meal.carbs   != null && <span className="badge badge-amber">C: {meal.carbs}g</span>}
                  {meal.fats    != null && <span className="badge badge-purple">F: {meal.fats}g</span>}
                </div>
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: meal.instructions ? 8 : 0 }}>
                    {meal.ingredients.slice(0, 7).map((ing, i) => (
                      <span key={i} style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: 20, color: 'var(--text-secondary)' }}>
                        {typeof ing === 'object' ? ((ing.amount || '') + ' ' + (ing.item || ing.name || '')).trim() : ing}
                      </span>
                    ))}
                  </div>
                )}
                {meal.instructions && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, marginTop: 4 }}>
                    {meal.instructions}
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 10 }}
                  disabled={generating || isLogged}
                  onClick={() => onLogMeal(meal, key)}
                >
                  {isLogged
                    ? <><CheckCircle size={14} color="var(--accent-green)" /> Logged</>
                    : <><Circle size={14} /> Mark as logged</>}
                </button>
              </div>
            );
          })}
        </div>

        {plan.tips && plan.tips.length > 0 && (
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(0,212,255,0.06)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.12)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 8 }}>💡 Nutrition Tips</div>
            {plan.tips.map((tip, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>• {tip}</div>)}
          </div>
        )}
      </div>
    );
  }

  if (plan.raw) return <pre style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{plan.raw}</pre>;
  return <pre style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{JSON.stringify(plan, null, 2)}</pre>;
}

export default function NutritionPage() {
  const [plan, setPlan] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logForm, setLogForm] = useState({ foodName: '', calories: '', protein: '', carbs: '', fats: '', mealType: 'LUNCH', servingSize: '1', servingUnit: 'serving' });
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const today = formatLocalDate(new Date());
  const selectedPlanDay = (new Date(`${selectedDate}T12:00:00`).getDay() + 6) % 7;

  const fetchData = async () => {
    try {
      const [planRes, logsRes, profileRes] = await Promise.allSettled([
        nutritionAPI.getPlan(),
        profileAPI.get(),
      ]);
      if (planRes.status === 'fulfilled') setPlan(parsePlanJson(planRes.value.data.planJson));
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
      if (planRes.status === 'rejected' && planRes.reason.response?.status !== 404) {
        toast.error('Could not load your meal plan');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    let current = true;
    setMealLogs([]);
    setLogsLoading(true);
    nutritionAPI.getMealLogs(selectedDate)
      .then(response => {
        if (current) setMealLogs(response.data);
      })
      .catch(() => {
        if (current) toast.error('Could not load the selected day’s food log');
      })
      .finally(() => {
        if (current) setLogsLoading(false);
      });
    return () => { current = false; };
  }, [selectedDate]);

  function formatLocalDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  const changeSelectedDay = (dayIndex) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    const currentDay = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() + dayIndex - currentDay);
    setSelectedDate(formatLocalDate(date));
  };

  const shiftSelectedDate = (days) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatLocalDate(date));
  };
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await nutritionAPI.generatePlan();
      setPlan(parsePlanJson(res.data.planJson));
      toast.success('🍽️ Personalized meal plan ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan. Check your profile.');
    } finally { setGenerating(false); }
  };

  const saveMeal = async (mealData) => {
    setSaving(true);
    try {
      const res = await nutritionAPI.logMeal({ ...mealData, logDate: selectedDate });
      setMealLogs(prev => [...prev, res.data]);
      setShowLog(false);
      setLogForm({ foodName: '', calories: '', protein: '', carbs: '', fats: '', mealType: 'LUNCH', servingSize: '1', servingUnit: 'serving' });
      toast.success(`Meal logged for ${selectedDate === today ? 'today' : selectedDate}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log meal');
    } finally {
      setSaving(false);
    }
  };

  const handleLogMeal = async (e) => {
    e.preventDefault();
    await saveMeal({
      foodName: logForm.foodName,
      calories: parseInt(logForm.calories, 10) || 0,
      proteinG: parseFloat(logForm.protein) || 0,
      carbsG: parseFloat(logForm.carbs) || 0,
      fatsG: parseFloat(logForm.fats) || 0,
      mealType: logForm.mealType,
      servingSize: parseFloat(logForm.servingSize) || 1,
      servingUnit: logForm.servingUnit,
    });
  };

  const logPlannedMeal = async (meal, mealKey) => {
    const mealType = mealKey.toLowerCase().includes('breakfast') ? 'BREAKFAST'
      : mealKey.toLowerCase().includes('lunch') ? 'LUNCH'
      : mealKey.toLowerCase().includes('dinner') ? 'DINNER' : 'SNACK';
    await saveMeal({
      foodName: meal.name || mealKey,
      calories: Math.round(Number(meal.calories) || 0),
      proteinG: Number(meal.protein) || 0,
      carbsG: Number(meal.carbs) || 0,
      fatsG: Number(meal.fats) || 0,
      mealType,
      servingSize: 1,
      servingUnit: 'serving',
    });
  };

  const handleDelete = async (id) => {
    try {
      await nutritionAPI.deleteMealLog(id);
      setMealLogs(prev => prev.filter(m => m.id !== id));
      toast.success('Meal removed');
    } catch { toast.error('Failed to delete'); }
  };

  const totalToday = mealLogs.reduce((acc, m) => ({
    cal: acc.cal + (m.calories || 0),
    prot: acc.prot + (m.proteinG || 0),
    carbs: acc.carbs + (m.carbsG || 0),
    fat: acc.fat + (m.fatsG || 0),
  }), { cal: 0, prot: 0, carbs: 0, fat: 0 });
  const dailyTargets = [
    { label: 'Calories', value: totalToday.cal, target: profile?.dailyCalorieTarget || 0, unit: 'kcal', color: 'var(--accent-orange)' },
    { label: 'Protein', value: totalToday.prot, target: profile?.dailyCalorieTarget ? profile.dailyCalorieTarget * 0.30 / 4 : 0, unit: 'g', color: 'var(--accent-blue)' },
    { label: 'Carbs', value: totalToday.carbs, target: profile?.dailyCalorieTarget ? profile.dailyCalorieTarget * 0.40 / 4 : 0, unit: 'g', color: 'var(--accent-amber)' },
    { label: 'Fats', value: totalToday.fat, target: profile?.dailyCalorieTarget ? profile.dailyCalorieTarget * 0.30 / 9 : 0, unit: 'g', color: 'var(--accent-purple)' },
  ];

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 120 }} className="skeleton" />)}</div>;

  return (
    <div className="animate-fade">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🍽️ <span>Nutrition</span></h1>
          <p className="page-subtitle">Personalized meal plans and food tracking</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button id="log-meal-btn" className="btn btn-secondary" onClick={() => setShowLog(true)}>
            <Plus size={16} /> Log Meal
          </button>
          <button id="generate-plan-btn" className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? <><Loader size={16} className="spin" /> Generating</> : <><RefreshCw size={16} /> Generate Plan</>}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>📊 Daily Nutrition Progress</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              {selectedDate === today ? 'Today' : new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
              {' · '}{mealLogs.length} {mealLogs.length === 1 ? 'meal' : 'meals'} logged
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-secondary btn-icon" aria-label="Previous day" onClick={() => shiftSelectedDate(-1)}>
              <ChevronLeft size={16} />
            </button>
            <input
              aria-label="Nutrition log date"
              className="form-input"
              type="date"
              value={selectedDate}
              onChange={event => event.target.value && setSelectedDate(event.target.value)}
              style={{ width: 150 }}
            />
            <button className="btn btn-secondary btn-icon" aria-label="Next day" onClick={() => shiftSelectedDate(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="glass-card glass-card-accent" style={{ marginBottom: 24 }}>
          <div className="grid-4">
            {dailyTargets.map(target => {
              const percent = target.target > 0 ? Math.min(100, Math.round(target.value / target.target * 100)) : 0;
              return (
              <div key={target.label} style={{ padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{target.label}</span>
                  <strong style={{ color: target.color, fontSize: 15 }}>{Math.round(target.value)}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}> / {target.target > 0 ? Math.round(target.target) : '—'} {target.unit}</span></strong>
                </div>
                <div className="progress-bar-track" style={{ marginTop: 8 }}>
                  <div className="progress-bar-fill" style={{ width: `${percent}%`, background: target.color }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{target.target > 0 ? `${percent}% of target` : 'Target unavailable'}</div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid-sidebar">
        <div>
          {plan ? (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>🍽️ 7-Day Personalized Meal Plan</h2>
                <button className="btn btn-ghost btn-sm" onClick={handleGenerate} disabled={generating}>
                  <RefreshCw size={13} /> Regenerate
                </button>
              </div>
              <MealPlanDisplay
                plan={plan}
                dayIdx={selectedPlanDay}
                onChangeDay={changeSelectedDay}
                onLogMeal={logPlannedMeal}
                mealLogs={mealLogs}
                generating={saving}
              />
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🤖</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Meal Plan Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
                Generate a personalized AI meal plan based on your goals and diet preferences.
              </p>
              <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating...' : '✨ Generate My Meal Plan'}
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>📝 {selectedDate === today ? 'Today' : selectedDate} Food Log</h2>
            </div>
            <div style={{ maxHeight: 520, overflowY: 'auto', padding: 16 }}>
              {logsLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading this day’s food log…</div>
              ) : mealLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🍽️</div>
                  <p>No meals logged for this day</p>
                </div>
              ) : (
                mealLogs.map(log => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-glass)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{log.foodName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        <span className="badge badge-amber" style={{ marginRight: 6 }}>{MEAL_EMOJIS[log.mealType]} {log.mealType}</span>
                        {log.servingSize} {log.servingUnit}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{log.calories} kcal</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>P:{log.proteinG || 0}g C:{log.carbsG || 0}g F:{log.fatsG || 0}g</div>
                      </div>
                      <button aria-label={`Delete ${log.foodName}`} className="btn btn-ghost btn-icon" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(log.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showLog && (
        <div className="modal-overlay" onClick={() => setShowLog(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🍽️ Log a Meal</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLog(false)}>x</button>
            </div>
            <form onSubmit={handleLogMeal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>This meal will be added to {selectedDate === today ? 'today' : selectedDate}.</p>
              <div className="form-group">
                <label className="form-label">Food Name</label>
                <input className="form-input" placeholder="e.g. Chicken Rice Bowl" required
                  value={logForm.foodName} onChange={e => setLogForm(p => ({ ...p, foodName: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input type="number" className="form-input" placeholder="350"
                    value={logForm.calories} onChange={e => setLogForm(p => ({ ...p, calories: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Meal Type</label>
                  <select className="form-select" value={logForm.mealType} onChange={e => setLogForm(p => ({ ...p, mealType: e.target.value }))}>
                    {MEAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input type="number" step="0.1" className="form-input" placeholder="30"
                    value={logForm.protein} onChange={e => setLogForm(p => ({ ...p, protein: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Carbs (g)</label>
                  <input type="number" step="0.1" className="form-input" placeholder="45"
                    value={logForm.carbs} onChange={e => setLogForm(p => ({ ...p, carbs: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Fats (g)</label>
                  <input type="number" step="0.1" className="form-input" placeholder="10"
                    value={logForm.fats} onChange={e => setLogForm(p => ({ ...p, fats: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Serving Size</label>
                  <input type="number" min="0.1" step="0.1" className="form-input" placeholder="1"
                    value={logForm.servingSize} onChange={e => setLogForm(p => ({ ...p, servingSize: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLog(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving || logsLoading}>{saving ? 'Saving…' : 'Log Meal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
