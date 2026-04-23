import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <nav className="nav">
        <NavLink to="/">오늘 미션</NavLink>
        <NavLink to="/login">로그인</NavLink>
        <NavLink to="/difficulty">난이도</NavLink>
        <NavLink to="/admin">관리</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
