import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../components/common/SummaryCard.jsx";
import ProgressChart from "../components/dashboard/ProgressChart.jsx";
import RecentSessions from "../components/dashboard/RecentSessions.jsx";
import RecommendationCard from "../components/dashboard/RecommendationCard.jsx";
import { getUserSessionStats } from "../services/sessionService.js";

export default function DashboardHome() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    sessions_completed: 0,
    latest_score: 0,
    best_score: 0,
    current_risk_level: "No Data",
    improvement: 0,
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("stingrayUser"));

    if (!storedUser || !storedUser.id) {
      navigate("/login");
      return;
    }

    setUser(storedUser);

    async function loadStats() {
      try {
        const data = await getUserSessionStats(storedUser.id);
        setStats(data);
      } catch (error) {
        console.error("Dashboard stats error:", error);
      }
    }

    loadStats();
  }, [navigate]);

  const scorePercentage =
    stats.latest_score > 0 ? Math.round((stats.latest_score / 21) * 100) : 0;

  const improvementText =
    stats.improvement > 0
      ? `+${stats.improvement}`
      : String(stats.improvement);

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Hello, {user?.full_name || "User"}</h1>
          <p>
            STINGRAY ID: {user?.stingray_id || "N/A"} | Last Login: Today
          </p>
        </div>
      </header>

      <div className="summary-grid">
        <SummaryCard
          label="Latest Session Score"
          value={String(stats.latest_score)}
          suffix="/ 21"
          note={
            stats.sessions_completed > 0
              ? `${scorePercentage}% of maximum score`
              : "No sessions completed yet"
          }
        />

        <SummaryCard
          label="Risk Level"
          value={stats.current_risk_level || "No Data"}
          note={
            stats.sessions_completed > 0
              ? "Based on latest assessment"
              : "Complete your first assessment"
          }
          status={getRiskStatusClass(stats.current_risk_level)}
        />

        <SummaryCard
          label="Sessions Completed"
          value={String(stats.sessions_completed)}
          note="Assessments"
        />

        <SummaryCard
          label="Improvement"
          value={improvementText}
          note="vs. first assessment"
          status={stats.improvement >= 0 ? "status-good" : "status-high"}
        />
      </div>

      {stats.sessions_completed === 0 && (
        <div className="empty-state-card">
          <h2>No assessments completed yet</h2>
          <p>Start your first movement assessment to generate your score and risk level.</p>
        </div>
      )}

      <button className="primary-assessment-card" onClick={() => navigate("/start")}>
        <div>
          <h2>Start New Assessment</h2>
          <p>Begin a new movement assessment session</p>
        </div>
        <span>→</span>
      </button>

      <div className="dashboard-lower-grid">
        <ProgressChart />
        <RecentSessions />
        <RecommendationCard />
      </div>

      <div className="medical-note">
        STINGRAY is not intended to diagnose or treat any medical condition.
        Always consult a healthcare professional for medical advice.
      </div>
    </section>
  );
}

function getRiskStatusClass(riskLevel) {
  if (riskLevel === "Low") return "status-good";
  if (riskLevel === "Moderate") return "status-moderate";
  if (riskLevel === "High") return "status-high";
  return "";
}