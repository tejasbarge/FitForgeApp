import React, { useEffect, useState } from 'react';
import { profileAPI, workoutAPI } from '../api';
import toast from 'react-hot-toast';
import { RefreshCw, CheckCircle, Circle, Plus, Loader, Clock, Zap } from 'lucide-react';

function parsePlanJson(raw) {
  if (!raw) return null;
  try {
    let cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw };
  }
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateForWorkoutDay(dayIndex) {
  const date = new Date();
  const todayIndex = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - todayIndex + dayIndex);
  return formatLocalDate(date);
}

export default function WorkoutPage() {
  const [plan, setPlan] = useState(null);
  const [logs, setLogs] = useState([]);
  const [split, setSplit] = useState('FULL_BODY');
  const [activeDay, setActiveDay] = useState((new Date().getDay() + 6) % 7);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [logForm, setLogForm] = useState({ exerciseName: '', sets: '', reps: '', weightKg: '', durationMin: '', notes: '' });
  const today = formatLocalDate(new Date());
  const selectedDate = dateForWorkoutDay(activeDay);

  const fetchData = async () => {
    const [planRes, profileRes] = await Promise.allSettled([workoutAPI.getPlan(), profileAPI.get()]);
    if (planRes.status === 'fulfilled') {
      const loadedPlan = parsePlanJson(planRes.value.data.planJson);
      setPlan(loadedPlan);
      if (loadedPlan?.split) setSplit(loadedPlan.split);
    } else if (planRes.reason.response?.status !== 404) {
      toast.error('Could not load your workout plan');
    }
    if (profileRes.status === 'fulfilled' && profileRes.value.data.workoutSplit) {
      setSplit(current => planRes.status === 'fulfilled' ? (parsePlanJson(planRes.value.data.planJson)?.split || current) : profileRes.value.data.workoutSplit);
    } else if (profileRes.status === 'rejected') {
      toast.error('Could not load your workout preferences');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    let current = true;
    setLogs([]);
    setLogsLoading(true);
    workoutAPI.getWorkoutLogs(selectedDate)
      .then(response => {
        if (current) setLogs(response.data);
      })
      .catch(() => {
        if (current) toast.error('Could not load the selected day’s workout log');
      })
      .finally(() => {
        if (current) setLogsLoading(false);
      });
    return () => { current = false; };
  }, [selectedDate]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await workoutAPI.generatePlan({ split });
      setPlan(parsePlanJson(res.data.planJson));
      setActiveDay((new Date().getDay() + 6) % 7);
      toast.success('💪 Database-based workout plan ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate a workout. Check your profile and exercise equipment.');
    } finally { setGenerating(false); }
  };

  const handleLogWorkout = async (e) => {
    e.preventDefault();
    try {
      const res = await workoutAPI.logWorkout({
        exerciseName: logForm.exerciseName,
        sets: parseInt(logForm.sets) || null,
        reps: parseInt(logForm.reps) || null,
        weightKg: parseFloat(logForm.weightKg) || null,
        durationMin: parseInt(logForm.durationMin, 10) || null,
        notes: logForm.notes,
        completed: false,
        logDate: selectedDate,
      });
      setLogs(prev => [...prev, res.data]);
      setShowLog(false);
      setLogForm({ exerciseName: '', sets: '', reps: '', weightKg: '', durationMin: '', notes: '' });
      toast.success('Exercise logged for the selected day!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to log workout'); }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await workoutAPI.toggleComplete(id);
      setLogs(prev => prev.map(l => l.id === id ? res.data : l));
    } catch { toast.error('Failed to update'); }
  };

  const logPlannedExercise = async (exercise, completed) => {
    const exerciseName = exercise.name || exercise.exercise;
    const existingLog = logs.find(log => log.exerciseName === exerciseName);
    try {
      if (existingLog) {
        if (Boolean(existingLog.completed) !== completed) {
          const response = await workoutAPI.toggleComplete(existingLog.id);
          setLogs(previous => previous.map(log => log.id === existingLog.id ? response.data : log));
        }
      } else {
        const response = await workoutAPI.logWorkout({
          exerciseName,
          sets: Number(exercise.sets) || null,
          reps: Number.parseInt(exercise.reps, 10) || null,
          completed,
          logDate: selectedDate,
        });
        setLogs(previous => [...previous, response.data]);
      }
      toast.success(completed ? `${exerciseName} marked complete` : `${exerciseName} added to your log`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update this exercise log');
    }
  };

  const completedCount = logs.filter(l => l.completed).length;
  const plannedDay = plan?.weeklyPlan?.[activeDay];
  const plannedExercises = plannedDay?.exercises || plan?.exercises || plan?.workouts || [];
  const plannedCompletedCount = plannedExercises.filter(exercise =>
    logs.some(log => log.exerciseName === (exercise.name || exercise.exercise) && log.completed)
  ).length;
  const progressTotal = plannedExercises.length || logs.length;
  const progressCompleted = plannedExercises.length ? plannedCompletedCount : completedCount;
  const progressPercent = progressTotal ? Math.round((progressCompleted / progressTotal) * 100) : 0;

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 120 }} className="skeleton" />)}</div>;

  return (
    <div className="animate-fade">
      <div className="page-header workout-page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">💪 <span>Workout</span></h1>
          <p className="page-subtitle">Exercise plans selected from your profile and the exercise database.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select aria-label="Workout split" className="form-select" style={{ width: 'auto', minWidth: 190 }}
            value={split} onChange={event => setSplit(event.target.value)}>
            <option value="FULL_BODY">Full Body</option>
            <option value="UPPER_LOWER">Upper / Lower</option>
            <option value="PUSH_PULL_LEGS">Push / Pull / Legs</option>
          </select>
          <button id="log-workout-btn" className="btn btn-secondary" onClick={() => setShowLog(true)} disabled={logsLoading}>
            <Plus size={16} /> Log Exercise
          </button>
          <button id="gen-workout-btn" className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? <><Loader size={16} className="spin" /> Generating…</> : <><RefreshCw size={16} /> New Plan</>}
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      {(
        <div className="glass-card glass-card-accent" style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-20">
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-orange)' }}>
                {progressCompleted}/{progressTotal}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Planned exercises complete</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {progressPercent}% complete · {plannedDay?.day || 'Selected day'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-blue)' }}>
                {logs.reduce((a, l) => a + (l.durationMin || 0), 0)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Minutes logged</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-sidebar">
        {/* Workout Plan */}
        <div className="glass-card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>💪 Weekly Workout Plan</h2>
          {plan ? (
            plan.raw ? (
              <pre style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{plan.raw}</pre>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {plan.weeklyPlan && (
                  <div className="workout-day-tabs" role="tablist" aria-label="Workout days">
                    {plan.weeklyPlan.map((day, index) => (
                      <button key={day.day} type="button"
                        role="tab"
                        aria-selected={activeDay === index}
                        className={`workout-day-tab ${activeDay === index ? 'active' : ''}`}
                        onClick={() => setActiveDay(index)}>
                        <span>{day.day.slice(0, 3)}</span>
                        <small>{day.isRestDay ? 'Rest' : day.focus}</small>
                      </button>
                    ))}
                  </div>
                )}
                {plan.weeklyPlan && (
                  <div className="badge badge-orange" style={{ alignSelf: 'flex-start' }}>
                    {plannedDay?.day || 'Today'} · {selectedDate} · {plannedDay?.focus || 'Workout'} · {plannedDay?.totalDuration || 0} min
                    {selectedDate === today ? ' · Today' : ''}
                  </div>
                )}
                {plannedDay?.isRestDay && <p style={{ color: 'var(--text-secondary)' }}>Today is a recovery day. Rest and recover.</p>}
                {plannedExercises.map((ex, i) => {
                  const exerciseName = ex.name || ex.exercise;
                  const exerciseLog = logs.find(log => log.exerciseName === exerciseName);
                  const isCompleted = Boolean(exerciseLog?.completed);
                  return (
                  <div key={`${exerciseName}-${i}`} className={`exercise-card ${isCompleted ? 'completed' : ''}`}>
                    <div className="exercise-card-header">
                      <div>
                        <div className="exercise-name">{exerciseName}</div>
                        {ex.muscleGroup && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>💪 {ex.muscleGroup}</div>}
                      </div>
                      {ex.difficulty && <span className="badge badge-orange">{ex.difficulty}</span>}
                    </div>
                    <div className="exercise-meta">
                      {ex.sets    && <span className="badge badge-blue">{ex.sets} sets</span>}
                      {ex.reps    && <span className="badge badge-purple">{ex.reps} reps</span>}
                      {ex.duration && <span className="badge badge-green"><Clock size={10} />{ex.duration}</span>}
                      {ex.rest     && <span className="badge badge-amber">Rest: {ex.rest}</span>}
                    </div>
                    {ex.instructions && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.5 }}>{ex.instructions}</p>
                    )}
                    {!plannedDay?.isRestDay && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        <button className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          onClick={() => logPlannedExercise(ex, !isCompleted)} disabled={logsLoading}>
                          {isCompleted ? <><CheckCircle size={14} /> Completed · Undo</> : <><CheckCircle size={14} /> Mark complete</>}
                        </button>
                        {!exerciseLog && (
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => logPlannedExercise(ex, false)} disabled={logsLoading}>Log for this day</button>
                        )}
                      </div>
                    )}
                  </div>
                );})}
                {!plan.weeklyPlan && !plan.exercises && !plan.workouts && (
                  <pre style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {JSON.stringify(plan, null, 2)}
                  </pre>
                )}
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🏋️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Workout Plan</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
                Generate a weekly plan from the exercise database using your level, goal, equipment, duration, restrictions, and split.
              </p>
              <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating…' : 'Generate Workout Plan'}
              </button>
            </div>
          )}
        </div>

        {/* Today's Logs */}
        <div>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>✅ {plannedDay?.day || 'Selected Day'}’s Log · {selectedDate}</h2>
            </div>
            <div style={{ maxHeight: 500, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {logsLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading this day’s log…</div>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <Zap size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <p>No exercises logged for {plannedDay?.day || 'this day'} yet. Mark a planned exercise complete or use Log Exercise.</p>
                </div>
              ) : (
                logs.map(log => (
                  <div
                  key={log.id}
                  className={`exercise-card ${log.completed ? 'completed' : ''}`}
                  style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        type="button"
                        className="workout-completion-toggle"
                        aria-label={`${log.completed ? 'Mark incomplete' : 'Mark complete'}: ${log.exerciseName}`}
                        aria-pressed={Boolean(log.completed)}
                        title={log.completed ? 'Mark incomplete' : 'Mark complete'}
                        onClick={() => toggleComplete(log.id)}
                      >
                        {log.completed
                          ? <CheckCircle size={23} color="var(--accent-green)" />
                          : <Circle size={23} color="var(--text-muted)" />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{log.exerciseName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {log.sets && `${log.sets}×${log.reps || '?'} reps`}
                          {log.weightKg && ` · ${log.weightKg}kg`}
                          {log.durationMin && ` · ${log.durationMin} min`}
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleComplete(log.id)}>
                        {log.completed ? 'Undo' : 'Complete'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log Workout Modal */}
      {showLog && (
        <div className="modal-overlay" onClick={() => setShowLog(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💪 Log Exercise</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLog(false)}>✕</button>
            </div>
            <form onSubmit={handleLogWorkout} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Exercise Name</label>
                <input className="form-input" placeholder="e.g. Bench Press" required
                  value={logForm.exerciseName} onChange={e => setLogForm(p => ({ ...p, exerciseName: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Sets</label>
                  <input type="number" className="form-input" placeholder="3"
                    value={logForm.sets} onChange={e => setLogForm(p => ({ ...p, sets: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reps</label>
                  <input type="number" className="form-input" placeholder="12"
                    value={logForm.reps} onChange={e => setLogForm(p => ({ ...p, reps: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input type="number" step="0.5" className="form-input" placeholder="60"
                    value={logForm.weightKg} onChange={e => setLogForm(p => ({ ...p, weightKg: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (min)</label>
                  <input type="number" className="form-input" placeholder="30"
                    value={logForm.durationMin} onChange={e => setLogForm(p => ({ ...p, durationMin: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="How did it feel?"
                  value={logForm.notes} onChange={e => setLogForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLog(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={logsLoading}>Log Exercise</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
