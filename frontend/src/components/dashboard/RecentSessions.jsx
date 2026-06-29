import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecentSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadRecentSessions();
  }, []);

  async function loadRecentSessions() {
    try {
      const activeUser = JSON.parse(
        localStorage.getItem("stingrayUser")
      );

      if (!activeUser) return;

      const response = await fetch(
        `http://127.0.0.1:8000/sessions/user/${activeUser.id}`
      );

      const data = await response.json();

      const completedSessions = data
        .filter((session) => session.status === "completed")
        .slice(0, 5);

      setSessions(completedSessions);
    } catch (error) {
      console.error("Recent sessions error:", error);
    }
  }

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Recent Sessions</h2>

        <button onClick={() => navigate("/session-history")}>
          View All
        </button>
      </div>

      <div className="recent-session-list">
        {sessions.length === 0 ? (
          <p>No completed sessions found.</p>
        ) : (
          sessions.map((session) => (
            <div
              className="recent-session-row"
              key={session.id}
            >
              <span>
                {new Date(session.started_at).toLocaleDateString()}
              </span>

              <span>
                {session.total_score} / {session.max_score}
              </span>

              <span
                className={`risk-text ${session.risk_level?.toLowerCase()}`}
              >
                {session.risk_level}
              </span>

              <span>›</span>
            </div>
          ))
        )}
      </div>

      <button
        className="secondary-button"
        onClick={() => navigate("/session-history")}
      >
        View Session History
      </button>
    </div>
  );
}