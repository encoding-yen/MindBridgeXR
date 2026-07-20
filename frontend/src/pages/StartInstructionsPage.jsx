import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bluetooth,
  BluetoothOff,
  Activity,
  ShieldCheck,
  Clock,
  ListChecks,
  Dumbbell,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import stingrayBarImage from "../assets/images/stingray-bar.png";
import { startSession } from "../services/sessionService.js";
import { getLiveImuData } from "../services/liveImuService.js";

// How often to poll for a connection check
const CHECK_INTERVAL_MS = 2000;
// If we haven't heard from the bar in this long, treat it as disconnected
const STALE_THRESHOLD_MS = 4000;

export default function StartInstructionsPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  // "checking" | "connected" | "disconnected"
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [lastGoodDataAt, setLastGoodDataAt] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function checkConnection() {
      try {
        const data = await getLiveImuData();

        // Treat a response as a real signal only if it actually contains
        // orientation data, not just an empty/malformed payload.
        const hasData =
          data &&
          data.pitch !== undefined &&
          data.roll !== undefined &&
          data.yaw !== undefined;

        if (cancelled) return;

        if (hasData) {
          setLastGoodDataAt(Date.now());
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("disconnected");
        }
      } catch (error) {
        if (cancelled) return;
        setConnectionStatus("disconnected");
      }
    }

    checkConnection();
    const interval = setInterval(checkConnection, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Independently guard against a stale "connected" state if the polling
  // interval stalls for any reason (e.g. tab backgrounded then resumed).
  useEffect(() => {
    const staleCheck = setInterval(() => {
      if (lastGoodDataAt && Date.now() - lastGoodDataAt > STALE_THRESHOLD_MS) {
        setConnectionStatus("disconnected");
      }
    }, 1000);

    return () => clearInterval(staleCheck);
  }, [lastGoodDataAt]);

  const isConnected = connectionStatus === "connected";
  const isChecking = connectionStatus === "checking";

  async function handleStartAssessment() {
    try {
      setErrorMessage("");
      setIsStarting(true);

      const user = JSON.parse(localStorage.getItem("stingrayUser"));

      if (!user || !user.id) {
        navigate("/login");
        return;
      }

      const session = await startSession(user.id);

      localStorage.setItem("activeSession", JSON.stringify(session));

      navigate("/live-session");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <section className="instructions-page">
      <header className="instructions-header">
        <h1>Start Instructions</h1>
        <p>Follow the steps below before beginning your assessment.</p>
      </header>

      {errorMessage && <div className="auth-error">{errorMessage}</div>}

      <div className="instructions-grid">
        <div className="device-card">
          <p className="section-label">Your Device</p>
          <h2>STINGRAY Bar</h2>
          <p>Advanced motion tracking bar for posture and movement assessment.</p>

          <img
            src={stingrayBarImage}
            alt="STINGRAY Bar"
            className="device-bar-image"
          />

          <div className={`connection-pill ${connectionStatus}`}>
            <span></span>
            {isChecking && "Checking connection..."}
            {isConnected && "STINGRAY Connected"}
            {!isChecking && !isConnected && "STINGRAY Disconnected"}
            {isConnected ? <Bluetooth size={16} /> : <BluetoothOff size={16} />}
          </div>
        </div>

        <div className="instruction-card">
          <p className="section-label">Assessment Preparation</p>

          <InstructionItem
            icon={<Activity />}
            title="Prepare the assessment area"
            text="Position the STINGRAY bar on the assessment mat. If a mat is unavailable, place the bar on a flat, stable surface in the correct starting position."
          />

          <InstructionItem
            icon={<Dumbbell />}
            title="Grip the STINGRAY bar correctly"
            text="Hold the bar with both hands using a comfortable and balanced grip."
          />

          <InstructionItem
            icon={<ShieldCheck />}
            title="Clear the assessment area"
            text="Ensure at least 2 meters of unobstructed space around you."
          />

          <InstructionItem
            icon={<AlertTriangle />}
            title="Stop if you feel pain"
            text="Discontinue the assessment immediately if you experience pain or discomfort."
          />
        </div>

        <div className="session-side">
          <div className="session-summary-card">
            <p className="section-label">Session Summary</p>

            <SummaryRow
              icon={<ListChecks />}
              label="Session Type"
              value="Functional Movement Assessment"
            />
            <SummaryRow icon={<Activity />} label="Exercises" value="7" />
            <SummaryRow icon={<Clock />} label="Estimated Time" value="8 - 10 Minutes" />
            <SummaryRow icon={<ShieldCheck />} label="Difficulty" value="Standard" />
          </div>

          <div className="system-check-card">
            <p className="section-label">System Check</p>

            <CheckRow
              label="Bar Connection"
              status={isChecking ? "checking" : isConnected ? "ready" : "failed"}
            />
            <CheckRow
              label="Sensor Status"
              status={isChecking ? "checking" : isConnected ? "ready" : "failed"}
            />
            <CheckRow
              label="Calibration"
              status={isChecking ? "checking" : isConnected ? "ready" : "failed"}
            />
            <CheckRow
              label="System Status"
              status={isChecking ? "checking" : isConnected ? "ready" : "failed"}
            />

            <div className={`ready-message ${isConnected ? "ok" : "not-ok"}`}>
              {isConnected ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              {isChecking && "Checking system status..."}
              {isConnected && "All systems ready. You're good to go."}
              {!isChecking &&
                !isConnected &&
                "STINGRAY bar not detected. Check the connection and try again."}
            </div>
          </div>
        </div>
      </div>

      <div className="instructions-actions">
        <button className="outline-action" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={22} />
          Back to Dashboard
        </button>

        <div className="important-note">
          <strong>Important</strong>
          <span>
            This assessment is not intended to diagnose or treat any medical condition.
            Always consult a healthcare professional for medical advice.
          </span>
        </div>

        <button
          className="primary-action"
          onClick={handleStartAssessment}
          disabled={isStarting || !isConnected}
          title={!isConnected ? "Waiting for STINGRAY bar connection..." : undefined}
        >
          {isStarting ? "Starting..." : "Start Assessment →"}
        </button>
      </div>
    </section>
  );
}

function InstructionItem({ icon, title, text }) {
  return (
    <div className="instruction-item">
      <div className="instruction-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <div className="summary-row">
      <div className="summary-row-label">
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function CheckRow({ label, status }) {
  return (
    <div className="check-row">
      <span>
        {status === "checking" && <Loader2 size={18} className="spin" />}
        {status === "ready" && <CheckCircle size={18} />}
        {status === "failed" && <XCircle size={18} />}
        {label}
      </span>
      <strong>
        {status === "checking" && "Checking..."}
        {status === "ready" && "Ready"}
        {status === "failed" && "Not Ready"}
      </strong>
    </div>
  );
}