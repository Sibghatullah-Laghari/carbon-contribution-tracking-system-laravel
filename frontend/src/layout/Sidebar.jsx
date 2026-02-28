import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
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
                    {role !== 'ADMIN' && (
                        <>
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
                        </>
                    )}
                    {role === 'ADMIN' && (
                        <>
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
                        </>
                    )}
                </ul>
            </nav>
            <button onClick={handleLogout} className="btn btn-danger sidebar-logout">
                Logout
            </button>
        </div>
    );
};

export default Sidebar;