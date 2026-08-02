import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
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
import EcoStore from './pages/user/EcoStore';
import Profile from './pages/user/Profile';
import Leaderboard from './pages/user/Leaderboard';
import CommunityChallenges from './pages/user/CommunityChallenges';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverAssignedPickups from './pages/driver/DriverAssignedPickups';
import DriverPickupHistory from './pages/driver/DriverPickupHistory';
import DriverEarnings from './pages/driver/DriverEarnings';
import DriverGatePass from './pages/driver/DriverGatePass';
import DriverQualityAudit from './pages/driver/DriverQualityAudit';
import DriverBatteryTelematics from './pages/driver/DriverBatteryTelematics';
import DriverRoadHazards from './pages/driver/DriverRoadHazards';
import DriverShifts from './pages/driver/DriverShifts';
import DriverEquipment from './pages/driver/DriverEquipment';
import DriverSettings from './pages/driver/DriverSettings';
import DriverDocuments from './pages/driver/DriverDocuments';
import DriverRewards from './pages/driver/DriverRewards';
import DriverNotifications from './pages/driver/DriverNotifications';
import DriverNavigationPage from './pages/driver/DriverNavigationPage';
import DriverSecurity from './pages/driver/DriverSecurity';
import DriverSupport from './pages/driver/DriverSupport';
import DriverProfilePage from './pages/driver/DriverProfilePage';
import DriverVehiclePage from './pages/driver/DriverVehiclePage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminPickups from './pages/admin/AdminPickups';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import SupportChatWidget from './components/SupportChatWidget';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <SupportChatWidget />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
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
                path="/store" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <EcoStore />
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
                  <DriverAssignedPickups />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/history" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverPickupHistory />
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
            <Route 
              path="/driver/settings" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/vehicle" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverVehiclePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/documents" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDocuments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/rewards" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverRewards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/notifications" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverNotifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/navigation" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverNavigationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/profile" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/security" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverSecurity />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/support" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverSupport />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/gate-pass" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverGatePass />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/quality-audit" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverQualityAudit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/battery-telematics" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverBatteryTelematics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/road-hazards" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverRoadHazards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/shifts" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverShifts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/equipment" 
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverEquipment />
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
              path="/admin/support" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSupportPage />
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
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  </Router>
  );
}

export default App;

