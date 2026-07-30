import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar.jsx";
import TopBar from "./components/layout/TopBar.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import PaywallPage from "./pages/PaymentWall.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import StartInstructionsPage from "./pages/StartInstructionsPage.jsx";
import LiveExercisePage from "./pages/LiveExercisePage.jsx";
import SessionHistoryPage from "./pages/SessionHistoryPage.jsx";
import SessionReportPage from "./pages/SessionReportPage.jsx";
import ProgressHistoryPage from "./pages/ProgressHistoryPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import HelpSupportPage from "./pages/HelpSupportPage";
import SettingsPage from "./pages/SettingsPage.jsx";

/* Main Application */

export default function App() {
  const location = useLocation();

  /* Public Marketing Page */

  const isLandingPage = location.pathname === "/";

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  /* Authentication Pages */

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  /* Paywall */

  const isPaywallPage = location.pathname === "/paywall";

  if (isPaywallPage) {
    return (
      <Routes>
        <Route path="/paywall" element={<PaywallPage />} />
      </Routes>
    );
  }

  /* Main Application Layout (gated behind payment) */

  const currentUser = JSON.parse(localStorage.getItem("stingrayUser") || "null");

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.has_paid) {
    return <Navigate to="/paywall" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="main-content">
          <Routes>
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardHome />} />

            {/* Exercise Pages */}
            <Route path="/start" element={<StartInstructionsPage />} />
            <Route path="/live-session" element={<LiveExercisePage />} />

            {/* Reports */}
            <Route path="/session-history" element={<SessionHistoryPage />} />
            <Route path="/session-report" element={<SessionReportPage />} />
            <Route path="/progress" element={<ProgressHistoryPage />} />

            {/* User */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Support */}
            <Route path="/help-support" element={<HelpSupportPage />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}