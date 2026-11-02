import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/patients", label: "Patients" },
  { to: "/appointments", label: "Appointments" },
];

function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink className="brand" to="/">
          <span className="brand__mark">+</span>
          <span>ClinicFlow</span>
        </NavLink>
        <nav className="nav-links" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link--active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user.role === "admin" ? (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link--active" : ""}`
              }
            >
              Users
            </NavLink>
          ) : null}
        </nav>
        <div className="user-menu">
          <span className="user-avatar">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
          <span className="user-copy">
            <strong>{user.fullName}</strong>
            <small>{user.role}</small>
          </span>
          <button
            className="button button--quiet"
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
