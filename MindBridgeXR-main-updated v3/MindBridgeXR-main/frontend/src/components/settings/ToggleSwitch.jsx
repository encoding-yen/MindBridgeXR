/* Toggle Switch */

export default function ToggleSwitch({ active, onClick, label }) {
  return (
    <button
      type="button"
      className={`toggle-switch ${active ? "active" : ""}`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
    >
      <span />
    </button>
  );
}