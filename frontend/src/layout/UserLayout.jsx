import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import Navbar from './Navbar';

/**
 * UserLayout — the shell for all USER-only routes.
 * Wrapped by PrivateRoute in App.jsx.
 * Renders UserSidebar which contains zero admin navigation.
 * It is structurally impossible for admin routes to be rendered inside this layout.
 */
const UserLayout = () => {
    return (
        <div className="app-shell">
            <UserSidebar />
            <div className="app-main">
                <Navbar />
                <main className="app-content page-fade">
                    <div className="content-wrap">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
