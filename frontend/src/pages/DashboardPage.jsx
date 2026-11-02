import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getDashboardStats } from "../api/dashboard.api.js";
import StatCard from "../components/StatCard.jsx";
import { useAuth } from "../hooks/useAuth.js";

const statCards = [
  {
    key: "totalPatients",
    label: "Total patients",
    description: "Registered patient records",
    marker: "PT",
    tone: "teal",
  },
  {
    key: "appointmentsToday",
    label: "Today's appointments",
    description: "Visits scheduled for today",
    marker: "TD",
    tone: "blue",
  },
  {
    key: "pending",
    label: "Pending",
    description: "Appointments awaiting confirmation",
    marker: "PN",
    tone: "amber",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Confirmed appointments overall",
    marker: "CF",
    tone: "green",
  },
];

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadStats() {
      try {
        const dashboardStats = await getDashboardStats();
        if (isActive) {
          setStats(dashboardStats);
          setHasError(false);
        }
      } catch (requestError) {
        if (isActive) {
          setHasError(true);
          toast.error(
            requestError.response?.data?.error?.message ??
              "Unable to load dashboard statistics.",
            { id: "dashboard-load-error" },
          );
        }
      }
    }

    loadStats();

    return () => {
      isActive = false;
    };
  }, [requestKey]);

  function retryLoading() {
    setStats(null);
    setHasError(false);
    setRequestKey((currentKey) => currentKey + 1);
  }

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Clinic overview</p>
          <h1>Good to see you, {user.fullName.split(" ")[0]}.</h1>
          <p>Here is the latest activity across your clinic.</p>
        </div>
        <span className="role-pill">{user.role}</span>
      </header>

      {hasError ? (
        <div className="data-card">
          <div className="table-state">
            <h2>Dashboard unavailable</h2>
            <p>Use the notification for details, then try again.</p>
            <button
              className="button button--quiet"
              type="button"
              onClick={retryLoading}
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="stats-grid" aria-busy={!stats} aria-live="polite">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              {...card}
              value={stats?.[card.key]}
              isLoading={!stats}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
