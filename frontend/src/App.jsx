import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

import ErrorBoundary from './components/ErrorBoundary';
import SupportChatWidget from './components/SupportChatWidget';
import PWAInstallBanner from './components/PWAInstallBanner';

// Resilient chunk loader with automatic cache busting on Vercel deployments
const lazyWithRetry = (componentImport) =>
  React.lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('Chunk loading failed, checking deployment update:', error);
      const isRetried = window.sessionStorage.getItem('chunk_retry_' + window.location.pathname);
      if (!isRetried) {
        window.sessionStorage.setItem('chunk_retry_' + window.location.pathname, '1');
        window.location.reload();
        return new Promise(() => {}); // hold suspense until reload triggers
      }
      throw error;
    }
  });

// Public Pages
const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Signup = lazyWithRetry(() => import('./pages/Signup'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'));

// User Pages
const UserDashboard = lazyWithRetry(() => import('./pages/user/UserDashboard'));
const SchedulePickup = lazyWithRetry(() => import('./pages/user/SchedulePickup'));
const MyPickups = lazyWithRetry(() => import('./pages/user/MyPickups'));
const RedeemRewards = lazyWithRetry(() => import('./pages/user/RedeemRewards'));
const EcoStore = lazyWithRetry(() => import('./pages/user/EcoStore'));
const Profile = lazyWithRetry(() => import('./pages/user/Profile'));
const Leaderboard = lazyWithRetry(() => import('./pages/user/Leaderboard'));
const CommunityChallenges = lazyWithRetry(() => import('./pages/user/CommunityChallenges'));
const ESGCorporatePortal = lazyWithRetry(() => import('./pages/user/ESGCorporatePortal'));

// Driver Pages
const DriverDashboard = lazyWithRetry(() => import('./pages/driver/DriverDashboard'));
const DriverAssignedPickups = lazyWithRetry(() => import('./pages/driver/DriverAssignedPickups'));
const DriverPickupHistory = lazyWithRetry(() => import('./pages/driver/DriverPickupHistory'));
const DriverEarnings = lazyWithRetry(() => import('./pages/driver/DriverEarnings'));
const DriverGatePass = lazyWithRetry(() => import('./pages/driver/DriverGatePass'));
const DriverQualityAudit = lazyWithRetry(() => import('./pages/driver/DriverQualityAudit'));
const DriverBatteryTelematics = lazyWithRetry(() => import('./pages/driver/DriverBatteryTelematics'));
const DriverRoadHazards = lazyWithRetry(() => import('./pages/driver/DriverRoadHazards'));
const DriverShifts = lazyWithRetry(() => import('./pages/driver/DriverShifts'));
const DriverEquipment = lazyWithRetry(() => import('./pages/driver/DriverEquipment'));
const DriverSettings = lazyWithRetry(() => import('./pages/driver/DriverSettings'));
const DriverDocuments = lazyWithRetry(() => import('./pages/driver/DriverDocuments'));
const DriverRewards = lazyWithRetry(() => import('./pages/driver/DriverRewards'));
const DriverNotifications = lazyWithRetry(() => import('./pages/driver/DriverNotifications'));
const DriverNavigationPage = lazyWithRetry(() => import('./pages/driver/DriverNavigationPage'));
const DriverSecurity = lazyWithRetry(() => import('./pages/driver/DriverSecurity'));
const DriverSupport = lazyWithRetry(() => import('./pages/driver/DriverSupport'));
const DriverProfilePage = lazyWithRetry(() => import('./pages/driver/DriverProfilePage'));
const DriverVehiclePage = lazyWithRetry(() => import('./pages/driver/DriverVehiclePage'));

// Admin Pages
const AdminLogin = lazyWithRetry(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazyWithRetry(() => import('./pages/admin/AdminUsers'));
const AdminDrivers = lazyWithRetry(() => import('./pages/admin/AdminDrivers'));
const AdminPickups = lazyWithRetry(() => import('./pages/admin/AdminPickups'));
const AdminCoupons = lazyWithRetry(() => import('./pages/admin/AdminCoupons'));
const AdminSettings = lazyWithRetry(() => import('./pages/admin/AdminSettings'));
const AdminSupportPage = lazyWithRetry(() => import('./pages/admin/AdminSupportPage'));

// Municipality & Grievance Pages
const MunicipalityDashboard = lazyWithRetry(() => import('./pages/municipality/MunicipalityDashboard'));
const MunicipalityHeatmap = lazyWithRetry(() => import('./pages/municipality/MunicipalityHeatmap'));
const MunicipalityGrievances = lazyWithRetry(() => import('./pages/municipality/MunicipalityGrievances'));
const ReportIllegalDump = lazyWithRetry(() => import('./pages/user/ReportIllegalDump'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <LanguageProvider>
              <SocketProvider>
                <SupportChatWidget />
                <PWAInstallBanner />
                <React.Suspense fallback={
                  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
                    <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-slate-400 tracking-wider">Loading EcoReward...</p>
                  </div>
                }>
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
                path="/esg-portal" 
                element={
                  <ProtectedRoute allowedRoles={['user', 'municipality', 'admin']}>
                    <ESGCorporatePortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/store" 
                element={
                  <ProtectedRoute allowedRoles={['user', 'municipality', 'admin']}>
                    <EcoStore />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute allowedRoles={['user', 'municipality', 'admin', 'driver']}>
                    <Leaderboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/challenges" 
                element={
                  <ProtectedRoute allowedRoles={['user', 'municipality', 'admin']}>
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

            {/* Citizen Grievance & Reporting Route */}
            <Route 
              path="/report-dump" 
              element={
                <ProtectedRoute allowedRoles={['user', 'admin', 'municipality']}>
                  <ReportIllegalDump />
                </ProtectedRoute>
              } 
            />

            {/* Municipality Executive & GIS Routes */}
            <Route 
              path="/municipality/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['municipality', 'admin']}>
                  <MunicipalityDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/municipality/heatmap" 
              element={
                <ProtectedRoute allowedRoles={['municipality', 'admin', 'user']}>
                  <MunicipalityHeatmap />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/municipality/grievances" 
              element={
                <ProtectedRoute allowedRoles={['municipality', 'admin']}>
                  <MunicipalityGrievances />
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
        </React.Suspense>
        </SocketProvider>
        </LanguageProvider>
      </AuthProvider>
    </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
