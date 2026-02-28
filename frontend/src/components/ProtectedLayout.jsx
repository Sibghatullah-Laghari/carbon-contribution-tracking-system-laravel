import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/app/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/app/submit", label: "Submit Activity", icon: "📝" },
    { to: "/app/activities", label: "My Activities", icon: "📋" },
    { to: "/app/progress", label: "Monthly Progress", icon: "📈" },
    { to: "/app/badges", label: "Badges", icon: "🏅" },
    { to: "/app/leaderboard", label: "Leaderboard", icon: "🏆" }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">🌿</div>
          <div className="brand-text">
            <div className="brand-title">CCTRS</div>
            <div className="brand-subtitle">Carbon Rewards</div>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link">
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          {/* Admin Panel is ONLY rendered when the token role is ADMIN */}
          {isAdmin && (
            <NavLink to="/app/admin" className="nav-link">
              <span className="nav-icon">🛡️</span>
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>
        <button className="nav-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">Carbon Contribution Tracking &amp; Reward System</div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
