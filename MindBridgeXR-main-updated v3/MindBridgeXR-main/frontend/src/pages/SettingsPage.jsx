import AppearanceSection from "../components/settings/AppearanceSection.jsx";
import AccessibilitySection from "../components/settings/AccessibilitySection.jsx";
import AboutSection from "../components/settings/AboutSection.jsx";

/* Settings Page */

export default function SettingsPage() {
  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="page-label">System Preferences</p>

          <h1>Settings</h1>

          <p className="page-description">
            Customize the dashboard appearance and accessibility preferences.
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="settings-content">
        <AppearanceSection />

        <AccessibilitySection />

        <AboutSection />
      </div>
    </div>
  );
}