import { NavLink } from "react-router-dom";
import {
  Home,
  Activity,
  CalendarDays,
  BarChart3,
  User,
  CircleHelp,
  LogOut,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Start Assessment", icon: Activity, path: "/start" },
  { name: "Session History", icon: CalendarDays, path: "/session-history" },
  { name: "Progress", icon: BarChart3, path: "/progress" },
  { name: "Profile", icon: User, path: "/profile" },
  { name: "Help & Support", icon: CircleHelp, path: "/help-support"},
];
export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("stingrayUser");
    localStorage.removeItem("activeSession");
    localStorage.removeItem("completedSession");

    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-mark">◆</span>
        <span>STINGRAY</span>
      </div>

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

      <div className="sidebar-footer">
        <div className="patient-id-card">
          <p>STINGRAY ID</p>

          <div className="patient-id-row">
            <span>STG-00124</span>
            <Copy size={18} />
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}