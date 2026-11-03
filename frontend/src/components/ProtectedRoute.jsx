import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { spinner } from "../styles/ui.js";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading)
    return (
      <main className="grid min-h-screen place-content-center justify-items-center text-muted">
        <span className={spinner} />
        <p className="mt-2">Restoring your secure session…</p>
      </main>
    );
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export default ProtectedRoute;
