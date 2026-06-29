import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ProgressHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadProgressData();
  }, []);

  async function loadProgressData() {
    try {
      const activeUser = JSON.parse(localStorage.getItem("stingrayUser"));

      if (!activeUser?.id) return;

      const response = await fetch(
        `http://127.0.0.1:8000/sessions/user/${activeUser.id}`
      );

      const data = await response.json();

      const completedSessions = data
        .filter((session) => session.status === "completed")
        .reverse();

      setSessions(completedSessions);

      if (completedSessions.length > 0) {
        setSelectedDate(getDateKey(completedSessions[completedSessions.length - 1].started_at));
      }
    } catch (error) {
      console.error("Progress history error:", error);
    }
  }

  const dailyData = buildDailyData(sessions);
  const selectedDayData = sessions
    .filter((session) => getDateKey(session.started_at) === selectedDate)
    .map((session) => ({
      time: formatTime(session.started_at),
      score: session.total_score,
    }));

  const averageScore = getAverageScore(sessions);
  const bestSession = getBestSession(sessions);
  const latestSession = sessions[sessions.length - 1];
  const firstSession = sessions[0];

  const improvement =
    firstSession && latestSession
      ? latestSession.total_score - firstSession.total_score
      : 0;

  return (
    <section className="progress-page">
      <header className="page-header">
        <div>
          <h1>Progress History</h1>
          <p>Track your improvement over time and monitor movement quality.</p>
        </div>
      </header>

      <div className="progress-summary-grid">
        <ProgressCard
          label="Average Score"
          value={`${averageScore} / 21`}
          note={`${Math.round((averageScore / 21) * 100)}% of maximum score`}
        />

        <ProgressCard
          label="Best Score"
          value={bestSession ? `${bestSession.total_score} / 21` : "0 / 21"}
          note={bestSession ? `Achieved on ${formatDate(bestSession.started_at)}` : "No sessions yet"}
        />

        <ProgressCard
          label="Sessions Completed"
          value={String(sessions.length)}
          note="Assessments"
        />

        <ProgressCard
          label="Current Risk Level"
          value={latestSession?.risk_level || "No Data"}
          note={latestSession ? "Based on latest session" : "No completed sessions"}
          status={getRiskStatusClass(latestSession?.risk_level)}
        />

        <ProgressCard
          label="Improvement"
          value={improvement > 0 ? `+${improvement}` : String(improvement)}
          note="vs. first assessment"
          status={improvement >= 0 ? "status-good" : "status-high"}
        />
      </div>

      <div className="progress-chart-card">
        <h2>Overall Score by Date</h2>

        <div className="large-chart-container">
          {dailyData.length === 0 ? (
            <p>No completed sessions yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={[0, 21]} stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="progress-chart-card">
        <div className="panel-header">
          <h2>Scores by Time in Selected Day</h2>

          <select
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="progress-date-select"
          >
            {getUniqueDates(sessions).map((dateKey) => (
              <option key={dateKey} value={dateKey}>
                {formatDate(dateKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="large-chart-container">
          {selectedDayData.length === 0 ? (
            <p>No sessions for this day.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedDayData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis domain={[0, 21]} stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}

function ProgressCard({ label, value, note, status }) {
  return (
    <div className="progress-card">
      <p>{label}</p>
      <h2 className={status || ""}>{value}</h2>
      <span>{note}</span>
    </div>
  );
}

function buildDailyData(sessions) {
  const grouped = {};

  sessions.forEach((session) => {
    const key = getDateKey(session.started_at);

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(session.total_score);
  });

  return Object.entries(grouped).map(([date, scores]) => ({
    date: formatShortDate(date),
    score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
  }));
}

function getUniqueDates(sessions) {
  return [...new Set(sessions.map((session) => getDateKey(session.started_at)))];
}

function getDateKey(value) {
  return new Date(value).toISOString().split("T")[0];
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatShortDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAverageScore(sessions) {
  if (!sessions.length) return 0;

  const total = sessions.reduce(
    (sum, session) => sum + Number(session.total_score || 0),
    0
  );

  return Math.round(total / sessions.length);
}

function getBestSession(sessions) {
  if (!sessions.length) return null;

  return sessions.reduce((best, session) =>
    session.total_score > best.total_score ? session : best
  );
}

function getRiskStatusClass(risk) {
  if (risk === "Low") return "status-good";
  if (risk === "Moderate") return "status-moderate";
  if (risk === "High") return "status-high";
  return "";
}