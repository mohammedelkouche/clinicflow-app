const toneStyles = {
  teal: "bg-clinic-50 text-clinic-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
};

function StatCard({ label, value, description, marker, tone, isLoading }) {
  return (
    <article className="relative min-h-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-label={label}>
      <div className="relative z-10 flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-muted">{label}</span>
        <span className={`grid size-10 place-items-center rounded-xl text-xs font-extrabold tracking-wide ${toneStyles[tone]}`} aria-hidden="true">
          {marker}
        </span>
      </div>
      {isLoading ? (
        <>
          <span className="mt-6 block h-11 w-16 animate-pulse rounded-lg bg-slate-200" />
          <span className="mt-3 block h-3 w-3/4 animate-pulse rounded bg-slate-100" />
        </>
      ) : (
        <>
          <strong className="relative z-10 mt-6 mb-2 block text-4xl leading-none font-extrabold tracking-tight text-ink">{value}</strong>
          <p className="relative z-10 max-w-60 text-sm leading-6 text-muted">{description}</p>
        </>
      )}
    </article>
  );
}

export default StatCard;
