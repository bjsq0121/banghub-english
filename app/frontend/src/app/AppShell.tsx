import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <nav className="nav">
        <NavLink to="/">오늘 미션</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
