import {useRef} from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Vibrate,
  BatteryFull,
  Fingerprint,
  Volume2,
  Lightbulb,
  Scan,
  RefreshCw,
  Layers,
  Users,
  Building2,
  Trophy,
  Sun,
  Moon
} from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import logoDark from "../assets/images/Logo-Dark.svg";
import logoLight from "../assets/images/Logo-Light.svg";
import stingrayBarImage from "../assets/images/stingray-bar.png";

const NAV_LINKS = [
  { label: "Home", id: "hero" },
  { label: "Ecosystem", id: "ecosystem" },
  { label: "Products", id: "bar" },
  { label: "Why Stingray", id: "why" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const ecosystemImageRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ecosystemImageRef,
    offset: ["start end", "end start"],
  });

  const ecosystemImageRotate = useTransform(scrollYProgress, [0, 0.3], [0, 180]);
  scrollYProgress.on("change", (v) => console.log("scroll progress:", v));

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="landing-page">
      {/* Sticky top nav */}
      <header className="landing-navbar">
        <a href="/">
          <img src={logoLight} alt="Stingray" className="landing-navbar-logo" />
        </a>

        <nav className="landing-navbar-links">
          {NAV_LINKS.map((link) => (
            <button key={link.id} onClick={() => scrollToSection(link.id)}>
              {link.label}
            </button>
          ))}
        </nav>

        <button className="landing-navbar-cta" onClick={() => navigate("/login")}>
          Get Started
        </button>
      </header>

      {/* Hero */}
      <section id="hero" className="landing-hero">
        <video className="landing-hero-video" autoPlay loop muted playsInline>
          <source src="/videos/product-hero.mp4" type="video/mp4" />
        </video>

        <div className="landing-hero-overlay" />

        <div className="landing-hero-content">
          <p className="landing-hero-animation-note">(animation here)</p>

          <h1>
            The Future of
            <br />
            Human Performance.
          </h1>

          <img
            src={stingrayBarImage}
            alt="STINGRAY Bar"
            className="landing-hero-product-image"
          />
        </div>
      </section>

      {/* Wordmark intro */}
      <section className="landing-wordmark-section">
        <h2 className="landing-wordmark">STINGRAY</h2>
        <p>
          Stingray builds precision motion-tracking hardware that turns effort
          into insight. Real-time feedback through touch, sight, and sound puts
          adaptive power in every trainer's hands so it's easier to push, guide,
          and improve.
        </p>

        <div className="landing-hero-buttons">
          <button className="landing-outline-button" onClick={() => scrollToSection("ecosystem")}>
            Explore the Ecosystem
          </button>
          <button className="landing-outline-button" onClick={() => scrollToSection("demo")}>
            Watch Demo
          </button>
        </div>
      </section>

      {/* One Connected Ecosystem */}
      <section id="ecosystem" className="landing-section landing-section-center">
        <h2>One Connected Ecosystem</h2>
        <p>
          Every Stingray XR product works together to deliver real-time movement
          intelligence, adaptive coaching, and seamless performance tracking.
        </p>

        <motion.img
          ref={ecosystemImageRef}
          src={stingrayBarImage}
          alt="STINGRAY Ecosystem"
          className="landing-section-image"
          style={{ rotate: ecosystemImageRotate }}
        />
      </section>

      {/* Performance is Not Limited by Effort */}
      <section id="demo" className="landing-section landing-section-center">
        <h2>
          Performance is Not
          <br />
          Limited by Effort.
        </h2>
        <p>
          The greatest obstacle to performance isn't effort — it's information.
          Traditional equipment measures outcomes; Stingray XR understands
          movement itself.
        </p>

        <div className="landing-video-placeholder">
          <span>Insert demo video</span>
        </div>
      </section>

      {/* THE STINGRAY BAR */}
      <ProductSection
        id="bar"
        eyebrow="THE"
        title="STINGRAY BAR"
        description="We've created a smart training tool that transforms how you train. Combine real-time posture guidance and biofeedback in one intuitive, ergonomic bar built for every session."
        image={stingrayBarImage}
        stats={[
          { icon: <Zap size={22} />, value: "<20ms", label: "Latency", note: "Faster than human reaction time" },
          { icon: <Vibrate size={22} />, value: "Haptic", label: "Guidance", note: "Cues that redirect effort in real time" },
          { icon: <BatteryFull size={22} />, value: "Day Long", label: "Battery", note: "20-24 hours battery life" },
        ]}
        features={[
          { icon: <Fingerprint size={18} />, label: "Precision Touch" },
          { icon: <Volume2 size={18} />, label: "Spatial Audio" },
          { icon: <Lightbulb size={18} />, label: "Luminous Cues" },
        ]}
      />

      {/* THE STINGRAY MAT */}
      <ProductSection
        id="mat"
        eyebrow="THE"
        title="STINGRAY MAT"
        description="Precision-tracked ground contact for every rep. The Stingray Mat syncs with the bar to close the loop between upper and lower body movement."
        image={stingrayBarImage}
        reverse
        stats={[
          { icon: <Scan size={22} />, value: "ToF", label: "Sensing", note: "Laser Time of Flight for depth and weight distribution" },
          { icon: <RefreshCw size={22} />, value: "Synchronised", label: "Tracking", note: "Locked to the bar for a single, unified read of movement" },
          { icon: <Layers size={22} />, value: "Grip", label: "Material", note: "Non-slip weave built for wet or dry conditions" },
        ]}
      />

      {/* WHY STINGRAY */}
      <section id="why" className="landing-section landing-section-center">
        <p className="landing-eyebrow">WHY</p>
        <h2 className="landing-wordmark landing-wordmark-small">STINGRAY</h2>
        <p>
          At Stingray XR, we envision a future where athlete training is driven
          by real, actionable data. Backed by our team, our engineers combine
          cutting-edge motion tracking with intelligent feedback systems that
          adapt in the moment — helping athletes push past plateaus and reach
          their full potential.
        </p>

        <div className="landing-why-grid">
          <WhyCard
            icon={<Trophy size={26} />}
            title="For Athletes"
            description="Real-time feedback that turns every rep into a coaching moment."
          />
          <WhyCard
            icon={<Users size={26} />}
            title="For Coaches"
            description="Objective movement data across your whole roster, in one view."
          />
          <WhyCard
            icon={<Building2 size={26} />}
            title="For Facilities"
            description="Equip every station with consistent, connected performance tracking."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final-cta">
        <h2>
          Train Smarter. Move Better.
          <br />
          Perform Without Limits.
        </h2>

        <button className="landing-purchase-button">Pre-Order Now →</button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <img src={logoLight} alt="Stingray" className="landing-footer-logo" />
      </footer>
    </div>
  );
}

function ProductSection({ id, eyebrow, title, description, image, stats, features, reverse }) {
  return (
    <section id={id} className={`landing-product-section ${reverse ? "reverse" : ""}`}>
      <div className="landing-product-header">
        <p className="landing-eyebrow">{eyebrow}</p>
        <h2 className="landing-wordmark landing-wordmark-small">{title}</h2>
        <p>{description}</p>
      </div>

      <img src={image} alt={title} className="landing-product-image" />

      <div className="landing-stats-row">
        {stats.map((stat) => (
          <div className="landing-stat" key={stat.label}>
            <div className="landing-stat-icon">{stat.icon}</div>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
            <p>{stat.note}</p>
          </div>
        ))}
      </div>

      {features && (
        <div className="landing-features-row">
          {features.map((feature) => (
            <div className="landing-feature-pill" key={feature.label}>
              {feature.icon}
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="landing-hero-buttons">
        <button className="landing-outline-button">Select Colour</button>
        <button className="landing-purchase-button small">Pre-Order Now →</button>
      </div>
    </section>
  );
}

function WhyCard({ icon, title, description }) {
  return (
    <div className="landing-why-card">
      <div className="landing-why-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}