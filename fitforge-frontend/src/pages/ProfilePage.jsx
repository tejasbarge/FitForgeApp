import React, { useEffect, useState } from 'react';
import { profileAPI } from '../api';
import toast from 'react-hot-toast';
import { Save, UserRound } from 'lucide-react';

const INITIAL_FORM = {
  age: '',
  gender: 'OTHER',
  heightCm: '',
  weightKg: '',
  targetWeightKg: '',
  fitnessGoal: 'MAINTENANCE',
  activityLevel: 'SEDENTARY',
  dietType: 'VEGETARIAN',
  fitnessLevel: 'BEGINNER',
  availableEquipment: 'BODYWEIGHT',
  workoutSplit: 'FULL_BODY',
  workoutDurationMin: 45,
  medicalConditions: '',
  allergies: '',
};

const OPTIONS = {
  gender: [['MALE', 'Male'], ['FEMALE', 'Female'], ['OTHER', 'Other']],
  fitnessGoal: [['WEIGHT_LOSS', 'Weight loss'], ['MUSCLE_GAIN', 'Muscle gain'], ['STRENGTH', 'Strength'], ['MAINTENANCE', 'General fitness'], ['ENDURANCE', 'Endurance']],
  workoutSplit: [['FULL_BODY', 'Full Body (3 days/week)'], ['UPPER_LOWER', 'Upper / Lower (4 days/week)'], ['PUSH_PULL_LEGS', 'Push / Pull / Legs (6 days/week)']],
  activityLevel: [['SEDENTARY', 'Sedentary'], ['LIGHTLY_ACTIVE', 'Lightly active'], ['MODERATELY_ACTIVE', 'Moderately active'], ['VERY_ACTIVE', 'Very active'], ['EXTRA_ACTIVE', 'Extra active']],
  dietType: [['VEGETARIAN', 'Vegetarian'], ['VEGAN', 'Vegan'], ['NON_VEG', 'Non-vegetarian'], ['HIGH_PROTEIN', 'High protein'], ['LOW_CARB', 'Low carb']],
  fitnessLevel: [['BEGINNER', 'Beginner'], ['INTERMEDIATE', 'Intermediate'], ['ADVANCED', 'Advanced']],
};

function SelectField({ label, value, options, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-select" value={value || ''} onChange={event => onChange(event.target.value)}>
        {options.map(([option, title]) => <option key={option} value={option}>{title}</option>)}
      </select>
    </div>
  );
}

function TextField({ label, value, onChange, type = 'text', ...props }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={value ?? ''} onChange={event => onChange(event.target.value)} {...props} />
    </div>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  useEffect(() => {
    profileAPI.get()
      .then(response => setForm(current => ({ ...current, ...response.data })))
      .catch(error => toast.error(error.response?.data?.message || 'Could not load your profile'))
      .finally(() => setLoading(false));
  }, []);

  const save = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      await profileAPI.save({
        ...form,
        age: Number(form.age),
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        targetWeightKg: Number(form.targetWeightKg || form.weightKg),
        workoutDurationMin: Number(form.workoutDurationMin),
      });
      toast.success('Profile changes saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save your profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="glass-card profile-loading">Loading your profile…</div>;

  return (
    <div className="animate-fade profile-page">
      <header className="page-header">
        <div className="profile-heading-icon"><UserRound size={22} /></div>
        <div>
          <h1 className="page-title"><span>Your Profile</span></h1>
          <p className="page-subtitle">Edit your health details and preferences used to personalize your plans.</p>
        </div>
      </header>
      <form className="glass-card profile-form" onSubmit={save}>
        <section className="profile-section">
          <div className="profile-section-heading">
            <h2>About you</h2><p>Used to calculate your daily nutrition targets.</p>
          </div>
          <div className="profile-fields">
            <TextField label="Age" type="number" min="10" max="100" value={form.age} onChange={value => update('age', value)} required />
            <SelectField label="Gender" value={form.gender} options={OPTIONS.gender} onChange={value => update('gender', value)} />
            <TextField label="Height (cm)" type="number" min="100" max="250" step="0.1" value={form.heightCm} onChange={value => update('heightCm', value)} required />
            <TextField label="Current weight (kg)" type="number" min="30" max="300" step="0.1" value={form.weightKg} onChange={value => update('weightKg', value)} required />
            <TextField label="Target weight (kg)" type="number" min="30" max="300" step="0.1" value={form.targetWeightKg} onChange={value => update('targetWeightKg', value)} />
          </div>
        </section>
        <section className="profile-section">
          <div className="profile-section-heading">
            <h2>Goals & routine</h2><p>These preferences shape your meal and workout plans.</p>
          </div>
          <div className="profile-fields">
            <SelectField label="Fitness goal" value={form.fitnessGoal} options={OPTIONS.fitnessGoal} onChange={value => update('fitnessGoal', value)} />
            <SelectField label="Activity level" value={form.activityLevel} options={OPTIONS.activityLevel} onChange={value => update('activityLevel', value)} />
            <SelectField label="Fitness level" value={form.fitnessLevel} options={OPTIONS.fitnessLevel} onChange={value => update('fitnessLevel', value)} />
            <SelectField label="Workout split" value={form.workoutSplit} options={OPTIONS.workoutSplit} onChange={value => update('workoutSplit', value)} />
            <SelectField label="Diet preference" value={form.dietType} options={OPTIONS.dietType} onChange={value => update('dietType', value)} />
            <TextField label="Available equipment" value={form.availableEquipment} onChange={value => update('availableEquipment', value)} placeholder="Bodyweight, dumbbells…" />
            <TextField label="Workout duration (minutes)" type="number" min="10" max="180" value={form.workoutDurationMin} onChange={value => update('workoutDurationMin', value)} required />
          </div>
        </section>
        <section className="profile-section">
          <div className="profile-section-heading">
            <h2>Restrictions</h2><p>List any physical restrictions and food allergies.</p>
          </div>
          <div className="profile-fields">
            <TextField label="Physical restrictions or medical conditions" value={form.medicalConditions} onChange={value => update('medicalConditions', value)} placeholder="e.g. knee pain, asthma" />
            <TextField label="Food allergies" value={form.allergies} onChange={value => update('allergies', value)} placeholder="e.g. peanuts, dairy" />
          </div>
        </section>
        <div className="profile-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving changes…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
