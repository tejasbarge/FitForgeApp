import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { getAuthErrorMessage } from '../utils/authError';
import AuthHeader from '../components/common/AuthHeader';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Flame, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ ...form, email: form.email.trim().toLowerCase() });
      const user = {
        id: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        profileComplete: res.data.profileComplete,
      };
      login(res.data.token, user);
      toast.success('Welcome back! 🔥');
      navigate(user.profileComplete ? '/dashboard' : '/onboarding');
    } catch (err) {
      toast.error(getAuthErrorMessage(err, 'Could not sign in. Check your details and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthHeader />
      {/* Animated background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,0,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="auth-card auth-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-logo">
          <div className="logo-icon">🔥</div>
          <span className="logo-text" style={{ fontSize: 24, fontWeight: 800 }}>Fit<span style={{ color: 'var(--accent-orange)' }}>Forge</span></span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue your fitness journey</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 44 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Signing in…' : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          New to FitForge?{' '}
          <Link to="/register" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
