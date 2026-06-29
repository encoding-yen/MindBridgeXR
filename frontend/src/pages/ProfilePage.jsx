import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  BadgeCheck,
  Trophy,
  ShieldCheck,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    sessions_completed: 0,
    latest_score: 0,
    best_score: 0,
    current_risk_level: "No Data",
    improvement: 0,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const activeUser = JSON.parse(localStorage.getItem("stingrayUser"));

      if (!activeUser) return;

      setUser(activeUser);

      const response = await fetch(
        `http://127.0.0.1:8000/sessions/stats/${activeUser.id}`
      );

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Profile loading error:", error);
    }
  }

  if (!user) {
    return (
      <section className="profile-page">
        <h1>My Profile</h1>
        <p>No user data found. Please log in again.</p>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <header className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your personal information and assessment statistics.</p>
        </div>
      </header>

      <div className="profile-grid">
        <div className="profile-card personal-info-card">
          <h2>Personal Information</h2>

          <div className="profile-content">
            <div className="profile-avatar-large">
              {getInitial(user.full_name)}
            </div>

            <div className="profile-info-grid">
              <ProfileInfo
                icon={<User />}
                label="Full Name"
                value={user.full_name || "N/A"}
              />

              <ProfileInfo
                icon={<Mail />}
                label="Email Address"
                value={user.email || "N/A"}
              />

              <ProfileInfo
                icon={<BadgeCheck />}
                label="STINGRAY ID"
                value={user.stingray_id || "N/A"}
              />

              <ProfileInfo
                icon={<Calendar />}
                label="Date of Birth"
                value={formatDate(user.date_of_birth)}
              />

              <ProfileInfo
                icon={<Ruler />}
                label="Height"
                value={user.height_cm ? `${user.height_cm} cm` : "N/A"}
              />

              <ProfileInfo
                icon={<Weight />}
                label="Weight"
                value={user.weight_kg ? `${user.weight_kg} kg` : "N/A"}
              />
            </div>
          </div>
        </div>

        <div className="profile-card stats-card">
          <h2>Assessment Statistics</h2>

          <div className="profile-stats-grid">
            <StatBox
              icon={<Calendar />}
              label="Sessions Completed"
              value={String(stats.sessions_completed || 0)}
            />

            <StatBox
              icon={<Trophy />}
              label="Best Score"
              value={`${stats.best_score || 0} / 21`}
            />

            <StatBox
              icon={<ShieldCheck />}
              label="Current Risk Level"
              value={stats.current_risk_level || "No Data"}
            />

            <StatBox
              icon={<Trophy />}
              label="Overall Improvement"
              value={formatImprovement(stats.improvement)}
            />
          </div>
        </div>
      </div>

      <div className="profile-card security-card">
        <h2>Security</h2>
        <p>Manage your account security and password.</p>
        <button className="secondary-button">Change Password</button>
      </div>
    </section>
  );
}

function ProfileInfo({ icon, label, value }) {
  return (
    <div className="profile-info-item">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div className="stat-box">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getInitial(name) {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
}

function formatDate(value) {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatImprovement(value) {
  const number = Number(value || 0);

  if (number > 0) return `+${number}`;
  return String(number);
}