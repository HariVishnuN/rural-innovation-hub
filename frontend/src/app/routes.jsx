import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import ProfilePage from '../features/profile/ProfilePage';
import DiscoverPage from '../features/discovery/DiscoverPage';
import InventionDetail from '../features/inventions/InventionDetail';
import InventionCreate from '../features/inventions/InventionCreate';
import ChatPage from '../features/messaging/ChatPage';
import BountiesPage from '../features/bounties/BountiesPage';
import WorkshopsPage from '../features/workshops/WorkshopsPage';
import MentorshipPage from '../features/mentorship/MentorshipPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import AdminPage from '../features/admin/AdminPage';
import IPResourcesPage from '../features/ip-resources/IPResourcesPage';
import CommercialOffersPage from '../features/offers/CommercialOffersPage';
import InvestorsDirectoryPage from '../features/investors/InvestorsDirectoryPage';
import OfficialsPortalPage from '../features/officials/OfficialsPortalPage';
import PatentServicesPage from '../features/patents/PatentServicesPage';
import { useAuth } from './AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-soft">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Verifying session...</p>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-soft">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Verifying admin access...</p>
      </div>
    );
  }
  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

export const AppRoutes = () => {
  return (
    <ErrorBoundary title="Navigation Error">
      <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/investors" element={<InvestorsDirectoryPage />} />
        <Route path="/patents" element={<PatentServicesPage />} />
        <Route path="/inventions/:id" element={<InventionDetail />} />
        <Route path="/bounties" element={<BountiesPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/mentorship" element={<MentorshipPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ip-resources" element={<IPResourcesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officials"
          element={
            <ProtectedRoute>
              <OfficialsPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <ProtectedRoute>
              <CommercialOffersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ErrorBoundary title="Failed to load Profile">
                <ProfilePage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventions/new"
          element={
            <ProtectedRoute>
              <InventionCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </ErrorBoundary>
  );
};
