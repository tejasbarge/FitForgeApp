import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Utensils, Dumbbell, MessageCircle,
  Moon, ChefHat, TrendingUp, LogOut, UserRound
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nutrition',  icon: Utensils,       label: 'Nutrition' },
  { to: '/workout',    icon: Dumbbell,        label: 'Workout' },
  { to: '/chat',       icon: MessageCircle,   label: 'FitAI Chat' },
  { to: '/sleep',      icon: Moon,            label: 'Sleep' },
  { to: '/recipes',    icon: ChefHat,         label: 'Recipes' },
  { to: '/progress',   icon: TrendingUp,      label: 'Progress' },
  { to: '/profile',    icon: UserRound,       label: 'Profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'FF';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🔥</div>
          <span className="logo-text">Fit<span>Forge</span></span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main Menu</span>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-item-icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="user-info">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div className="user-email" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || ''}
              </div>
            </div>
          </NavLink>
          <button
            className="btn btn-ghost btn-full btn-sm"
            style={{ marginTop: 8, justifyContent: 'flex-start', gap: 8 }}
            onClick={handleLogout}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
