import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import VerifyOtp from './pages/public/VerifyOtp';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import UserLayout from './layout/UserLayout';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/dashboard/Dashboard';
import SubmitActivity from './pages/dashboard/SubmitActivity';
import MyActivities from './pages/dashboard/MyActivities';
import MonthlyProgress from './pages/dashboard/MonthlyProgress';
import Badges from './pages/dashboard/Badges';
import Leaderboard from './pages/dashboard/Leaderboard';
import Admin from './pages/dashboard/Admin';
import SearchActivities from './pages/dashboard/SearchActivities';
import StartProof from './pages/StartProof';
import Journey from './pages/public/Journey';
import Recycling from './pages/public/Recycling';

/**
 * PrivateRoute — requires a valid, non-expired token.
 * Redirects unauthenticated visitors to /login.
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * AdminRoute — requires ADMIN role in the decoded JWT.
 * Non-admin authenticated users are redirected to /dashboard (their safe home).
 * Unauthenticated users are redirected to /login.
 * The backend enforces the same rule independently on every API call.
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return children;
};

function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* ── Public routes ──────────────────────────────────────── */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/journey" element={<Journey />} />
                <Route path="/recycling" element={<Recycling />} />

                {/* ── USER layout tree ───────────────────────────────────────
                     Wrapped by PrivateRoute only.
                     UserLayout renders UserSidebar — zero admin links.
                     Admin routes are NOT nested here; they live in their own tree.
                     A USER cannot reach AdminLayout by any navigation path.        */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <UserLayout />
                        </PrivateRoute>
                    }
                >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="submit-activity" element={<SubmitActivity />} />
                    <Route path="my-activities" element={<MyActivities />} />
                    <Route path="monthly-progress" element={<MonthlyProgress />} />
                    <Route path="badges" element={<Badges />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="proof" element={<StartProof />} />
                </Route>

                {/* ── ADMIN layout tree ──────────────────────────────────────
                     Wrapped by AdminRoute (checks isAuthenticated AND isAdmin).
                     AdminLayout renders AdminSidebar — zero user links.
                     User routes are NOT nested here; they live in their own tree.
                     A USER cannot reach AdminLayout regardless of URL manipulation
                     because AdminRoute redirects them before the layout mounts.    */}
                <Route
                    path="/"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route path="admin-cctrs-2024" element={<Admin />} />
                    <Route path="admin-search-activities" element={<SearchActivities />} />
                </Route>
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
