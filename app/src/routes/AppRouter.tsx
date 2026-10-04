// src/router/AppRouter.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/App";
import { ROUTES } from "@/constants/routes";

// Public pages
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import LogoutPage from "@/pages/LogoutPage";
import FAQAndChatbot from "@/pages/FAQAndChatbotPage";

// Dashboard pages
import DashboardPage from "@/pages/DashboardPage";
import ProfilePage from "@/pages/ProfilePage";
import ResumePage from "@/pages/ResumePage";

// Resume builder pages
import ResumeImportPage from "@/pages/Resume/ResumeImportPage";
import ResumeFromProfilePage from "@/pages/Resume/ResumeFromProfilePage";
import ResumeScratchPageNew from "@/pages/Resume/ResumeScratchPageNew";
import ResumeEditPage from "@/pages/Resume/ResumeEditPage";
import ResumeBuilderPage from "@/pages/Resume/ResumeBuilderPage";

// Other dashboard pages
import SearchAndFilterPage from "@/pages/SearchPage";
import ProfMetadatPage from "@/pages/ProfMetadataPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import EmailSOPPage from "@/pages/EmailSOPPage";
import EmailSOPEditPage from "@/pages/EmailSOPEditPage";

// Routes
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";
import NotificationsPage from "@/pages/NotificationsPage";
import NotificationDetailPage from "@/pages/notificationDetailPage";

// Test and NotImplemented pages
import SimplePage from "@/pages/SimplePage";
import TestPage from "@/pages/TestPage";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      // Default → login
      { path: ROUTES.HOME, element: <Navigate to={ROUTES.LOGIN} replace /> },

      // Test Page
      { path: ROUTES.TEST, element: <TestPage /> },

      // ------------------ PUBLIC ROUTES ------------------
      {
        path: ROUTES.LOGIN,
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.SIGNUP,
        element: (
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.FAQ,
        element: <FAQAndChatbot />
      },

      // ------------------ PROTECTED ROUTES ------------------
      {
        path: ROUTES.DASHBOARD,
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },

      {
        path: ROUTES.DASHBOARD_SEARCH,
        element: <SearchAndFilterPage />
      },

      // Professor Metadata Page (later must add variable prof-id - URL params)
      {
        path: ROUTES.DASHBOARD_PROFESSOR_TEMPLATE,
        element: (
          <ProtectedRoute>
            <ProfMetadatPage />
          </ProtectedRoute>
        ),
      },

      // Chatbot
      {
        path: ROUTES.DASHBOARD_CHATBOT,
        element: <Navigate to={ROUTES.FAQ} replace />,
      },

      // Resume maker list page
      {
        path: ROUTES.DASHBOARD_RESUME_MAKER,
        element: (
          <ProtectedRoute>
            <ResumePage />
          </ProtectedRoute>
        ),
      },

      {
        path: ROUTES.DASHBOARD_NOTIFICATION_DETAIL_TEMPLATE,
        element: (
          <ProtectedRoute>
            <NotificationDetailPage />
          </ProtectedRoute>
        ),
      },

      {
        path: ROUTES.DASHBOARD_NOTIFICATIONS,
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },

      // Resume builder sub-routes
      {
        path: ROUTES.DASHBOARD_RESUME_MAKER_NEW_IMPORT,
        element: (
          <ProtectedRoute>
            <ResumeImportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DASHBOARD_RESUME_MAKER_NEW_FROM_PROFILE,
        element: (
          <ProtectedRoute>
            <ResumeFromProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DASHBOARD_RESUME_MAKER_NEW_SCRATCH,
        element: (
          <ProtectedRoute>
            <ResumeScratchPageNew />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DASHBOARD_RESUME_EDIT_TEMPLATE,
        element: (
          <ProtectedRoute>
            <ResumeEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DASHBOARD_RESUME_BUILDER,
        element: (
          <ProtectedRoute>
            <ResumeBuilderPage />
          </ProtectedRoute>
        ),
      },

      // Email & SOP page
      {
        path: ROUTES.DASHBOARD_EMAIL_SOP,
        element: (
          <ProtectedRoute>
            <EmailSOPPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DASHBOARD_EMAIL_SOP_EDIT_TEMPLATE,
        element: (
          <ProtectedRoute>
            <EmailSOPEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DASHBOARD_STATS,
        element: (
          <ProtectedRoute>
            <SimplePage title="Stats" />
          </ProtectedRoute>
        ),
      },

      // Profile
      {
        path: ROUTES.DASHBOARD_PROFILE,
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      // Subscription / Plans
      {
        path: ROUTES.DASHBOARD_PLANS,
        element: (
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        ),
      },


      // Favorites
      {
        path: ROUTES.DASHBOARD_FAVORITES,
        element: (
          <ProtectedRoute>
            <SimplePage title="Favorites" />
          </ProtectedRoute>
        ),
      },

      // History
      {
        path: ROUTES.DASHBOARD_HISTORY,
        element: (
          <ProtectedRoute>
            <SimplePage title="History" />
          </ProtectedRoute>
        ),
      },

      // Settings
      {
        path: ROUTES.DASHBOARD_SETTINGS,
        element: (
          <ProtectedRoute>
            <SimplePage title="Settings" />
          </ProtectedRoute>
        ),
      },

      // Support page (I assume it should be protected)
      {
        path: ROUTES.SUPPORT,
        element: (
          <ProtectedRoute>
            <SimplePage title="Support" />
          </ProtectedRoute>
        ),
      },

      // Logout
      {
        path: ROUTES.LOGOUT,
        element: <LogoutPage />,
      },

      // ------------------ OLD ROUTE REDIRECTS ------------------
      { path: ROUTES.LEGACY_PROFILE, element: <Navigate to={ROUTES.DASHBOARD_PROFILE} replace /> },
      { path: ROUTES.LEGACY_SEARCH, element: <Navigate to={ROUTES.DASHBOARD_SEARCH} replace /> },
      { path: ROUTES.LEGACY_CHATBOT, element: <Navigate to={ROUTES.FAQ} replace /> },

      // 404 → login
      { path: ROUTES.CATCH_ALL, element: <Navigate to={ROUTES.LOGIN} replace /> },
    ],
  },
]);
