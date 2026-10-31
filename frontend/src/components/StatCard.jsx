function StatCard({ label, value, description, marker, tone, isLoading }) {
  return (
    <article className={`stat-card stat-card--${tone}`} aria-label={label}>
      <div className="stat-card__topline">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__marker" aria-hidden="true">
          {marker}
        </span>
      </div>
      {isLoading ? (
        <>
          <span className="stat-card__skeleton stat-card__skeleton--value" />
          <span className="stat-card__skeleton stat-card__skeleton--text" />
        </>
      ) : (
        <>
          <strong className="stat-card__value">{value}</strong>
          <p className="stat-card__description">{description}</p>
        </>
      )}
    </article>
  );
}

export default StatCard;
