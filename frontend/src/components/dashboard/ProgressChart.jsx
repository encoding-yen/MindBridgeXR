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

export default function ProgressChart() {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      const activeUser = JSON.parse(localStorage.getItem("stingrayUser"));

      if (!activeUser) return;

      const response = await fetch(
        `http://127.0.0.1:8000/sessions/user/${activeUser.id}`
      );

      const sessions = await response.json();

      const completedSessions = sessions
        .filter((session) => session.status === "completed")
        .reverse();

      const chartData = completedSessions.map((session) => ({
        date: new Date(session.started_at).toLocaleDateString(),
        score: session.total_score,
      }));

      setProgressData(chartData);
    } catch (error) {
      console.error("Progress chart error:", error);
    }
  }

  const latestScore =
    progressData.length > 0
      ? progressData[progressData.length - 1].score
      : 0;

  const firstScore =
    progressData.length > 0
      ? progressData[0].score
      : 0;

  const improvement = latestScore - firstScore;

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Your Progress Over Time</h2>
      </div>

      <div className="chart-container">
        {progressData.length === 0 ? (
          <p>No completed sessions yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />

              <XAxis
                dataKey="date"
                stroke="#94a3b8"
              />

              <YAxis
                domain={[0, 21]}
                stroke="#94a3b8"
              />

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

      <p className="panel-note">
        {improvement >= 0 ? (
          <>
            Your score is <span>improving</span>. Keep up the good work!
          </>
        ) : (
          <>
            Your score has <span>decreased</span>. Continue practicing.
          </>
        )}
      </p>

      <button className="secondary-button">
        View Full Progress
      </button>
    </div>
  );
}