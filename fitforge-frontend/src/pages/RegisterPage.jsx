import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { getAuthErrorMessage } from '../utils/authError';
import AuthHeader from '../components/common/AuthHeader';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthColor = ['', '#FF3B3B', '#FF6B35', '#FFB800', '#00E676'];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (!res.data?.token) {
        toast.error('Account creation returned no sign-in token. Please try again.');
        return;
      }
      login(res.data.token, {
        id: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        profileComplete: res.data.profileComplete,
      });
      toast.success('Account created! Let\'s set up your profile 💪');
      navigate('/onboarding');
    } catch (err) {
      toast.error(getAuthErrorMessage(err, 'Account could not be created. Check the form and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthHeader />
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,97,255,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,0,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="auth-card auth-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-logo">
          <div className="logo-icon">🔥</div>
          <span className="logo-text" style={{ fontSize: 24, fontWeight: 800 }}>Fit<span style={{ color: 'var(--accent-orange)' }}>Forge</span></span>
        </div>

        <h1 className="auth-title">Start your journey</h1>
        <p className="auth-subtitle">Create your account and transform your health</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="name" type="text" className="form-input" placeholder="John Doe"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" type={showPass ? 'text' : 'password'} className="form-input"
                placeholder="Min. 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 44 }} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: strength >= i ? strengthColor[strength] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthColor[strength], fontWeight: 600 }}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input id="confirm-password" type="password" className="form-input"
                placeholder="Re-enter password" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                style={{ paddingRight: 44 }} required />
              {form.confirmPassword && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <CheckCircle size={18} color={form.password === form.confirmPassword ? 'var(--accent-green)' : 'var(--accent-red)'} />
                </div>
              )}
            </div>
          </div>

          <button id="register-btn" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account…' : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
