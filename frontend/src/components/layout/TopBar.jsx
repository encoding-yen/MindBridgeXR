import { Bell, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* Top Bar */

export default function TopBar() {
  const navigate = useNavigate();

  return (
    <header className="top-bar">
      <div />

      <div className="top-bar-actions">
        {/* Notifications */}
        <button
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={22} />
          <span>3</span>
        </button>

        {/* Settings */}
        <button
          className="settings-button"
          aria-label="Settings"
          onClick={() => navigate("/settings")}
        >
          <Settings size={22} />
        </button>

        {/* Profile */}
        <button
          className="profile-button"
          aria-label="Profile"
          onClick={() => navigate("/profile")}
        >
          <User size={22} />
        </button>
      </div>
    </header>
  );
}