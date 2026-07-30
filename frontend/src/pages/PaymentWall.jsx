import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2 } from "lucide-react";
import { mockPay } from "../services/paymentService.js";

const INCLUDED_FEATURES = [
  "Full assessment dashboard access",
  "Unlimited movement assessments",
  "Session history and progress tracking",
  "Live STINGRAY bar connectivity",
];

export default function PaywallPage() {
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePay() {
    try {
      setErrorMessage("");
      setIsPaying(true);

      const user = JSON.parse(localStorage.getItem("stingrayUser"));

      if (!user || !user.id) {
        navigate("/login");
        return;
      }

      const updatedUser = await mockPay(user.id);

      localStorage.setItem("stingrayUser", JSON.stringify(updatedUser));

      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div className="paywall-page">
      <div className="paywall-card">
        <div className="paywall-icon">
          <Lock size={28} />
        </div>

        <h1>Unlock Your Dashboard</h1>
        <p>
          A STINGRAY subscription is required to access assessments, live
          tracking, and your progress history.
        </p>

        <ul className="paywall-features">
          {INCLUDED_FEATURES.map((feature) => (
            <li key={feature}>
              <CheckCircle2 size={18} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="paywall-price">
          <strong>$19</strong>
          <span>/ month</span>
        </div>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <button className="paywall-pay-button" onClick={handlePay} disabled={isPaying}>
          {isPaying ? "Processing..." : "Subscribe & Continue"}
        </button>

        <button className="paywall-logout-link" onClick={() => navigate("/login")}>
          Log out
        </button>
      </div>
    </div>
  );
}