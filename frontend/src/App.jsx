import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import VerifyOtp from './pages/public/VerifyOtp';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import DashboardLayout from './layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import SubmitActivity from './pages/dashboard/SubmitActivity';
import MyActivities from './pages/dashboard/MyActivities';
import MonthlyProgress from './pages/dashboard/MonthlyProgress';
import Badges from './pages/dashboard/Badges';
import Leaderboard from './pages/dashboard/Leaderboard';
import Admin from './pages/dashboard/Admin';
import StartProof from './pages/StartProof';
import Journey from './pages/public/Journey';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return (token && role === 'ADMIN') ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/journey" element={<Journey />} />

          <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="submit-activity" element={<SubmitActivity />} />
            <Route path="my-activities" element={<MyActivities />} />
            <Route path="monthly-progress" element={<MonthlyProgress />} />
            <Route path="badges" element={<Badges />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="proof" element={<StartProof />} />
          </Route>
        </Routes>
      </Router>
  );
}

export default App;