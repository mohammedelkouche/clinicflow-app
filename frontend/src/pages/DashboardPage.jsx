import { useAuth } from "../hooks/useAuth.js";

function DashboardPage() {
  const { user } = useAuth();
  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Clinic overview</p>
          <h1>Good to see you, {user.fullName.split(" ")[0]}.</h1>
          <p>Your live clinic statistics will appear here in Phase 8.</p>
        </div>
        <span className="role-pill">{user.role}</span>
      </header>
      <div className="foundation-card">
        <span className="foundation-card__number">01</span>
        <div>
          <h2>Your workspace is ready</h2>
          <p>
            Authentication, protected routing, and the clinic navigation are
            connected. Dashboard metrics are the next focused phase.
          </p>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
