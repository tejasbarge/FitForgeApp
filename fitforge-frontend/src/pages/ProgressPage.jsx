import React, { useEffect, useState } from 'react';
import { profileAPI, workoutAPI, nutritionAPI } from '../api';
import toast from 'react-hot-toast';
import { Plus, Download, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';

function formatLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateAtLocalNoon(dateKey) {
  return new Date(`${dateKey}T12:00:00`);
}

function getDateKey(value) {
  let dateKey = null;
  if (Array.isArray(value) && value.length >= 3) {
    dateKey = `${value[0]}-${String(value[1]).padStart(2, '0')}-${String(value[2]).padStart(2, '0')}`;
  } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    dateKey = value.slice(0, 10);
  }
  if (!dateKey) return null;
  const parsed = dateAtLocalNoon(dateKey);
  return Number.isNaN(parsed.getTime()) || formatLocalDate(parsed) !== dateKey ? null : dateKey;
}

function formatDateLabel(value, options) {
  const dateKey = getDateKey(value);
  if (!dateKey) return 'Date unavailable';
  const date = dateAtLocalNoon(dateKey);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en', options);
}

function shiftDate(date, amount) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + amount);
  return shifted;
}

function parsePlan(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return null;
  }
}

export default function ProgressPage() {
  const [history, setHistory] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ weightKg: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileAPI.getWeightHistory()
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let current = true;
    const from = selectedDate;
    const to = selectedDate;
    setActivityLoading(true);
    setWorkoutLogs([]);
    setMealLogs([]);
    Promise.allSettled([
      workoutAPI.getProgress(from, to),
      nutritionAPI.getProgress(from, to),
      workoutAPI.getPlan(),
    ]).then(([workouts, meals, plan]) => {
      if (!current) return;
      if (workouts.status === 'fulfilled') setWorkoutLogs(workouts.value.data);
      else toast.error('Could not load workout progress for this date');
      if (meals.status === 'fulfilled') setMealLogs(meals.value.data);
      else toast.error('Could not load nutrition progress for this date');
      if (plan.status === 'fulfilled') setWorkoutPlan(parsePlan(plan.value.data.planJson));
      else if (plan.reason.response?.status === 404) setWorkoutPlan(null);
      else toast.error('Could not load your workout plan');
    }).finally(() => {
      if (current) setActivityLoading(false);
    });
    return () => { current = false; };
  }, [selectedDate]);

  const selectedDateObject = dateAtLocalNoon(selectedDate);
  const selectedDayIndex = (selectedDateObject.getDay() + 6) % 7;
  const selectedDayLabel = selectedDateObject.toLocaleDateString('en', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const shiftSelectedDate = (amount) => setSelectedDate(
    formatLocalDate(shiftDate(selectedDateObject, amount))
  );

  const handleLog = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileAPI.logWeight({ weightKg: parseFloat(form.weightKg), notes: form.notes });
      setHistory(prev => [...prev, res.data]);
      setShowLog(false);
      setForm({ weightKg: '', notes: '' });
      toast.success('Weight logged!');
    } catch { toast.error('Failed to log weight'); }
    finally { setSaving(false); }
  };

  const exportPDF = async () => {
    toast.loading('Generating PDF…');
    try {
      const el = document.getElementById('progress-report');
      const canvas = await html2canvas(el, { backgroundColor: '#050A14', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.setFillColor(5, 10, 20);
      pdf.rect(0, 0, w, pdf.internal.pageSize.getHeight(), 'F');
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save('FitForge_Progress_Report.pdf');
      toast.dismiss();
      toast.success('PDF exported!');
    } catch { toast.dismiss(); toast.error('Export failed'); }
  };

  const chartData = [...history].map(w => ({
    date: formatDateLabel(w.logDate, { month: 'short', day: 'numeric' }),
    weight: w.weightKg,
    bmi: w.bmi,
  })).filter(entry => entry.date !== 'Date unavailable');

  const firstWeight = history[0]?.weightKg;
  const lastWeight = history[history.length - 1]?.weightKg;
  const weightChange = firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : null;

  const stats = [
    { label: 'Starting Weight', value: firstWeight ? `${firstWeight} kg` : '--', icon: '📊' },
    { label: 'Current Weight',  value: lastWeight  ? `${lastWeight} kg`  : '--', icon: '⚖️', color: 'var(--accent-orange)' },
    { label: 'Total Change',    value: weightChange != null ? `${weightChange > 0 ? '+' : ''}${weightChange} kg` : '--',
      icon: weightChange < 0 ? '🔥' : weightChange > 0 ? '📈' : '➡️',
      color: weightChange < 0 ? 'var(--accent-green)' : weightChange > 0 ? 'var(--accent-red)' : 'var(--text-secondary)' },
    { label: 'Current BMI',     value: lastWeight ? `${history[history.length-1]?.bmi}` : '--', icon: '🩺' },
  ];
  const selectedPlanDay = workoutPlan?.weeklyPlan?.[selectedDayIndex] || null;
  const plannedExercises = selectedPlanDay?.exercises || [];
  const selectedWorkoutLogs = workoutLogs.filter(log => getDateKey(log.logDate) === selectedDate);
  const plannedExercisesCompleted = plannedExercises.filter(exercise => selectedWorkoutLogs.some(log =>
    log.completed && (log.exerciseName || '').trim().toLowerCase()
      === (exercise.name || exercise.exercise || '').trim().toLowerCase()
  )).length;
  const completedExtras = selectedWorkoutLogs.filter(log => log.completed && !plannedExercises.some(exercise =>
    (exercise.name || exercise.exercise || '').trim().toLowerCase()
      === (log.exerciseName || '').trim().toLowerCase()
  )).length;
  const workoutMinutes = selectedWorkoutLogs.filter(log => log.completed)
    .reduce((total, log) => total + (log.durationMin || 0), 0);
  const nutritionCalories = mealLogs.reduce((total, log) => total + (log.calories || 0), 0);
  const nutritionProtein = mealLogs.reduce((total, log) => total + (log.proteinG || 0), 0);
  const nutritionCarbs = mealLogs.reduce((total, log) => total + (log.carbsG || 0), 0);
  const nutritionFats = mealLogs.reduce((total, log) => total + (log.fatsG || 0), 0);
  const nutritionMeals = mealLogs.length;
  const plannedExerciseCount = plannedExercises.length;
  const workoutDays = selectedWorkoutLogs.some(log => log.completed) ? 1 : 0;

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 120 }} className="skeleton" />)}</div>;

  return (
    <div className="animate-fade">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">📈 <span>Progress</span></h1>
          <p className="page-subtitle">Review workout and nutrition progress for one selected day</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-secondary btn-icon" aria-label="Previous day" onClick={() => shiftSelectedDate(-1)}>
              <ChevronLeft size={16} />
            </button>
            <input aria-label="Progress date" type="date" className="form-input" value={selectedDate}
              max={formatLocalDate(new Date())} onChange={event => event.target.value && setSelectedDate(event.target.value)}
              style={{ width: 160 }} />
            <button className="btn btn-secondary btn-icon" aria-label="Next day" onClick={() => shiftSelectedDate(1)}
              disabled={selectedDate >= formatLocalDate(new Date())}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button id="export-pdf-btn" className="btn btn-secondary" onClick={exportPDF}>
            <Download size={16} /> Export PDF
          </button>
          <button id="log-weight-btn" className="btn btn-primary" onClick={() => setShowLog(true)}>
            <Plus size={16} /> Log Weight
          </button>
        </div>
      </div>

      <div id="progress-report">
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>🏋️ Workout Progress</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                {selectedDayLabel} · completed counts are matched to the planned exercises
              </p>
            </div>
            <Dumbbell size={22} color="var(--accent-orange)" />
          </div>
          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: 'Planned exercises done', value: `${plannedExercisesCompleted} / ${plannedExerciseCount}` },
              { label: 'Extra exercises done', value: completedExtras },
              { label: 'Workout done today', value: workoutDays ? 'Yes' : 'No' },
              { label: 'Minutes logged', value: workoutMinutes },
            ].map(item => (
              <div key={item.label} className="stat-card">
                <div className="stat-card-value">{item.value}</div>
                <div className="stat-card-label">{item.label}</div>
              </div>
            ))}
          </div>
          {activityLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 12px', color: 'var(--text-muted)' }}>Loading workout progress for this date…</div>
          ) : workoutPlan ? (
            <div className="exercise-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <strong>{selectedDayLabel}</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {selectedPlanDay?.isRestDay ? 'Rest day' : `${plannedExercisesCompleted}/${plannedExerciseCount} planned exercises complete`}
                </span>
              </div>
              {selectedPlanDay?.isRestDay ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>Recovery</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {plannedExercises.map((exercise, exerciseIndex) => {
                    const name = exercise.name || exercise.exercise || 'Exercise';
                    const done = selectedWorkoutLogs.some(log => log.completed
                      && (log.exerciseName || '').trim().toLowerCase() === name.trim().toLowerCase());
                    return (
                      <span key={`${name}-${exerciseIndex}`} className={`badge ${done ? 'badge-green' : 'badge-blue'}`}>
                        {done ? '✓' : '○'} {name}
                      </span>
                    );
                  })}
                  {selectedWorkoutLogs.filter(log => log.completed && !plannedExercises.some(exercise =>
                    (exercise.name || exercise.exercise || '').trim().toLowerCase() === (log.exerciseName || '').trim().toLowerCase()
                  )).map(log => (
                    <span key={`extra-${log.id}`} className="badge badge-purple">✓ {log.exerciseName} · extra</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
              <p>No workout plan found, so planned-exercise progress cannot be calculated.</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Generate a plan on Workout, then mark its exercises complete. Manually logged exercises are counted separately.</p>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ marginBottom: 24 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>🍽️ Nutrition Progress</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Your logged food intake for {selectedDayLabel}</p>
            </div>
            <span style={{ fontSize: 22 }}>🥗</span>
          </div>
          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: 'Calories today', value: `${Math.round(nutritionCalories)} kcal` },
              { label: 'Protein', value: `${Math.round(nutritionProtein)} g` },
              { label: 'Carbohydrates', value: `${Math.round(nutritionCarbs)} g` },
              { label: 'Fat', value: `${Math.round(nutritionFats)} g` },
            ].map(item => (
              <div key={item.label} className="stat-card">
                <div className="stat-card-value">{item.value}</div>
                <div className="stat-card-label">{item.label}</div>
              </div>
            ))}
          </div>
          {activityLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 12px', color: 'var(--text-muted)' }}>Loading nutrition for this date…</div>
          ) : (
            <>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                {nutritionMeals} {nutritionMeals === 1 ? 'meal' : 'meals'} logged for this date
              </div>
              {mealLogs.map(log => (
                <div key={log.id} className="exercise-card" style={{ cursor: 'default', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong>{log.foodName}</strong>
                    <strong style={{ color: 'var(--accent-orange)' }}>{Math.round(log.calories || 0)} kcal</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
                    {log.mealType || 'Meal'} · P: {Math.round(log.proteinG || 0)} g · C: {Math.round(log.carbsG || 0)} g · F: {Math.round(log.fatsG || 0)} g
                  </div>
                </div>
              ))}
            </>
          )}
          {!activityLoading && mealLogs.length === 0 && (
            <p style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--text-muted)' }}>No meals logged for this date. Open Nutrition and log a meal to start tracking.</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color || 'var(--text-primary)', marginTop: 4 }}>{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {chartData.length > 1 ? (
          <>
            <div className="glass-card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>⚖️ Weight Over Time</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v, n) => [`${v} ${n === 'weight' ? 'kg' : ''}`, n.charAt(0).toUpperCase() + n.slice(1)]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="weight" stroke="var(--accent-orange)" strokeWidth={2.5}
                    dot={{ fill: 'var(--accent-orange)', r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🩺 BMI Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`${v}`, 'BMI']}
                  />
                  <Line type="monotone" dataKey="bmi" name="BMI" stroke="var(--accent-blue)" strokeWidth={2.5}
                    dot={{ fill: 'var(--accent-blue)', r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: 60, marginBottom: 24 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📊</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Start Tracking</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Log at least 2 weight entries to see your progress chart.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowLog(true)}>
              Log First Weight Entry
            </button>
          </div>
        )}

        {/* Weight Log Table */}
        {history.length > 0 && (
          <div className="glass-card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📋 Weight History</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    {['Date', 'Weight (kg)', 'BMI', 'Change', 'Notes'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((w, i, arr) => {
                    const prev = arr[i + 1];
                    const delta = prev ? (w.weightKg - prev.weightKg).toFixed(1) : null;
                    return (
                      <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 12px' }}>{formatDateLabel(w.logDate, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td style={{ padding: '12px 12px', fontWeight: 700 }}>{w.weightKg} kg</td>
                        <td style={{ padding: '12px 12px', color: 'var(--text-secondary)' }}>{w.bmi}</td>
                        <td style={{ padding: '12px 12px' }}>
                          {delta != null ? (
                            <span style={{ color: delta < 0 ? 'var(--accent-green)' : delta > 0 ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600 }}>
                              {delta > 0 ? '+' : ''}{delta} kg
                            </span>
                          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ padding: '12px 12px', color: 'var(--text-muted)', fontSize: 12 }}>{w.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Log Weight Modal */}
      {showLog && (
        <div className="modal-overlay" onClick={() => setShowLog(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚖️ Log Weight</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLog(false)}>✕</button>
            </div>
            <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" step="0.1" className="form-input" placeholder="e.g. 72.5" required
                  value={form.weightKg} onChange={e => setForm(p => ({ ...p, weightKg: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="e.g. After morning workout"
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLog(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving…' : 'Log Weight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
