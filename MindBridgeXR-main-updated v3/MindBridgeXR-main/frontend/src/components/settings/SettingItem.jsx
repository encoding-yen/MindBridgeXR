/* Setting Item */

export default function SettingItem({
  icon,
  title,
  description,
  children,
}) {
  return (
    <div className="setting-item">
      <div className="setting-item-info">
        <div className="setting-item-icon">
          {icon}
        </div>

        <div className="setting-item-text">
          <h3>{title}</h3>

          {description && (
            <p>{description}</p>
          )}
        </div>
      </div>

      <div className="setting-item-control">
        {children}
      </div>
    </div>
  );
}