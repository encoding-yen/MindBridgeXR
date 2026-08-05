import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Eye, Clock, Filter } from "lucide-react";

export default function SessionHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const activeUser = JSON.parse(localStorage.getItem("stingrayUser"));

      if (!activeUser || !activeUser.id) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/sessions/user/${activeUser.id}`
      );

      const data = await response.json();

      const completedSessions = data.filter(
        (session) => session.status === "completed"
      );

      setSessions(completedSessions);
    } catch (error) {
      console.error("Session history error:", error);
    }
  }

  function openReport(session) {
    localStorage.setItem("selectedReportSession", JSON.stringify(session));
    localStorage.setItem("completedSession", JSON.stringify(session));
    navigate("/session-report");
  }

  return (
    <section className="history-page">
      <header className="page-header">
        <div>
          <h1>Session History</h1>
          <p>View and review all your past assessment sessions.</p>
        </div>
      </header>

      <div className="history-filter-card">
        <div>
          <p>Date Range</p>
          <strong>{getDateRangeText(sessions)}</strong>
        </div>

        <div>
          <p>Risk Level</p>
          <strong>All</strong>
        </div>

        <div>
          <p>Sort By</p>
          <strong>Most Recent</strong>
        </div>

        <Filter size={24} />
      </div>

      <div className="history-table-card">
        <div className="history-table-header">
          <span>Date</span>
          <span>Time</span>
          <span>Score</span>
          <span>Risk Level</span>
          <span>Duration</span>
          <span>Action</span>
        </div>

        {sessions.length === 0 ? (
          <div className="history-empty-state">No completed sessions found.</div>
        ) : (
          sessions.map((session) => (
            <div className="history-table-row" key={session.id}>
              <div className="history-date">
                <CalendarDays size={22} />
                <div>
                  <strong>{formatDate(session.started_at)}</strong>
                  <span>{formatDay(session.started_at)}</span>
                </div>
              </div>

              <span>{formatTime(session.started_at)}</span>

              <div className="score-cell">
                <strong className="score-blue">
                  {session.total_score} / {session.max_score}
                </strong>

                <span className="score-percent">
                  {Math.round(session.score_percentage)}%
                </span>
              </div>

              <span className={`risk-pill ${session.risk_level?.toLowerCase()}`}>
                {session.risk_level}
              </span>

              <span>
                <Clock size={16} /> {formatDuration(session.duration_seconds)}
              </span>

              <button onClick={() => openReport(session)}>
                <Eye size={16} />
                View Report
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDay(value) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds) {
  if (!seconds) return "0 sec";
  if (seconds < 60) return `${seconds} sec`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return remainingSeconds ? `${minutes} min ${remainingSeconds} sec` : `${minutes} min`;
}

function getDateRangeText(sessions) {
  if (!sessions.length) return "No sessions yet";

  const dates = sessions.map((session) => new Date(session.started_at));
  const newest = new Date(Math.max(...dates));
  const oldest = new Date(Math.min(...dates));

  return `${formatDate(oldest)} - ${formatDate(newest)}`;
}