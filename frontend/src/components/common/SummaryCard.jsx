export default function SummaryCard({ label, value, suffix, note, status }) {
  const statusClass = status ? `summary-value ${status}` : "summary-value";

  return (
    <div className="summary-card">
      <p className="summary-label">{label}</p>

      <h2 className={statusClass}>
        {value} {suffix && <span>{suffix}</span>}
      </h2>

      <p className="summary-note">{note}</p>
    </div>
  );
}