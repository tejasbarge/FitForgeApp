import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const STEPS = ['Personal', 'Body', 'Goals', 'Lifestyle'];

const fitnessGoals = [
  { value: 'WEIGHT_LOSS',   emoji: '🔥', label: 'Lose Weight',    desc: 'Burn fat, lean out' },
  { value: 'MUSCLE_GAIN',   emoji: '💪', label: 'Build Muscle',   desc: 'Gain strength & size' },
  { value: 'STRENGTH',     emoji: '🏋️', label: 'Build Strength', desc: 'Get stronger with progressive training' },
  { value: 'MAINTENANCE',   emoji: '⚖️', label: 'Stay Fit',       desc: 'Maintain current shape' },
  { value: 'ATHLETIC',      emoji: '🏃', label: 'Improve Fitness', desc: 'Endurance & performance' },
];

const activityLevels = [
  { value: 'SEDENTARY',       label: 'Sedentary',       desc: 'Little or no exercise' },
  { value: 'LIGHTLY_ACTIVE',  label: 'Lightly Active',  desc: '1-3 days/week' },
  { value: 'MODERATELY_ACTIVE',label: 'Moderately Active',desc: '3-5 days/week' },
  { value: 'VERY_ACTIVE',     label: 'Very Active',     desc: '6-7 days/week' },
  { value: 'EXTRA_ACTIVE',    label: 'Extra Active',    desc: 'Athlete / physical job' },
];

const dietTypes = [
  { value: 'VEGETARIAN',  emoji: '🥦', label: 'Vegetarian' },
  { value: 'VEGAN',       emoji: '🌱', label: 'Vegan' },
  { value: 'NON_VEG',     emoji: '🍗', label: 'Non-Veg' },
  { value: 'KETO',        emoji: '🥑', label: 'Keto' },
  { value: 'PALEO',       emoji: '🥩', label: 'Paleo' },
];

const fitnessLevels = [
  { value: 'BEGINNER',     label: 'Beginner',     desc: 'Just starting out' },
  { value: 'INTERMEDIATE', label: 'Intermediate', desc: '6+ months experience' },
  { value: 'ADVANCED',     label: 'Advanced',     desc: '2+ years experience' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { markProfileComplete } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: '', gender: 'MALE',
    heightCm: '', weightKg: '', targetWeightKg: '',
    fitnessGoal: 'WEIGHT_LOSS',
    activityLevel: 'MODERATELY_ACTIVE',
    dietType: 'NON_VEG',
    fitnessLevel: 'BEGINNER',
    availableEquipment: 'BODYWEIGHT',
    workoutSplit: 'FULL_BODY',
    workoutDurationMin: '45',
    medicalConditions: '',
    allergies: '',
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await profileAPI.save({
        ...form,
        age: parseInt(form.age),
        heightCm: parseFloat(form.heightCm),
        weightKg: parseFloat(form.weightKg),
        targetWeightKg: parseFloat(form.targetWeightKg) || parseFloat(form.weightKg),
        workoutDurationMin: parseInt(form.workoutDurationMin, 10),
      });
      markProfileComplete();
      toast.success('Profile saved! Welcome to FitForge 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const SelectCard = ({ value, current, onClick, children }) => (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${current === value ? 'var(--accent-orange)' : 'var(--border-glass)'}`,
        background: current === value ? 'rgba(255,77,0,0.1)' : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {current === value && <CheckCircle size={16} color="var(--accent-orange)" style={{ flexShrink: 0 }} />}
      {children}
    </div>
  );

  const steps = [
    // Step 0: Personal
    <div key="personal" className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="form-group">
        <label className="form-label">Your Age</label>
        <input type="number" className="form-input" placeholder="e.g. 22" min="10" max="100"
          value={form.age} onChange={e => update('age', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Gender</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {['MALE','FEMALE','OTHER'].map(g => (
            <SelectCard key={g} value={g} current={form.gender} onClick={() => update('gender', g)}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{g.charAt(0) + g.slice(1).toLowerCase()}</span>
            </SelectCard>
          ))}
        </div>
      </div>
    </div>,

    // Step 1: Body
    <div key="body" className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="form-group">
        <label className="form-label">Height (cm)</label>
        <input type="number" className="form-input" placeholder="e.g. 175" min="100" max="250"
          value={form.heightCm} onChange={e => update('heightCm', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Current Weight (kg)</label>
        <input type="number" className="form-input" placeholder="e.g. 70" min="30" max="300"
          value={form.weightKg} onChange={e => update('weightKg', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Target Weight (kg)</label>
        <input type="number" className="form-input" placeholder="e.g. 65" min="30" max="300"
          value={form.targetWeightKg} onChange={e => update('targetWeightKg', e.target.value)} />
      </div>
    </div>,

    // Step 2: Goals
    <div key="goals" className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Primary Fitness Goal</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {fitnessGoals.map(g => (
            <SelectCard key={g.value} value={g.value} current={form.fitnessGoal} onClick={() => update('fitnessGoal', g.value)}>
              <div>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{g.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{g.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.desc}</div>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Diet Preference</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {dietTypes.map(d => (
            <SelectCard key={d.value} value={d.value} current={form.dietType} onClick={() => update('dietType', d.value)}>
              <span>{d.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{d.label}</span>
            </SelectCard>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Lifestyle
    <div key="lifestyle" className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Activity Level</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activityLevels.map(a => (
            <SelectCard key={a.value} value={a.value} current={form.activityLevel} onClick={() => update('activityLevel', a.value)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Fitness Level</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {fitnessLevels.map(l => (
            <SelectCard key={l.value} value={l.value} current={form.fitnessLevel} onClick={() => update('fitnessLevel', l.value)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{l.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.desc}</div>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Available Equipment</label>
        <input type="text" className="form-input" placeholder="e.g. Dumbbells, resistance bands, treadmill"
          value={form.availableEquipment} onChange={e => update('availableEquipment', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Workout Duration (minutes)</label>
        <input type="number" className="form-input" min="10" max="180"
          value={form.workoutDurationMin} onChange={e => update('workoutDurationMin', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Workout Split</label>
        <select className="form-select" value={form.workoutSplit}
          onChange={e => update('workoutSplit', e.target.value)}>
          <option value="FULL_BODY">Full Body (3 days/week)</option>
          <option value="UPPER_LOWER">Upper / Lower (4 days/week)</option>
          <option value="PUSH_PULL_LEGS">Push / Pull / Legs (6 days/week)</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Medical Conditions (optional)</label>
        <input type="text" className="form-input" placeholder="e.g. Diabetes, Hypertension, None"
          value={form.medicalConditions} onChange={e => update('medicalConditions', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Food Allergies (optional)</label>
        <input type="text" className="form-input" placeholder="e.g. Nuts, Dairy, None"
          value={form.allergies} onChange={e => update('allergies', e.target.value)} />
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, background: 'rgba(10,22,40,0.85)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-xl)', padding: 40, backdropFilter: 'blur(40px)', boxShadow: 'var(--shadow-elevated)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔥</div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Build Your Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Stepper */}
        <div className="step-indicator" style={{ marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`step-dot ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'completed' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step Label */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{STEPS[step]}</h2>
        </div>

        {/* Step Content */}
        {steps[step]}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button id="finish-onboarding" className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving…' : '🚀 Get Started'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
