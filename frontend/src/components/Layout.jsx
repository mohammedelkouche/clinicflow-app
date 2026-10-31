import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Navbar from "./Navbar.jsx";

function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }
  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
