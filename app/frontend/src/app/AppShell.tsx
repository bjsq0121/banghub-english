import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="shell-header">
        <div className="shell-brand">
          <p className="support-label">BANGHUB ENGLISH</p>
          <NavLink to="/">아빠와 5분 영어놀이</NavLink>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
