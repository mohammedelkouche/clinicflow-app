import { NavLink } from "react-router-dom";
import { focusRing, quietButton } from "../styles/ui.js";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/patients", label: "Patients" },
  { to: "/appointments", label: "Appointments" },
];

function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto grid min-h-18 w-[min(calc(100%-1.5rem),76rem)] grid-cols-[1fr_auto] items-center gap-3 py-3 sm:w-[min(calc(100%-3rem),76rem)] lg:grid-cols-[auto_1fr_auto] lg:gap-8 lg:py-0">
        <NavLink className={`inline-flex items-center gap-2.5 text-lg font-extrabold text-ink no-underline ${focusRing}`} to="/">
          <span className="grid size-8 place-items-center rounded-lg bg-clinic-600 text-xl leading-none font-bold text-white">+</span>
          <span>ClinicFlow</span>
        </NavLink>
        <nav className="order-3 col-span-2 flex gap-1 overflow-x-auto lg:order-none lg:col-span-1" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-2 text-sm font-semibold no-underline transition ${focusRing} ${isActive ? "bg-clinic-50 text-clinic-800" : "text-muted hover:bg-slate-100 hover:text-ink"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user.role === "admin" ? (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-2 text-sm font-semibold no-underline transition ${focusRing} ${isActive ? "bg-clinic-50 text-clinic-800" : "text-muted hover:bg-slate-100 hover:text-ink"}`
              }
            >
              Users
            </NavLink>
          ) : null}
        </nav>
        <div className="flex items-center gap-2.5">
          <span className="hidden size-9 place-items-center rounded-full bg-clinic-600 font-bold text-white sm:grid">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
          <span className="hidden leading-tight md:grid">
            <strong className="text-sm">{user.fullName}</strong>
            <small className="mt-1 text-xs text-muted capitalize">{user.role}</small>
          </span>
          <button
            className={quietButton}
            type="button"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
