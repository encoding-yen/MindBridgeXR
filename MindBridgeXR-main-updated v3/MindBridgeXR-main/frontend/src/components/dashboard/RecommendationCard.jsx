export default function RecommendationCard() {
  return (
    <div className="dashboard-panel recommendation-card">
      <div className="recommendation-icon">✓</div>

      <h2>You’re on the right track!</h2>

      <p>
        Your recent assessments show moderate movement limitations.
        Continue regular practice and repeat assessments weekly to
        maintain and improve your movement quality.
      </p>

      <div className="recommendation-illustration">
        Movement guidance
      </div>
    </div>
  );
}