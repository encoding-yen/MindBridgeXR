import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import stingrayBarImage from "../assets/images/stingray-bar.png";
import { loginUser } from "../services/authService.js";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleLogin() {
    try {
      setErrorMessage("");

      const user = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("stingrayUser", JSON.stringify(user));
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-brand-panel">
        <div className="auth-logo">
          <span>◆</span> STINGRAY
        </div>

        <img src={stingrayBarImage} alt="STINGRAY Bar" className="auth-bar-image" />

        <p>Advanced motion tracking for posture and movement assessment.</p>
      </div>

      <div className="auth-form-panel">
        <h1>Welcome Back</h1>
        <p>Sign in to your STINGRAY account</p>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <label>Email Address</label>
        <div className="auth-input">
          <Mail size={20} />
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <label>Password</label>
        <div className="auth-input">
          <Lock size={20} />
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button className="auth-primary-button" onClick={handleLogin}>
          Log In
        </button>

        <p className="auth-switch">
          Don’t have an account?{" "}
          <button onClick={() => navigate("/register")}>Create Account</button>
        </p>
      </div>
    </section>
  );
}