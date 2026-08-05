import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Activity,
  CalendarDays,
  BarChart3,
  User,
  Settings,
  CircleHelp,
  LogOut,
  Copy,
} from "lucide-react";

import { useTheme } from "../../hooks/useTheme.js";
import logoDark from "../../assets/images/Logo-Dark.svg";
import logoLight from "../../assets/images/Logo-Light.svg";

const menuItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Start Assessment", icon: Activity, path: "/start" },
  { name: "Session History", icon: CalendarDays, path: "/session-history" },
  { name: "Progress", icon: BarChart3, path: "/progress" },
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Settings", icon: Settings, path: "/settings" },
  { name: "Help & Support", icon: CircleHelp, path: "/help-support" },
];

export default function Sidebar() {
  const { theme } = useTheme();   // call the hook, destructure the theme string
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("stingrayUser");
    localStorage.removeItem("activeSession");
    localStorage.removeItem("completedSession");

    navigate("/login");
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src={theme === "dark" ? logoLight : logoDark}
          alt="Stingray"
          className="sidebar-logo-mark"
        />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <Icon size={22} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="patient-id-card">
          <p>STINGRAY ID</p>

          <div className="patient-id-row">
            <span>STG-00124</span>
            <Copy size={18} />
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}