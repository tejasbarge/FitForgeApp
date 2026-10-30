import React, { useEffect, useState } from 'react';
import { extrasAPI } from '../api';
import toast from 'react-hot-toast';
import { Moon, Plus, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const QUALITY_EMOJIS = { 1: '😫', 2: '😔', 3: '😐', 4: '😊', 5: '😴' };
const QUALITY_LABELS = { 1: 'Terrible', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Excellent' };
const QUALITY_COLORS = { 1: '#FF3B3B', 2: '#FF6B35', 3: '#FFB800', 4: '#7BFF61', 5: '#00E676' };

export default function SleepPage() {
  const [history, setHistory] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sleepHours: '', quality: 3, notes: '' });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    extrasAPI.getSleepHistory()
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await extrasAPI.logSleep({
        sleepHours: parseFloat(form.sleepHours),
        quality: parseInt(form.quality),
        notes: form.notes,
      });
      setHistory(prev => [res.data, ...prev]);
      setShowLog(false);
      setForm({ sleepHours: '', quality: 3, notes: '' });
      toast.success(res.data.aiRecoverySuggestion?.startsWith('Your sleep entry was saved.')
        ? 'Sleep logged. AI recovery advice is temporarily unavailable.'
        : '😴 Sleep logged with an AI recovery tip!');
    } catch { toast.error('Failed to log sleep'); }
    finally { setSaving(false); }
  };

  const avgSleep = history.length
    ? (history.reduce((a, s) => a + s.sleepHours, 0) / history.length).toFixed(1)
    : 0;
  const avgQuality = history.length
    ? (history.reduce((a, s) => a + s.quality, 0) / history.length).toFixed(1)
    : 0;

  const chartData = [...history].reverse().slice(-14).map(s => ({
    date: new Date(s.logDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    hours: s.sleepHours,
    quality: s.quality,
  }));

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} style={{ height: 120 }} className="skeleton" />)}</div>;

  return (
    <div className="animate-fade">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">😴 <span>Sleep Tracker</span></h1>
          <p className="page-subtitle">Track sleep quality and get AI recovery suggestions</p>
        </div>
        <button id="log-sleep-btn" className="btn btn-primary" onClick={() => setShowLog(true)}>
          <Plus size={16} /> Log Sleep
        </button>
      </div>

      {/* Stats Row */}
      {history.length > 0 && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(123,97,255,0.12)' }}>😴</div>
            <div className="stat-card-value" style={{ background: 'var(--gradient-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {avgSleep}h
            </div>
            <div className="stat-card-label">Avg Sleep Duration</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(255,184,0,0.12)' }}>⭐</div>
            <div className="stat-card-value" style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {avgQuality}/5
            </div>
            <div className="stat-card-label">Avg Sleep Quality</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0,230,118,0.12)' }}>📊</div>
            <div className="stat-card-value" style={{ background: 'var(--gradient-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {history.length}
            </div>
            <div className="stat-card-label">Days Tracked</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0,212,255,0.12)' }}>🎯</div>
            <div className="stat-card-value" style={{ background: 'var(--gradient-blue)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {history.filter(s => s.sleepHours >= 7).length}
            </div>
            <div className="stat-card-label">Good Sleep Days (≥7h)</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📈 Sleep History (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                formatter={(val, name) => [name === 'hours' ? `${val}h` : `${val}/5`, name === 'hours' ? 'Sleep' : 'Quality']}
              />
              <ReferenceLine y={7} stroke="var(--accent-green)" strokeDasharray="4 4" label={{ value: '7h goal', fill: 'var(--accent-green)', fontSize: 11 }} />
              <Bar dataKey="hours" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} name="hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sleep Log List */}
      <div className="glass-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📋 Sleep Log</h3>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🌙</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Sleep Data</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Start tracking your sleep to get AI recovery suggestions.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowLog(true)}>Log Tonight's Sleep</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map(log => (
              <div key={log.id} className="glass-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                  <div style={{ fontSize: 28 }}>{QUALITY_EMOJIS[log.quality]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {new Date(log.logDate).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {log.sleepHours}h · {QUALITY_LABELS[log.quality]} sleep
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} fill={i <= log.quality ? QUALITY_COLORS[log.quality] : 'transparent'} color={i <= log.quality ? QUALITY_COLORS[log.quality] : 'var(--text-muted)'} />
                    ))}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{expandedId === log.id ? '▲' : '▼'}</span>
                </div>
                {expandedId === log.id && log.aiRecoverySuggestion && (
                  <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(123,97,255,0.08)', borderRadius: 10, border: '1px solid rgba(123,97,255,0.2)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 8 }}>🤖 AI Recovery Suggestion</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{log.aiRecoverySuggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Modal */}
      {showLog && (
        <div className="modal-overlay" onClick={() => setShowLog(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">😴 Log Sleep</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLog(false)}>✕</button>
            </div>
            <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Hours Slept</label>
                <input type="number" step="0.5" className="form-input" placeholder="e.g. 7.5" min="1" max="16" required
                  value={form.sleepHours} onChange={e => setForm(p => ({ ...p, sleepHours: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Sleep Quality</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  {[1,2,3,4,5].map(q => (
                    <button
                      key={q} type="button"
                      className={`quality-dot ${form.quality === q ? `active-${q}` : ''}`}
                      onClick={() => setForm(p => ({ ...p, quality: q }))}
                      title={QUALITY_LABELS[q]}
                    >
                      {QUALITY_EMOJIS[q]}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Selected: {QUALITY_LABELS[form.quality]}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="e.g. Slept early, no disturbances"
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLog(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving…' : '😴 Log & Get AI Tip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
