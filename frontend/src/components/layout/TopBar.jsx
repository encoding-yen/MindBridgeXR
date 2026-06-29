import { Bell, ChevronDown } from "lucide-react";

export default function TopBar() {
  return (
    <header className="top-bar">
      <div></div>

      <div className="top-bar-actions">
        <button className="notification-button">
          <Bell size={22} />
          <span>3</span>
        </button>

        <div className="top-user">
          <div className="top-user-avatar">M</div>

          <div className="top-user-info">
            <strong>Marwa</strong>
            <span>Member</span>
          </div>

          <ChevronDown size={18} />
        </div>
      </div>
    </header>
  );
}