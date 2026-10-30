import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI, nutritionAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Flame, Droplets, Dumbbell, TrendingUp, Target,
  Utensils, Activity, ChevronRight, Plus, Minus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        <p style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{payload[0].value} {payload[0].name}</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sumRes, wtRes, waterRes] = await Promise.all([
        profileAPI.getDashboard(),
        profileAPI.getWeightHistory(),
        profileAPI.getTodayWater(),
      ]);
      setSummary(sumRes.data);
      setWaterGlasses(sumRes.data.waterGlasses || 0);
      const wData = wtRes.data.map(w => ({
        date: new Date(w.logDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        weight: w.weightKg,
        bmi: w.bmi,
      }));
      setWeightHistory(wData);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Could not load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateWater = async (delta) => {
    const newVal = Math.max(0, Math.min(20, waterGlasses + delta));
    setWaterGlasses(newVal);
    try {
      await profileAPI.updateWater({ glasses: newVal });
    } catch { toast.error('Failed to update water'); }
  };

  const caloriePercent = summary
    ? Math.min(100, Math.round((summary.todayCalories / (summary.dailyCalorieTarget || 2000)) * 100))
    : 0;

  const waterPercent = Math.min(100, Math.round((waterGlasses / 8) * 100));
  let workoutDay = null;
  if (summary?.workoutPlanJson) {
    try {
      const plan = JSON.parse(summary.workoutPlanJson);
      workoutDay = plan.weeklyPlan?.[(new Date().getDay() + 6) % 7] || null;
    } catch {
      workoutDay = null;
    }
  }

  if (loading) {
    return (
      <div>
        <div style={{ height: 40, width: 220, marginBottom: 24 }} className="skeleton" />
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 130 }} className="skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
              <span>{summary?.name || user?.name || 'Champ'}</span> 👋
            </h1>
            <p className="page-subtitle">Here's your fitness snapshot for today</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="badge badge-orange" style={{ fontSize: 12 }}>
              🎯 Goal: {summary?.fitnessGoal?.replace('_', ' ') || 'Fitness'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card glass-card-accent">
          <div className="stat-card-icon" style={{ background: 'rgba(255,77,0,0.12)' }}>🔥</div>
          <div className="stat-card-value">{summary?.todayCalories?.toLocaleString() || 0}</div>
          <div className="stat-card-label">Calories Today</div>
          <div className="progress-bar-track" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${caloriePercent}%` }} />
          </div>
          <div className="stat-card-sub">{caloriePercent}% of {(summary?.dailyCalorieTarget || 2000).toLocaleString()} kcal goal</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(0,212,255,0.12)' }}>💧</div>
          <div className="stat-card-value" style={{ background: 'var(--gradient-blue)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {waterGlasses}
          </div>
          <div className="stat-card-label">Glasses of Water</div>
          <div className="progress-bar-track" style={{ marginTop: 8 }}>
            <div className="progress-bar-fill blue" style={{ width: `${waterPercent}%` }} />
          </div>
          <div className="stat-card-sub">{waterPercent}% of daily goal (8 glasses)</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(0,230,118,0.12)' }}>⚖️</div>
          <div className="stat-card-value" style={{ background: 'var(--gradient-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {summary?.currentWeight || '--'}
          </div>
          <div className="stat-card-label">Current Weight (kg)</div>
          <div className="stat-card-sub">BMI: {summary?.currentBmi || '--'}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(123,97,255,0.12)' }}>💪</div>
          <div className="stat-card-value" style={{ background: 'var(--gradient-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {summary?.workoutsCompleted || 0}
          </div>
          <div className="stat-card-label">Exercises Done Today</div>
          <div className="stat-card-sub">Keep the streak going!</div>
        </div>
      </div>

      <div className="grid-sidebar">
        {/* Left: Weight Chart + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Weight Chart */}
          <div className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>📈 Weight Progress</h2>
              <Link to="/progress" className="btn btn-ghost btn-sm">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            {weightHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} domain={['auto','auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="weight" name="kg"
                    stroke="var(--accent-orange)" strokeWidth={2.5}
                    dot={{ fill: 'var(--accent-orange)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <p>No weight data yet. Log your weight in Progress!</p>
              </div>
            )}
          </div>

          <div className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>🏋️ Today’s Workout</h2>
              <Link to="/workout" className="btn btn-ghost btn-sm">View plan <ChevronRight size={14} /></Link>
            </div>
            {workoutDay ? (
              workoutDay.isRestDay ? (
                <p style={{ color: 'var(--text-secondary)' }}>Recovery day — take time to rest.</p>
              ) : (
                <>
                  <div style={{ color: 'var(--accent-orange)', fontWeight: 700, marginBottom: 10 }}>
                    {workoutDay.focus} · {workoutDay.totalDuration} min
                  </div>
                  {(workoutDay.exercises || []).slice(0, 4).map((exercise, index) => (
                    <div key={`${exercise.name}-${index}`} style={{ padding: '8px 0', borderTop: '1px solid var(--border-glass)', fontSize: 13 }}>
                      {exercise.name} {exercise.sets ? `· ${exercise.sets} sets` : ''}
                    </div>
                  ))}
                </>
              )
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Generate your personalized plan to see today’s exercises.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⚡ Quick Actions</h2>
            <div className="grid-2" style={{ gap: 12 }}>
              {[
                { to: '/nutrition', icon: '🍽️', label: 'Log Meal', color: '#FFB800' },
                { to: '/workout',   icon: '🏋️', label: 'Log Workout', color: '#FF4D00' },
                { to: '/sleep',     icon: '😴', label: 'Log Sleep', color: '#7B61FF' },
                { to: '/chat',      icon: '🤖', label: 'Ask FitAI', color: '#00D4FF' },
              ].map(action => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="glass-card"
                  style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', cursor: 'pointer', border: `1px solid rgba(255,255,255,0.06)` }}
                >
                  <div style={{ fontSize: 24 }}>{action.icon}</div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: action.color }}>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Water Tracker + Calorie Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Water Tracker */}
          <div className="glass-card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>💧 Hydration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div className="water-tracker">
                <div className="water-wave" style={{ height: `${waterPercent}%` }} />
                <div className="water-label">
                  <span>{waterGlasses}</span>
                  <span style={{ fontSize: 12, fontWeight: 400 }}>glasses</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button id="water-minus" className="btn btn-secondary btn-icon" onClick={() => updateWater(-1)}>
                  <Minus size={16} />
                </button>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{waterGlasses} / 8 glasses</span>
                <button id="water-plus" className="btn btn-primary btn-icon" onClick={() => updateWater(1)}>
                  <Plus size={16} />
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                {waterPercent >= 100 ? '🎉 Daily goal reached!' : `${8 - waterGlasses} more to reach goal`}
              </p>
            </div>
          </div>

          {/* Calorie Breakdown */}
          {summary?.dailyCalorieTarget && (
            <div className="glass-card">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎯 Daily Targets</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Daily Calories', value: `${summary.dailyCalorieTarget.toLocaleString()} kcal`, color: 'var(--accent-orange)' },
                  { label: 'Consumed Today', value: `${(summary.todayCalories || 0).toLocaleString()} kcal`, color: 'var(--accent-amber)' },
                  { label: 'Remaining', value: `${Math.max(0, summary.dailyCalorieTarget - (summary.todayCalories || 0)).toLocaleString()} kcal`, color: 'var(--accent-green)' },
                  { label: 'Protein', value: `${Math.round(summary.todayProtein || 0)} / ${Math.round(summary.dailyProteinTarget || 0)} g`, color: 'var(--accent-blue)' },
                  { label: 'Carbohydrates', value: `${Math.round(summary.todayCarbs || 0)} / ${Math.round(summary.dailyCarbsTarget || 0)} g`, color: 'var(--accent-amber)' },
                  { label: 'Fats', value: `${Math.round(summary.todayFats || 0)} / ${Math.round(summary.dailyFatsTarget || 0)} g`, color: 'var(--accent-purple)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <Link to="/nutrition" className="btn btn-primary btn-full btn-sm" style={{ marginTop: 16 }}>
                <Utensils size={14} /> View Nutrition Plan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
