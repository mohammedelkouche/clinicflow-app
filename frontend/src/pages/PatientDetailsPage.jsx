import { Link, useParams } from "react-router-dom";

function PatientDetailsPage() {
  const { id } = useParams();
  return (
    <section className="page-shell">
      <Link className="back-link" to="/patients">
        ← Back to patients
      </Link>
      <div className="foundation-card foundation-card--muted">
        <span className="foundation-card__number">ID</span>
        <div>
          <h1>Patient details</h1>
          <p className="patient-reference">Reference: {id}</p>
          <p>This patient record will be implemented in Phase 9.</p>
        </div>
      </div>
    </section>
  );
}

export default PatientDetailsPage;
