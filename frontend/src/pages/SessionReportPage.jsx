import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Star,
  ShieldCheck,
  Clock,
  ListChecks,
  CheckCircle,
  XCircle,
  Lightbulb,
  Download,
  RotateCcw,
  Home,
} from "lucide-react";

export default function SessionReportPage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [exerciseResults, setExerciseResults] = useState([]);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    const storedUser = JSON.parse(localStorage.getItem("stingrayUser"));

    if (!storedUser?.id) {
      navigate("/login");
      return;
    }

    const selectedSession = JSON.parse(
      localStorage.getItem("selectedReportSession")
    );

    const completedSession = JSON.parse(
      localStorage.getItem("completedSession")
    );

    let sessionData = selectedSession || completedSession;

    if (!sessionData?.id) {
      const latestResponse = await fetch(
        `http://127.0.0.1:8000/sessions/latest/${storedUser.id}`
      );

      sessionData = await latestResponse.json();
    }

    if (!sessionData?.id) return;

    setSession(sessionData);

    const scoresResponse = await fetch(
      `http://127.0.0.1:8000/sessions/${sessionData.id}/exercise-scores`
    );

    const scoresData = await scoresResponse.json();
    setExerciseResults(scoresData);
  }

  if (!session) {
    return (
      <section className="report-page">
        <h1>Session Report</h1>
        <p>No completed session found.</p>
      </section>
    );
  }

  const totalScore = session.total_score || 0;
  const maxScore = session.max_score || 21;
  const percentage = Math.round(session.score_percentage || 0);
  const risk = session.risk_level || "No Data";

  const avgPosture = average(exerciseResults.map((e) => e.posture_score));
  const avgControl = average(exerciseResults.map((e) => e.control_score));
  const avgRange = average(exerciseResults.map((e) => e.range_score));
  const avgSpeed = average(exerciseResults.map((e) => e.speed_score));

  return (
    <section className="report-page">
      <header className="report-header">
        <div>
          <h1>Session Report</h1>
          <p>Detailed results and analysis for a single assessment session.</p>
        </div>

        <button className="outline-small-button" onClick={() => navigate("/session-history")}>
          Back to Session History
        </button>
      </header>

      <div className="report-summary-grid">
        <ReportCard
          icon={<CalendarDays />}
          label="Date"
          value={formatDate(session.started_at)}
          note={formatDay(session.started_at)}
        />

        <ReportCard
          icon={<Star />}
          label="Session Score"
          value={`${totalScore} / ${maxScore}`}
          note={`${percentage}% of maximum score`}
        />

        <ReportCard
          icon={<ShieldCheck />}
          label="Risk Level"
          value={risk}
          note={getRiskNote(risk)}
          status={getRiskStatusClass(risk)}
        />

        <ReportCard
          icon={<Clock />}
          label="Duration"
          value={formatDuration(session.duration_seconds)}
          note={`${formatTime(session.started_at)} – ${formatTime(session.ended_at)}`}
        />

        <ReportCard
          icon={<ListChecks />}
          label="Exercises"
          value={String(exerciseResults.length)}
          note="Completed"
        />
      </div>

      <div className="report-main-grid">
        <div className={`overall-assessment-card risk-${risk.toLowerCase()}`}>
          <h2>Overall Assessment</h2>

          <div className="assessment-badge">
            <ShieldCheck size={44} />
          </div>

          <h3>{risk} Risk</h3>

          <p>{getRiskDescription(risk)}</p>
        </div>

        <div className="exercise-breakdown-card">
          <h2>Exercise Breakdown</h2>

          <div className="exercise-table">
            <div className="exercise-table-header">
              <span>#</span>
              <span>Exercise</span>
              <span>Score</span>
              <span>Result</span>
            </div>

            {exerciseResults.map((exercise) => (
              <div className="exercise-table-row" key={exercise.id}>
                <span className="exercise-number">{exercise.exercise_number}</span>
                <span>{exercise.exercise_name}</span>
                <strong>{exercise.score} / {exercise.max_score}</strong>
                <span className={exercise.score >= 2 ? "result-good" : "result-bad"}>
                  {exercise.score >= 2 ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {getExerciseResult(exercise.score)}
                </span>
              </div>
            ))}
          </div>

          <div className="total-score-row">
            <strong>Total Score</strong>
            <strong>{totalScore} / {maxScore} ({percentage}%)</strong>
          </div>
        </div>

        <div className="movement-quality-card">
          <h2>Movement Quality Summary</h2>
          <QualityScore label="Posture" value={`${avgPosture}%`} note={getMetricNote("posture", avgPosture)} />
          <QualityScore label="Control" value={`${avgControl}%`} note={getMetricNote("control", avgControl)} />
          <QualityScore label="Movement Range" value={`${avgRange}%`} note={getMetricNote("range", avgRange)} warning={avgRange < 70} />
          <QualityScore label="Speed" value={`${avgSpeed}`} note="Average movement speed score" />
        </div>
      </div>

      <div className="report-bottom-grid">
        <div className="recommendations-panel">
          <Lightbulb size={34} />
          <div>
            <h2>Recommendations</h2>
            <p>{getRecommendation(exerciseResults, risk)}</p>
          </div>
        </div>

        <div className="timeline-panel">
          <h2>Session Timeline</h2>
          <TimelineRow label="Session Started" value={formatTime(session.started_at)} />
          <TimelineRow label="Exercises Completed" value={`${formatTime(session.started_at)} – ${formatTime(session.ended_at)}`} />
          <TimelineRow label="Session Completed" value={formatTime(session.ended_at)} />
        </div>
      </div>

      <div className="report-actions">
        <button className="outline-action">
          <Download size={22} />
          Download PDF Report
        </button>

        <button className="primary-action" onClick={() => navigate("/start")}>
          <RotateCcw size={22} />
          Start New Assessment
        </button>

        <button className="outline-action" onClick={() => navigate("/dashboard")}>
          <Home size={22} />
          Back to Dashboard
        </button>
      </div>
    </section>
  );
}

function ReportCard({ icon, label, value, note, status }) {
  return (
    <div className="report-card">
      <div className="report-card-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h2 className={status || ""}>{value}</h2>
        <span>{note}</span>
      </div>
    </div>
  );
}

function QualityScore({ label, value, note, warning }) {
  return (
    <div className="quality-score-row">
      <div className={warning ? "quality-circle warning" : "quality-circle"}>
        {value}
      </div>
      <div>
        <h3>{label}</h3>
        <p>{note}</p>
      </div>
    </div>
  );
}

function TimelineRow({ label, value }) {
  return (
    <div className="timeline-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function average(values) {
  const valid = values.filter((v) => typeof v === "number");
  if (!valid.length) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDay(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { weekday: "long" });
}

function formatTime(value) {
  if (!value) return "N/A";
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

function getExerciseResult(score) {
  if (score === 3) return "Excellent";
  if (score === 2) return "Good";
  if (score === 1) return "Needs Improvement";
  return "Poor";
}

function getRiskStatusClass(risk) {
  if (risk === "Low") return "status-good";
  if (risk === "Moderate") return "status-moderate";
  if (risk === "High") return "status-high";
  return "";
}

function getRiskNote(risk) {
  if (risk === "Low") return "Good movement quality";
  if (risk === "Moderate") return "Keep improving";
  if (risk === "High") return "Needs attention";
  return "No assessment data";
}

function getRiskDescription(risk) {
  if (risk === "Low") {
    return "Your movement quality appears strong. Continue regular assessments to maintain your progress.";
  }

  if (risk === "Moderate") {
    return "Your movement quality shows mild to moderate limitations. Continue regular assessments and focus on controlled movement.";
  }

  if (risk === "High") {
    return "Your movement quality shows significant limitations in this session. Focus on stability, control, and safe movement practice.";
  }

  return "No assessment result is available for this session.";
}

function getMetricNote(type, value) {
  if (value >= 85) return "Excellent movement quality";
  if (value >= 70) return "Good movement quality";
  if (value >= 50) return "Moderate movement quality";
  return "Needs improvement";
}

function getRecommendation(exercises, risk) {
  const lowScores = exercises.filter((exercise) => exercise.score <= 1);

  if (lowScores.length > 0) {
    const names = lowScores.map((exercise) => exercise.exercise_name).join(", ");
    return `Lowest scores were recorded in: ${names}. Focus on improving control, posture, and range of motion for these exercises.`;
  }

  if (risk === "High") {
    return "Focus on slow, controlled movements and repeat the assessment after practice.";
  }

  if (risk === "Moderate") {
    return "Continue practicing regularly and focus on exercises with lower movement quality values.";
  }

  return "Excellent result. Continue regular assessments to maintain movement quality.";
}