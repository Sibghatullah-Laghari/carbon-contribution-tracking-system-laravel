import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * UserSidebar — rendered ONLY inside UserLayout, which is guarded by PrivateRoute.
 * This component contains NO admin links and NO conditional role checks.
 * Structural separation at the routing level guarantees admins never render this
 * and users never render AdminSidebar.
 */
const UserSidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <span>🌿</span>
                <span>CCTRS</span>
            </div>
            <nav className="sidebar-nav">
                <ul className="sidebar-list">
                    <li>
                        <NavLink to="/dashboard" className="nav-link">
                            <span className="nav-icon">🏠</span>
                            <span className="nav-text">Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/submit-activity" className="nav-link">
                            <span className="nav-icon">➕</span>
                            <span className="nav-text">Submit Activity</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/my-activities" className="nav-link">
                            <span className="nav-icon">🧾</span>
                            <span className="nav-text">My Activities</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/monthly-progress" className="nav-link">
                            <span className="nav-icon">📈</span>
                            <span className="nav-text">Monthly Progress</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/badges" className="nav-link">
                            <span className="nav-icon">🏅</span>
                            <span className="nav-text">Badges</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/leaderboard" className="nav-link">
                            <span className="nav-icon">🏆</span>
                            <span className="nav-text">Leaderboard</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <button onClick={handleLogout} className="btn btn-danger sidebar-logout">
                Logout
            </button>
        </div>
    );
};

export default UserSidebar;
