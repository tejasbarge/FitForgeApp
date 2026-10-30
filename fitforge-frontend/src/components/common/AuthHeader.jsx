import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AuthHeader() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <header className="auth-header">
      <Link to="/" className="auth-header-brand">
        <span className="logo-icon">🔥</span>
        <span>Fit<span className="brand-accent">Forge</span></span>
      </Link>
      <div className="auth-header-action">
        <span>{isLogin ? 'New to FitForge?' : 'Already have an account?'}</span>
        <Link to={isLogin ? '/register' : '/login'} className="btn btn-secondary btn-sm">
          {isLogin ? 'Create account' : 'Sign in'}
        </Link>
      </div>
    </header>
  );
}
