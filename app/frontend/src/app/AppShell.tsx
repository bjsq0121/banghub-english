import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <nav className="nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/difficulty">Level</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
