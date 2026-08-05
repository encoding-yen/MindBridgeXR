import {
  Phone,
  Mail,
  CircleHelp,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function HelpSupportPage() {
  return (
    <section className="help-page">
      <header className="page-header">
        <div>
          <h1>Help & Support</h1>
          <p>
            Find guidance, troubleshooting information, and support contacts.
          </p>
        </div>
      </header>

      <div className="help-grid">
        <div className="help-card">
          <CircleHelp size={30} />
          <h2>Frequently Asked Questions</h2>

          <div className="faq-item">
            <strong>How do I start an assessment?</strong>
            <p>
              Navigate to Start Assessment and follow the exercise instructions.
            </p>
          </div>

          <div className="faq-item">
            <strong>Why am I not receiving live data?</strong>
            <p>
              Ensure the STINGRAY device is powered on and connected to the
              network.
            </p>
          </div>

          <div className="faq-item">
            <strong>How are scores calculated?</strong>
            <p>
              Scores are based on posture, control, movement range, and
              movement quality metrics.
            </p>
          </div>
        </div>

        <div className="help-card">
          <Phone size={30} />
          <h2>Contact Support</h2>

          <p>
            For technical issues or assistance, please contact the STINGRAY
            support team.
          </p>

          <div className="contact-row">
            <strong>Phone:</strong>
            <span>+974 XXXX XXXX</span>
          </div>

          <div className="contact-row">
            <strong>Email:</strong>
            <span>support@stingray.com</span>
          </div>
        </div>

        <div className="help-card">
          <FileText size={30} />
          <h2>User Guide</h2>

          <p>
            Review the assessment instructions before beginning any exercise
            session.
          </p>

          <ul>
            <li>Connect the STINGRAY bar.</li>
            <li>Follow exercise instructions carefully.</li>
            <li>Complete all 7 exercises.</li>
            <li>Review your report after completion.</li>
          </ul>
        </div>

        <div className="help-card">
          <ShieldCheck size={30} />
          <h2>Safety Notice</h2>

          <p>
            Stop the assessment immediately if you experience discomfort,
            dizziness, or pain.
          </p>

          <p>
            STINGRAY is intended for movement assessment and should not replace
            professional medical evaluation.
          </p>
        </div>
      </div>
    </section>
  );
}