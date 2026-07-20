import { useNavigate } from "react-router-dom";
import { Sun, Moon, LogIn, Info, Mail, HelpCircle, ShoppingCart } from "lucide-react";
import { useTheme } from "../hooks/useTheme.js";
import logoDark from "../assets/images/Logo-Dark.svg";
import logoLight from "../assets/images/Logo-Light.svg";
import stingrayBarImage from "../assets/images/stingray-bar.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="landing-page">
      {/* Sidebar */}
      <aside className="landing-sidebar">
        <img
          src={theme === "dark" ? logoLight : logoDark}
          alt="Stingray"
          className="landing-sidebar-logo"
        />

        <nav className="landing-sidebar-nav">
          <button onClick={() => scrollToSection("about")}>
            <Info size={18} />
            <span>About Us</span>
          </button>

          <button onClick={() => scrollToSection("contact")}>
            <Mail size={18} />
            <span>Contact</span>
          </button>

          <button onClick={() => scrollToSection("faq")}>
            <HelpCircle size={18} />
            <span>FAQ</span>
          </button>
        </nav>
      </aside>

      {/* Main column: topbar + content */}
      <div className="landing-main">
        <header className="landing-topbar">
          <button className="landing-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="landing-login-button" onClick={() => navigate("/login")}>
            <LogIn size={18} />
            <span>Log In</span>
          </button>
        </header>

        {/* Hero with video background */}
        <section className="landing-hero">
          <video
            className="landing-hero-video"
            autoPlay
            loop
            muted
            playsInline
            poster={stingrayBarImage}
          >
            <source src="../assets/videos/demo-placeholder.mp4" type="video/mp4" />
          </video>

          <div className="landing-hero-overlay" />

          <div className="landing-hero-content">
            <h1>STINGRAY</h1>
            <p>Advanced motion tracking for posture and movement assessment.</p>
          </div>
        </section>

        {/* About */}
        <section id="about" className="landing-section">
          <h2>About Us</h2>
          <p>
            Stingray XR builds precision motion-tracking hardware for physiotherapy
            and movement assessment. Inspired by the natural tones of the stingray
            and its underwater environment, our device pairs deep neutrals with
            vibrant, real-time feedback to help clinicians and patients understand
            movement with clarity and confidence.
          </p>
        </section>

        {/* Contact */}
        <section id="contact" className="landing-section">
          <h2>Contact</h2>
          <p>Have a question before you buy, or need support with your device?</p>
          <a className="landing-contact-email" href="mailto:support@stingrayxr.com">
            support@stingrayxr.com
          </a>
        </section>

        {/* FAQ */}
        <section id="faq" className="landing-section">
          <h2>FAQ</h2>

          <div className="landing-faq-item">
            <h3>How does the STINGRAY bar work?</h3>
            <p>
              The bar tracks pitch, roll, and yaw in real time via onboard IMU
              sensors, streaming live feedback to the companion dashboard during
              guided movement assessments.
            </p>
          </div>

          <div className="landing-faq-item">
            <h3>Is a subscription required?</h3>
            <p>
              No. The dashboard and core assessment tools are included with your
              device purchase.
            </p>
          </div>

          <div className="landing-faq-item">
            <h3>What's in the box?</h3>
            <p>
              One STINGRAY bar, a charging cable, and a quick-start guide to
              connect your device and run your first assessment.
            </p>
          </div>
        </section>

        {/* Purchase */}
        <footer className="landing-footer">
          <button className="landing-purchase-button">
            <ShoppingCart size={20} />
            <span>Purchase Now</span>
          </button>
        </footer>
      </div>
    </div>
  );
}