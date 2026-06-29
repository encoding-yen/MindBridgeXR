import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import TopBar from "./components/layout/TopBar.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import StartInstructionsPage from "./pages/StartInstructionsPage.jsx";
import LiveExercisePage from "./pages/LiveExercisePage.jsx";
import SessionHistoryPage from "./pages/SessionHistoryPage.jsx";
import SessionReportPage from "./pages/SessionReportPage.jsx";
import ProgressHistoryPage from "./pages/ProgressHistoryPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import HelpSupportPage from "./pages/HelpSupportPage";

export default function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/start" element={<StartInstructionsPage />} />
            <Route path="/live-session" element={<LiveExercisePage />} />
            <Route path="/session-history" element={<SessionHistoryPage />} />
            <Route path="/session-report" element={<SessionReportPage />} />
            <Route path="/progress" element={<ProgressHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}