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
import { useAuth } from './AuthContext';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/investors" element={<InvestorsDirectoryPage />} />
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
              <ProfilePage />
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
  );
};
