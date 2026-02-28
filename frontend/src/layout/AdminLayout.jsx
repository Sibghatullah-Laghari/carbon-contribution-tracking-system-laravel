import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Navbar from './Navbar';

/**
 * AdminLayout — the shell for all ADMIN-only routes.
 * Wrapped by AdminRoute in App.jsx.
 * Renders AdminSidebar which contains zero user navigation.
 * It is structurally impossible for user routes to be rendered inside this layout.
 */
const AdminLayout = () => {
    return (
        <div className="app-shell">
            <AdminSidebar />
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

export default AdminLayout;
