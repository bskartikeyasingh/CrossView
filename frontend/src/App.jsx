import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EventDetailPage from './pages/EventDetailPage';

// Dashboard Pages
import DashboardOverview from './pages/DashboardOverview';
import AINewsFeedPage from './pages/AINewsFeedPage';
import ExploreNewsPage from './pages/ExploreNewsPage';
import PerspectiveComparisonPage from './pages/PerspectiveComparisonPage';
import EventTimelinesPage from './pages/EventTimelinesPage';
import ClaimAnalysisPage from './pages/ClaimAnalysisPage';
import AskCrossViewPage from './pages/AskCrossViewPage';
import BookmarksPage from './pages/BookmarksPage';
import SavedReportsPage from './pages/SavedReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Editorial Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/news-feed" element={<AINewsFeedPage />} />
          <Route path="/explore" element={<ExploreNewsPage />} />
          <Route path="/compare" element={<PerspectiveComparisonPage />} />
          <Route path="/timelines" element={<EventTimelinesPage />} />
          <Route path="/claims" element={<ClaimAnalysisPage />} />
          <Route path="/ask" element={<AskCrossViewPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Authenticated Intelligence Console */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="feed" element={<AINewsFeedPage />} />
          <Route path="explore" element={<ExploreNewsPage />} />
          <Route path="compare" element={<PerspectiveComparisonPage />} />
          <Route path="timelines" element={<EventTimelinesPage />} />
          <Route path="claims" element={<ClaimAnalysisPage />} />
          <Route path="ask" element={<AskCrossViewPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="saved-reports" element={<SavedReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
