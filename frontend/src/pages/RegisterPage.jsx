import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Calendar } from "lucide-react";
import stingrayBarImage from "../assets/images/stingray-bar.png";
import { registerUser } from "../services/authService.js";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleRegister() {
    try {
      setErrorMessage("");

      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }

      const user = await registerUser({
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
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

      <div className="auth-form-panel large">
        <h1>Create Account</h1>
        <p>Join STINGRAY and start tracking your movement health.</p>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <div className="auth-two-columns">
          <div>
            <label>Full Name</label>
            <div className="auth-input">
              <User size={20} />
              <input
                name="full_name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label>Date of Birth</label>
            <div className="auth-input">
              <Calendar size={20} />
              <input
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

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

        <div className="auth-two-columns">
          <div>
            <label>Password</label>
            <div className="auth-input">
              <Lock size={20} />
              <input
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label>Confirm Password</label>
            <div className="auth-input">
              <Lock size={20} />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button className="auth-primary-button" onClick={handleRegister}>
          Create Account
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")}>Log In</button>
        </p>
      </div>
    </section>
  );
}