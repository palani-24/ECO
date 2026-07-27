import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import SchedulePickup from './pages/user/SchedulePickup';
import MyPickups from './pages/user/MyPickups';
import RedeemRewards from './pages/user/RedeemRewards';
import Profile from './pages/user/Profile';
import Leaderboard from './pages/user/Leaderboard';
import CommunityChallenges from './pages/user/CommunityChallenges';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverEarnings from './pages/driver/DriverEarnings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminPickups from './pages/admin/AdminPickups';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/schedule-pickup" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <SchedulePickup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-pickups" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MyPickups />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/redeem" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <RedeemRewards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Leaderboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/challenges" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <CommunityChallenges />
                </ProtectedRoute>
              } 
            />

          {/* Driver Routes */}
          <Route 
            path="/driver" 
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/pickups" 
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/earnings" 
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverEarnings />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/drivers" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDrivers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/pickups" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPickups />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/coupons" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCoupons />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />

          {/* Shared Protected Routes (Accessible to any logged in user) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  </Router>
);
}

export default App;
