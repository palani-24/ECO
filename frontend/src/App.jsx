import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

// User Pages
const UserDashboard = React.lazy(() => import('./pages/user/UserDashboard'));
const SchedulePickup = React.lazy(() => import('./pages/user/SchedulePickup'));
const MyPickups = React.lazy(() => import('./pages/user/MyPickups'));
const RedeemRewards = React.lazy(() => import('./pages/user/RedeemRewards'));
const EcoStore = React.lazy(() => import('./pages/user/EcoStore'));
const Profile = React.lazy(() => import('./pages/user/Profile'));
const Leaderboard = React.lazy(() => import('./pages/user/Leaderboard'));
const CommunityChallenges = React.lazy(() => import('./pages/user/CommunityChallenges'));
const ESGCorporatePortal = React.lazy(() => import('./pages/user/ESGCorporatePortal'));

// Driver Pages
const DriverDashboard = React.lazy(() => import('./pages/driver/DriverDashboard'));
const DriverAssignedPickups = React.lazy(() => import('./pages/driver/DriverAssignedPickups'));
const DriverPickupHistory = React.lazy(() => import('./pages/driver/DriverPickupHistory'));
const DriverEarnings = React.lazy(() => import('./pages/driver/DriverEarnings'));
const DriverGatePass = React.lazy(() => import('./pages/driver/DriverGatePass'));
const DriverQualityAudit = React.lazy(() => import('./pages/driver/DriverQualityAudit'));
const DriverBatteryTelematics = React.lazy(() => import('./pages/driver/DriverBatteryTelematics'));
const DriverRoadHazards = React.lazy(() => import('./pages/driver/DriverRoadHazards'));
const DriverShifts = React.lazy(() => import('./pages/driver/DriverShifts'));
const DriverEquipment = React.lazy(() => import('./pages/driver/DriverEquipment'));
const DriverSettings = React.lazy(() => import('./pages/driver/DriverSettings'));
const DriverDocuments = React.lazy(() => import('./pages/driver/DriverDocuments'));
const DriverRewards = React.lazy(() => import('./pages/driver/DriverRewards'));
const DriverNotifications = React.lazy(() => import('./pages/driver/DriverNotifications'));
const DriverNavigationPage = React.lazy(() => import('./pages/driver/DriverNavigationPage'));
const DriverSecurity = React.lazy(() => import('./pages/driver/DriverSecurity'));
const DriverSupport = React.lazy(() => import('./pages/driver/DriverSupport'));
const DriverProfilePage = React.lazy(() => import('./pages/driver/DriverProfilePage'));
const DriverVehiclePage = React.lazy(() => import('./pages/driver/DriverVehiclePage'));

// Admin Pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminDrivers = React.lazy(() => import('./pages/admin/AdminDrivers'));
const AdminPickups = React.lazy(() => import('./pages/admin/AdminPickups'));
const AdminCoupons = React.lazy(() => import('./pages/admin/AdminCoupons'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminSupportPage = React.lazy(() => import('./pages/admin/AdminSupportPage'));

// Municipality & Grievance Pages
const MunicipalityDashboard = React.lazy(() => import('./pages/municipality/MunicipalityDashboard'));
const MunicipalityHeatmap = React.lazy(() => import('./pages/municipality/MunicipalityHeatmap'));
const MunicipalityGrievances = React.lazy(() => import('./pages/municipality/MunicipalityGrievances'));
const ReportIllegalDump = React.lazy(() => import('./pages/user/ReportIllegalDump'));

const SupportChatWidget = React.lazy(() => import('./components/SupportChatWidget'));
import PWAInstallBanner from './components/PWAInstallBanner';

function App() {
  return (
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
  );
}

export default App;

