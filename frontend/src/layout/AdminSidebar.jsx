import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminSidebar — rendered ONLY inside AdminLayout, which is guarded by AdminRoute.
 * This component contains NO user links and NO conditional role checks.
 * Structural separation at the routing level guarantees users never render this
 * and admins never render UserSidebar.
 */
const AdminSidebar = () => {
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
                <span>CCTRS Admin</span>
            </div>
            <nav className="sidebar-nav">
                <ul className="sidebar-list">
                    <li>
                        <NavLink to="/admin-cctrs-2024" className="nav-link">
                            <span className="nav-icon">🛠️</span>
                            <span className="nav-text">Admin Panel</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin-search-activities" className="nav-link">
                            <span className="nav-icon">🔍</span>
                            <span className="nav-text">Search Activities</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin-questions" className="nav-link">
                            <span className="nav-icon">💬</span>
                            <span className="nav-text">Question Engine</span>
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

export default AdminSidebar;
