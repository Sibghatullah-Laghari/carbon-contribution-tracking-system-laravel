import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stateEmail = location.state?.email;
    const storedEmail = sessionStorage.getItem("pendingEmail");
    const resolvedEmail = stateEmail || storedEmail || "";
    setEmail(resolvedEmail);
  }, [location.state]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setResendMessage("");
    if (!email) { setError("Missing email. Please sign up again."); return; }
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      sessionStorage.removeItem("pendingEmail");
      setMessage("Account verified! Redirecting to login...");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(""); setMessage(""); setResendMessage("");
    if (!email) { setError("Missing email. Please sign up again."); return; }
    setResendLoading(true);
    try {
      await api.post("/auth/resend-otp", { email });
      setResendMessage("A new OTP has been sent to your email.");
      setCooldown(30);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
      <div className="otp-page">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .otp-page {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: linear-gradient(160deg, #0f4d43 0%, #1a7a6e 40%, #2a9d8f 75%, #3dbda8 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }

        /* NAV */
        .otp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 3rem;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8f5f2;
          box-shadow: 0 2px 16px rgba(42,157,143,0.06);
        }
        .otp-nav-left { display: flex; align-items: center; gap: 0.5rem; }
        .otp-nav-logo { font-size: 1.6rem; }
        .otp-nav-name { font-size: 1.2rem; font-weight: 800; color: #2a9d8f; }
        .otp-nav-link {
          font-weight: 700; font-size: 0.9rem; color: #fff;
          text-decoration: none; padding: 0.55rem 1.4rem;
          border-radius: 8px; background: #2a9d8f;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(42,157,143,0.3);
        }
        .otp-nav-link:hover { background: #238a7e; transform: translateY(-1px); }

        /* CARD */
        .otp-card {
          width: 100%; max-width: 440px;
          background: #fff;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          margin-top: 80px;
        }

        .otp-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.85rem; color: #2a9d8f; text-decoration: none;
          font-weight: 600; margin-bottom: 1.8rem; transition: gap 0.2s;
        }
        .otp-back:hover { gap: 0.7rem; }

        .otp-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f0f4f3;
        }
        .otp-icon { font-size: 2.8rem; margin-bottom: 0.8rem; display: block; }
        .otp-header h1 {
          font-size: 1.8rem; font-weight: 800; color: #1a1a1a;
          margin-bottom: 0.5rem; letter-spacing: -0.02em;
        }
        .otp-header p { font-size: 0.875rem; color: #999; line-height: 1.6; }

        /* EMAIL CHIP */
        .otp-email-chip {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: #f0faf8; border: 1.5px solid #c8e8e3;
          border-radius: 20px; padding: 0.35rem 0.9rem;
          font-size: 0.82rem; font-weight: 600; color: #2a9d8f;
          margin-top: 0.5rem;
        }

        /* FORM */
        .otp-form { display: flex; flex-direction: column; gap: 1.2rem; }

        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #1a1a1a; }
        .form-group input {
          padding: 0.78rem 1rem;
          border: 1.5px solid #e2eeec;
          border-radius: 10px;
          font-size: 0.95rem; font-family: 'Inter', sans-serif;
          color: #1a1a1a; background: #f5fafa;
          transition: all 0.2s; outline: none;
        }
        .form-group input:focus {
          border-color: #2a9d8f;
          box-shadow: 0 0 0 3px rgba(42,157,143,0.1);
          background: #fff;
        }
        .form-group input::placeholder { color: #bbb; }

        /* OTP INPUT — big and bold */
        .otp-input-big {
          padding: 0.9rem 1rem !important;
          font-size: 1.6rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.35em !important;
          text-align: center !important;
          border: 2px solid #e2eeec !important;
          background: #f5fafa !important;
        }
        .otp-input-big:focus {
          border-color: #2a9d8f !important;
          box-shadow: 0 0 0 3px rgba(42,157,143,0.1) !important;
          background: #fff !important;
        }

        /* MESSAGES */
        .otp-error {
          background: #fff0f0; border: 1px solid #ffcccc;
          color: #cc0000; font-size: 0.83rem;
          padding: 0.7rem 1rem; border-radius: 8px; text-align: center;
        }
        .otp-success {
          background: #f0fff8; border: 1px solid #b2f0d4;
          color: #1a7a4a; font-size: 0.83rem;
          padding: 0.7rem 1rem; border-radius: 8px; text-align: center;
        }

        /* BUTTONS */
        .otp-submit-btn {
          width: 100%; padding: 0.92rem;
          background: #2a9d8f; color: #fff;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 10px; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(42,157,143,0.35);
          margin-top: 0.2rem; letter-spacing: 0.01em;
        }
        .otp-submit-btn:hover:not(:disabled) {
          background: #238a7e; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(42,157,143,0.45);
        }
        .otp-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .otp-resend-btn {
          width: 100%; padding: 0.85rem;
          background: #fff; color: #2a9d8f;
          font-size: 0.95rem; font-weight: 700;
          border: 1.5px solid #2a9d8f; border-radius: 10px; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
        }
        .otp-resend-btn:hover:not(:disabled) {
          background: #f0faf8; transform: translateY(-1px);
        }
        .otp-resend-btn:disabled { opacity: 0.55; cursor: not-allowed; border-color: #c8e8e3; color: #999; }

        /* FOOTER */
        .otp-footer {
          text-align: center; margin-top: 1.3rem;
          padding-top: 1.2rem; border-top: 1px solid #f0f4f3;
          font-size: 0.875rem; color: #aaa;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
        }
        .otp-footer a { color: #2a9d8f; text-decoration: none; font-weight: 700; }
        .otp-footer a:hover { text-decoration: underline; }

        /* Hint text */
        .otp-hint {
          font-size: 0.78rem; color: #bbb; text-align: center; margin-top: -0.5rem;
        }

        @media (max-width: 480px) {
          .otp-card { padding: 2rem 1.5rem; }
          .otp-nav { padding: 1rem 1.5rem; }
        }
      `}</style>

        {/* NAV */}
        <nav className="otp-nav">
          <div className="otp-nav-left">
            <span className="otp-nav-logo">🌍</span>
            <span className="otp-nav-name">CCTRS</span>
          </div>
          <Link className="otp-nav-link" to="/login">Login</Link>
        </nav>

        {/* CARD */}
        <div className="otp-card">
          <Link className="otp-back" to="/signup">← Back to signup</Link>

          <div className="otp-header">
            <span className="otp-icon">📧</span>
            <h1>Verify your email</h1>
            <p>We sent a 6-digit code to your inbox.</p>
            {email && (
                <div style={{display:'flex', justifyContent:'center', marginTop:'0.6rem'}}>
                  <span className="otp-email-chip">✉️ {email}</span>
                </div>
            )}
          </div>

          <form className="otp-form" onSubmit={handleSubmit}>

            {/* Only show email field if missing */}
            {!email && (
                <div className="form-group">
                  <label>Email</label>
                  <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
                </div>
            )}

            <div className="form-group">
              <label>6-Digit OTP Code</label>
              <input
                  className="otp-input-big"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  required
              />
            </div>

            <p className="otp-hint">Check your spam folder if you don't see it.</p>

            {error && <div className="otp-error">⚠️ {error}</div>}
            {message && <div className="otp-success">✅ {message}</div>}
            {resendMessage && <div className="otp-success">📨 {resendMessage}</div>}

            <button type="submit" className="otp-submit-btn" disabled={loading || otp.length < 6}>
              {loading ? "Verifying..." : "Verify & Continue →"}
            </button>

            <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={resendLoading || cooldown > 0}
            >
              {resendLoading
                  ? "Sending..."
                  : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "🔁 Resend OTP"}
            </button>
          </form>

          <div className="otp-footer">
            <span>Wrong account?</span>
            <Link to="/signup">Start over</Link>
          </div>
        </div>
      </div>
  );
}
