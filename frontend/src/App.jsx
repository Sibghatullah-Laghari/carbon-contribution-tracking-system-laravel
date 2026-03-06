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
import AdminQuestions from './pages/dashboard/AdminQuestions';
import StartProof from './pages/StartProof';
import Journey from './pages/public/Journey';
import Recycling from './pages/public/Recycling';
import OAuth2Callback from "./pages/public/OAuth2Callback";
import Terms from "./pages/public/Terms";
import Help from "./pages/public/Help";
import FAQ from "./pages/public/FAQ";
import Privacy from "./pages/public/Privacy";
import MyQuestions from "./pages/public/MyQuestions";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

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
                <Route path="/oauth2/callback" element={<OAuth2Callback />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/help" element={<Help />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/my-questions" element={<MyQuestions />} />

                {/* ── USER layout tree ─────────────────────────────────── */}
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

                {/* ── ADMIN layout tree ────────────────────────────────── */}
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
                    <Route path="admin-questions" element={<AdminQuestions />} />
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
