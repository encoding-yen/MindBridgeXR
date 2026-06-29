import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Square,
  ShieldCheck,
  Waves,
  Gauge,
  Target,
  Lightbulb,
} from "lucide-react";

import BarVisualization from "../components/visualization/BarVisualization.jsx";
import { getLiveImuData } from "../services/liveImuService.js";
import { endSession } from "../services/sessionService.js";
import { exercises } from "../data/exercises.js";
import { calculateMovementMetrics } from "../utils/movementMetrics.js";

export default function LiveExercisePage() {
  const navigate = useNavigate();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [recentSamples, setRecentSamples] = useState([]);
  const [exerciseResults, setExerciseResults] = useState([]);

  const [imuData, setImuData] = useState({
    pitch: 0,
    roll: 0,
    yaw: 0,
  });

  const exercise = exercises[currentExerciseIndex];
  const movementMetrics = calculateMovementMetrics(recentSamples);
  const isCorrect = movementMetrics.score >= 2;

  function getActiveSession() {
    const activeSessionText = localStorage.getItem("activeSession");
    return activeSessionText ? JSON.parse(activeSessionText) : null;
  }

  function buildExerciseResult(index, exerciseItem, metrics) {
    return {
      exercise_number: index + 1,
      exercise_name: exerciseItem.name,
      score: Number(metrics.score) || 0,
      max_score: 3,
      posture_score: Number(metrics.posture) || 0,
      control_score: Number(metrics.control) || 0,
      range_score: Number(metrics.movementRange) || 0,
      speed_score: Math.round(Number(metrics.movementSpeed) || 0),
    };
  }

  useEffect(() => {
    const activeSession = getActiveSession();

    if (!activeSession || !activeSession.id) {
      navigate("/start-assessment");
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getLiveImuData();

        const newSample = {
          pitch: Number(data.pitch) || 0,
          roll: Number(data.roll) || 0,
          yaw: Number(data.yaw) || 0,
        };

        setImuData(newSample);

        setRecentSamples((prev) => {
          const updated = [...prev, newSample];
          return updated.slice(-80);
        });
      } catch (error) {
        console.error("Live IMU error:", error);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  async function handleEndSession(finalResults = exerciseResults) {
    try {
      setIsEndingSession(true);

      const activeSession = getActiveSession();

      if (!activeSession || !activeSession.id) {
        alert("No active session found. Please start a new assessment.");
        return;
      }

      const totalScore = finalResults.reduce(
        (sum, item) => sum + Number(item.score || 0),
        0
      );

      const completedSession = await endSession(
        activeSession.id,
        totalScore,
        finalResults
      );

      localStorage.setItem("completedSession", JSON.stringify(completedSession));
      localStorage.setItem("completedExerciseResults", JSON.stringify(finalResults));
      localStorage.removeItem("activeSession");

      navigate("/session-report");
    } catch (error) {
      console.error("End session error:", error);
      alert(error.message || "Failed to end session.");
    } finally {
      setIsEndingSession(false);
    }
  }

  function handleNextExercise() {
    const currentResult = buildExerciseResult(
      currentExerciseIndex,
      exercise,
      movementMetrics
    );

    const updatedResults = [...exerciseResults, currentResult];

    setExerciseResults(updatedResults);
    setRecentSamples([]);

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      return;
    }

    handleEndSession(updatedResults);
  }

  return (
    <section className="live-session-page">
      <header className="live-session-header">
        <div className="session-time">
          <span>Session Time</span>
          <strong>04:32</strong>
        </div>

        <div className="exercise-title-block">
          <span>
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </span>
          <h1>{exercise.name}</h1>
        </div>

        <button
          className="end-session-button"
          type="button"
          onClick={() => handleEndSession(exerciseResults)}
          disabled={isEndingSession}
        >
          <Square size={18} />
          {isEndingSession ? "Ending..." : "End Session"}
        </button>
      </header>

      <div className="live-session-grid">
        <aside className="movement-panel">
          <p className="panel-title">Your Movement</p>

          <div
            className={
              isCorrect
                ? "movement-status correct"
                : "movement-status incorrect"
            }
          >
            {isCorrect ? <CheckCircle size={54} /> : <XCircle size={54} />}
            <h2>{movementMetrics.status}</h2>
          </div>

          <div className="movement-score">
            <span>Score</span>
            <strong>{movementMetrics.score} / 3</strong>
          </div>

          <div
            className={
              isCorrect ? "movement-feedback good" : "movement-feedback bad"
            }
          >
            <h3>{isCorrect ? "Great job!" : "Keep going!"}</h3>
            <p>
              {isCorrect
                ? exercise.correctFeedback
                : exercise.incorrectFeedback}
            </p>
          </div>

          <div className="score-guide">
            <p className="panel-title">Score Guide</p>
            <ScoreGuideDot color="green" score="3" label="Perfect" />
            <ScoreGuideDot color="lime" score="2" label="Good" />
            <ScoreGuideDot color="orange" score="1" label="Needs Improvement" />
            <ScoreGuideDot color="red" score="0" label="Poor" />
          </div>
        </aside>

        <main className="exercise-main-area">
          <div className="demo-card">
            <div>
              <p className="panel-title">How To Perform</p>
              <p>{exercise.instructions}</p>
            </div>

            <div className="video-placeholder">
              <span>{exercise.name}</span>
              <small>Demo video placeholder</small>
            </div>
          </div>

          <BarVisualization
            pitch={imuData.pitch}
            roll={imuData.roll}
            yaw={imuData.yaw}
          />

          <div className="imu-values">
            <span>Pitch: {imuData.pitch.toFixed(1)}°</span>
            <span>Roll: {imuData.roll.toFixed(1)}°</span>
            <span>Yaw: {imuData.yaw.toFixed(1)}°</span>
          </div>

          <div className="overall-progress">
            <span>Overall Progress</span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((currentExerciseIndex + 1) / exercises.length) * 100
                  }%`,
                }}
              />
            </div>
            <strong>
              {Math.round(
                ((currentExerciseIndex + 1) / exercises.length) * 100
              )}
              %
            </strong>
          </div>
        </main>

        <aside className="quality-panel">
          <p className="panel-title">Movement Quality</p>

          <QualityMetric
            icon={<ShieldCheck />}
            label="Posture"
            value={`${movementMetrics.posture}%`}
            status={getMetricStatus(movementMetrics.posture)}
          />

          <QualityMetric
            icon={<Waves />}
            label="Control"
            value={`${movementMetrics.control}%`}
            status={getMetricStatus(movementMetrics.control)}
          />

          <QualityMetric
            icon={<Target />}
            label="Movement Range"
            value={`${movementMetrics.movementRange}%`}
            status={getMetricStatus(movementMetrics.movementRange)}
          />

          <QualityMetric
            icon={<Gauge />}
            label="Movement Speed"
            value={`${movementMetrics.movementSpeed}°/step`}
            status={movementMetrics.movementSpeed < 8 ? "Controlled" : "Fast"}
          />

          <div className="tip-card">
            <Lightbulb size={22} />
            <div>
              <strong>Tip</strong>
              <p>{exercise.tip}</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="exercise-navigation">
        <div className="exercise-dots">
          {exercises.map((item, index) => (
            <button
              key={item.id}
              className={
                index === currentExerciseIndex
                  ? "exercise-dot active"
                  : "exercise-dot"
              }
              onClick={() => setCurrentExerciseIndex(index)}
              type="button"
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          className="primary-action compact"
          type="button"
          onClick={handleNextExercise}
          disabled={isEndingSession}
        >
          {currentExerciseIndex === exercises.length - 1
            ? isEndingSession
              ? "Finishing..."
              : "Finish Session"
            : "Next Exercise"}{" "}
          →
        </button>
      </div>
    </section>
  );
}

function QualityMetric({ icon, label, value, status }) {
  return (
    <div className="quality-metric">
      <div className="quality-icon">{icon}</div>
      <div>
        <h3>{label}</h3>
        <p>{status}</p>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function ScoreGuideDot({ color, score, label }) {
  return (
    <div className="score-guide-row">
      <span className={`score-dot ${color}`}></span>
      <strong>{score}</strong>
      <span>{label}</span>
    </div>
  );
}

function getMetricStatus(value) {
  if (value >= 85) return "Excellent";
  if (value >= 70) return "Good";
  if (value >= 50) return "Fair";
  return "Needs Work";
}