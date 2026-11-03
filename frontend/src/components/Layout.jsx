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
    <div className="min-h-screen">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="mx-auto w-[min(calc(100%-1.5rem),76rem)] py-8 sm:w-[min(calc(100%-3rem),76rem)] sm:py-12 lg:py-16">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
