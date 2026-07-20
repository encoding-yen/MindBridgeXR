/* Settings Card */

export default function SettingsCard({
  icon,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <section className={`settings-card ${className}`}>
      <div className="settings-card-header">
        <div className="settings-card-icon">{icon}</div>

        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>

      <div className="settings-card-content">{children}</div>
    </section>
  );
}