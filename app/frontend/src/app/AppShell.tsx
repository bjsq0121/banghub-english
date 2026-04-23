import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <nav className="nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/conversation">Conversation</NavLink>
        <NavLink to="/news">News</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
