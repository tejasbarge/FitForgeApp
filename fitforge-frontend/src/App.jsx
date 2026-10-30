import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import NutritionPage from './pages/NutritionPage';
import WorkoutPage   from './pages/WorkoutPage';
import ChatPage      from './pages/ChatPage';
import SleepPage     from './pages/SleepPage';
import RecipePage    from './pages/RecipePage';
import ProgressPage  from './pages/ProgressPage';
import ProfilePage   from './pages/ProfilePage';

import AppLayout from './components/common/AppLayout';

function PrivateRoute({ children, allowIncomplete = false }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowIncomplete && !user?.profileComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  return isAuthenticated
    ? <Navigate to={user?.profileComplete ? '/dashboard' : '/onboarding'} replace />
    : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/onboarding" element={<PrivateRoute allowIncomplete><OnboardingPage /></PrivateRoute>} />
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/nutrition"  element={<NutritionPage />} />
        <Route path="/workout"    element={<WorkoutPage />} />
        <Route path="/chat"       element={<ChatPage />} />
        <Route path="/sleep"      element={<SleepPage />} />
        <Route path="/recipes"    element={<RecipePage />} />
        <Route path="/progress"   element={<ProgressPage />} />
        <Route path="/profile"    element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast',
            duration: 3500,
            style: {
              background: 'rgba(10,22,40,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
