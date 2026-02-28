import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clears JWT + role + email from localStorage and resets React auth state
    logout();
    navigate('/login');
  };

  return (
    <header className="app-topbar">
      <div className="topbar-inner">
        <div>
          <p className="topbar-kicker">Dashboard</p>
          <h1 className="topbar-title">Carbon Contribution Tracking</h1>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-danger topbar-logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
