import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Brain, Heart, Moon, ChefHat, TrendingUp, Droplets } from 'lucide-react';

const features = [
  { icon: '🤖', title: 'FitAI Chat',         desc: 'Real-time coaching from Gemini AI. Ask anything about fitness, nutrition, or recovery.', color: '#00D4FF' },
  { icon: '🍽️', title: 'Smart Meal Plans',   desc: 'Personalized AI meal plans based on your goals, diet type, and calorie targets.', color: '#FFB800' },
  { icon: '💪', title: 'Adaptive Workouts',  desc: 'Exercise plans tailored to your fitness level with medical condition awareness.', color: '#FF4D00' },
  { icon: '🍳', title: 'Recipe Finder',      desc: 'Turn your fridge ingredients into healthy, delicious recipes in seconds.', color: '#00E676' },
  { icon: '😴', title: 'Sleep Tracking',     desc: 'Log sleep quality and receive AI-generated recovery & performance tips.', color: '#7B61FF' },
  { icon: '📈', title: 'Progress Analytics', desc: 'Visual weight & BMI charts, streak tracking, and PDF progress reports.', color: '#FF3B3B' },
  { icon: '💧', title: 'Hydration Tracker',  desc: 'Daily water intake tracking with visual progress and reminders.', color: '#00BCD4' },
  { icon: '🎯', title: 'Goal Tracking',      desc: 'Set weight loss, muscle gain, or maintenance goals with intelligent calorie targeting.', color: '#FF6B35' },
];

const stats = [
  { value: '2M+',    label: 'Active Users' },
  { value: '50M+',   label: 'Meals Logged' },
  { value: '98%',    label: 'Satisfaction Rate' },
  { value: 'Gemini', label: 'AI Powered' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon">🔥</div>
          <span style={{ fontSize: 20, fontWeight: 800 }}>Fit<span style={{ color: 'var(--accent-orange)' }}>Forge</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login"    className="btn btn-ghost">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" style={{ paddingTop: 120 }}>
        {/* Background glows */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,0,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,97,255,0.04) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </div>

        <div className="hero-badge">
          <Zap size={12} /> Powered by Google Gemini AI
        </div>

        <h1 className="hero-title">
          Your AI-Powered<br />
          <span className="gradient-text">Fitness Revolution</span>
        </h1>

        <p className="hero-subtitle">
          Get personalized meal plans, adaptive workouts, real-time AI coaching, 
          and complete health analytics — all in one beautiful platform.
        </p>

        <div className="hero-buttons">
          <Link to="/register" id="hero-cta" className="btn btn-primary btn-lg" style={{ padding: '16px 36px', fontSize: 17 }}>
            Start for Free <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg" style={{ padding: '16px 32px', fontSize: 17 }}>
            Sign In
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 48, marginTop: 72, flexWrap: 'wrap', justifyContent: 'center' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="badge badge-orange" style={{ marginBottom: 16 }}>✨ Features</div>
            <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 16 }}>
              Everything you need to<br /><span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>transform your health</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 600, margin: '0 auto' }}>
              FitForge combines cutting-edge AI with beautiful design to make your fitness journey effortless and enjoyable.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: `${f.color}15` }}>
                  <span style={{ fontSize: 26 }}>{f.icon}</span>
                </div>
                <h3 className="feature-title" style={{ color: f.color }}>{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ padding: '60px 40px', background: 'rgba(255,77,0,0.05)', border: '1px solid rgba(255,77,0,0.2)', borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(255,77,0,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>Ready to Forge Your Best Self?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
              Join thousands of users who are already transforming their lives with AI-powered fitness coaching.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 40px', fontSize: 17 }}>
              Start Your Journey — It's Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <p>© 2024 FitForge · AI-Powered Fitness Platform · Built with ❤️ and Google Gemini AI</p>
      </footer>
    </div>
  );
}
