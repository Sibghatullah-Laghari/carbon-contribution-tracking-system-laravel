import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1400);  // water starts
    const t3 = setTimeout(() => setPhase(3), 3400);  // water stops after 2s
    const t4 = setTimeout(() => setPhase(4), 4200);
    const t5 = setTimeout(() => setPhase(5), 5300);
    const t6 = setTimeout(() => setShowSplash(false), 6000);
    return () => [t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const resData = response?.data?.data;
      if (!resData || !resData.token) throw new Error("Invalid login response");

      // Sets token in localStorage AND updates React auth context state atomically
      login(resData.token, resData.role, resData.email);

      if (resData.role === "ADMIN") {
        navigate("/admin-cctrs-2024", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-page">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: linear-gradient(160deg, #0f4d43 0%, #1a7a6e 40%, #2a9d8f 75%, #3dbda8 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }

        /* SPLASH */
        .splash {
          position: fixed; inset: 0; z-index: 999;
          background: linear-gradient(160deg, #0f4d43 0%, #1a7a6e 40%, #2a9d8f 75%, #3dbda8 100%);
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
          transition: opacity 0.7s ease;
        }
        .splash.fading { opacity: 0; pointer-events: none; }
        .splash-stage { position: relative; width: 320px; height: 340px; }

        .can-wrap {
          position: absolute; top: 10px; right: 20px;
          opacity: 0;
          transform: translate(80px, -30px) rotate(0deg);
          transition: all 0.8s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .can-wrap.appear { opacity: 1; transform: translate(0px, 0px) rotate(0deg); }
        .can-wrap.pour { transform: translate(-20px, 15px) rotate(-45deg); }

        .water-wrap {
  position: absolute;
  top: 175px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}
.water-wrap.show { opacity: 1; }

        .w-stream { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .w-line {
          width: 3px; border-radius: 4px;
          background: rgba(180,230,255,0.9);
          animation: wfall 0.45s linear infinite;
        }
        .w-line:nth-child(1) { height: 14px; animation-delay: 0s; }
        .w-line:nth-child(2) { height: 11px; animation-delay: 0.08s; width: 2.5px; }
        .w-line:nth-child(3) { height: 14px; animation-delay: 0.16s; }
        .w-line:nth-child(4) { height: 10px; animation-delay: 0.24s; width: 2px; }
        .w-line:nth-child(5) { height: 13px; animation-delay: 0.32s; }
        .w-line:nth-child(6) { height: 9px; animation-delay: 0.40s; width: 2px; }
        @keyframes wfall {
          0% { transform: translateY(-6px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(22px); opacity: 0; }
        }

        .pot-wrap {
          position: absolute; bottom: 20px;
          left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center;
        }
        .plant-svg-wrap {
          margin-bottom: -4px; height: 130px;
          display: flex; align-items: flex-end; justify-content: center;
          overflow: visible;
        }
        .trunk { transform-origin: bottom center; transform: scaleY(0); transition: transform 0.6s ease; }
        .trunk.show { transform: scaleY(1); }
        .branch-l { transform-origin: 70px 80px; transform: scale(0); transition: transform 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .branch-l.show { transform: scale(1); }
        .branch-r { transform-origin: 70px 65px; transform: scale(0); transition: transform 0.5s 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        .branch-r.show { transform: scale(1); }
        .canopy-1 { transform-origin: center bottom; transform: scale(0); transition: transform 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .canopy-1.show { transform: scale(1); }
        .canopy-2 { transform-origin: center bottom; transform: scale(0); transition: transform 0.5s 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .canopy-2.show { transform: scale(1); }
        .canopy-3 { transform-origin: center bottom; transform: scale(0); transition: transform 0.5s 0.55s cubic-bezier(0.34,1.56,0.64,1); }
        .canopy-3.show { transform: scale(1); }
        .sprout-g { transform-origin: center bottom; transform: scale(0); transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        .sprout-g.show { transform: scale(1); }
        .ground-line { width: 160px; height: 3px; background: rgba(255,255,255,0.15); border-radius: 100px; margin-top: 2px; }

        .signup-logo-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 3rem;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e8f5f2;
  box-shadow: 0 2px 16px rgba(42,157,143,0.06);
  width: 100%;
}
.signup-logo-left { display: flex; align-items: center; gap: 0.5rem; }
.signup-logo-icon { font-size: 1.6rem; }
.signup-logo-name { font-size: 1.2rem; font-weight: 800; color: #2a9d8f; }
.signup-signin-link {
  font-weight: 700; font-size: 0.9rem; color: #fff;
  text-decoration: none; padding: 0.55rem 1.4rem;
  border-radius: 8px; background: #2a9d8f;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(42,157,143,0.3);
}
.signup-signin-link:hover { background: #238a7e; transform: translateY(-1px); }

        /* CARD */
        .login-form-box {
          width: 100%; max-width: 440px;
          background: #fff;
          border-radius: 24px;
          padding: 2.5rem 2.5rem 2rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .login-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.85rem; color: #2a9d8f; text-decoration: none;
          font-weight: 600; margin-bottom: 1.8rem; transition: gap 0.2s;
        }
        .login-back:hover { gap: 0.7rem; }

        .login-form-header { margin-bottom: 2rem; text-align: center; }
        .login-form-icon { font-size: 2.8rem; margin-bottom: 0.8rem; display: block; }
        .login-form-header h1 {
          font-size: 1.8rem; font-weight: 800; color: #1a1a1a;
          margin-bottom: 0.5rem; letter-spacing: -0.02em;
        }
        .login-form-header p { font-size: 0.875rem; color: #999; line-height: 1.6; }

        .login-form { display: flex; flex-direction: column; gap: 1.2rem; }
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

        .login-error {
          background: #fff0f0; border: 1px solid #ffcccc;
          color: #cc0000; font-size: 0.85rem;
          padding: 0.75rem 1rem; border-radius: 8px;
        }

        .login-submit-btn {
          width: 100%; padding: 0.92rem;
          background: #2a9d8f; color: #fff;
          font-size: 1rem; font-weight: 700;
          border: none; border-radius: 10px; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(42,157,143,0.35);
          margin-top: 0.4rem;
          letter-spacing: 0.01em;
        }
        .login-submit-btn:hover:not(:disabled) {
          background: #238a7e; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(42,157,143,0.45);
        }
        .login-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .login-form-footer {
          text-align: center; margin-top: 1.3rem;
          padding-top: 1.2rem;
          border-top: 1px solid #f0f4f3;
          font-size: 0.875rem; color: #aaa;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
        }
        .login-form-footer a { color: #2a9d8f; text-decoration: none; font-weight: 700; }
        .login-form-footer a:hover { text-decoration: underline; }
      `}</style>

        {/* SPLASH */}
        {showSplash && (
            <div className={`splash ${phase >= 5 ? "fading" : ""}`}>
              <div className="splash-stage">
                <div className={`can-wrap ${phase >= 1 ? "appear" : ""} ${phase >= 2 ? "pour" : ""}`}>
                  <svg width="110" height="90" viewBox="0 0 110 90" fill="none">
                    <rect x="20" y="30" width="55" height="38" rx="10" fill="#7ecac0"/>
                    <rect x="20" y="30" width="55" height="12" rx="6" fill="#9adbd2"/>
                    <path d="M75 38 Q98 30 95 58 Q92 68 75 65" stroke="#5bada3" strokeWidth="6" fill="none" strokeLinecap="round"/>
                    <path d="M20 44 L2 36" stroke="#5bada3" strokeWidth="7" strokeLinecap="round"/>
                    <ellipse cx="2" cy="36" rx="4" ry="4" fill="#5bada3"/>
                    <ellipse cx="38" cy="40" rx="6" ry="3" fill="rgba(255,255,255,0.25)" transform="rotate(-10 38 40)"/>
                  </svg>
                </div>


                {/* Dotted line */}
                {phase === 2 && (
                    <svg style={{position:"absolute", top:"125px", left:"50%", transform:"translateX(-50%)", overflow:"visible"}} width="10" height="140" viewBox="0 0 10 140">
                      <line x1="5" y1="0" x2="5" y2="140" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round"/>
                    </svg>
                )}

                {/* Water stream */}
                <div className={`water-wrap ${phase === 2 ? "show" : ""}`}>
                  <div className="w-stream">
                    <div className="w-line"></div>
                    <div className="w-line"></div>
                    <div className="w-line"></div>
                    <div className="w-line"></div>
                    <div className="w-line"></div>
                    <div className="w-line"></div>
                  </div>
                </div>

                <div className="pot-wrap">
                  <div className="plant-svg-wrap">
                    <svg width="140" height="130" viewBox="0 0 140 130" fill="none" overflow="visible">
                      <g className={`sprout-g ${phase === 3 ? "show" : ""}`}>
                        <rect x="67" y="60" width="6" height="45" rx="3" fill="#4a8c3f"/>
                        <ellipse cx="52" cy="72" rx="16" ry="9" fill="#5aad4e" transform="rotate(-30 52 72)"/>
                        <ellipse cx="88" cy="68" rx="16" ry="9" fill="#6bc45e" transform="rotate(30 88 68)"/>
                      </g>
                      <g className={`trunk ${phase >= 4 ? "show" : ""}`}>
                        <rect x="63" y="40" width="14" height="70" rx="6" fill="#6b4c2a"/>
                        <rect x="66" y="55" width="3" height="20" rx="1.5" fill="#5a3e22" opacity="0.5"/>
                        <rect x="71" y="65" width="3" height="25" rx="1.5" fill="#5a3e22" opacity="0.4"/>
                      </g>
                      <g className={`branch-l ${phase >= 4 ? "show" : ""}`}>
                        <path d="M70 80 Q45 70 30 55" stroke="#6b4c2a" strokeWidth="7" strokeLinecap="round" fill="none"/>
                        <path d="M30 55 Q20 42 22 30" stroke="#6b4c2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
                      </g>
                      <g className={`branch-r ${phase >= 4 ? "show" : ""}`}>
                        <path d="M70 65 Q95 55 110 40" stroke="#6b4c2a" strokeWidth="7" strokeLinecap="round" fill="none"/>
                        <path d="M110 40 Q120 28 118 18" stroke="#6b4c2a" strokeWidth="5" strokeLinecap="round" fill="none"/>
                      </g>
                      <ellipse cx="70" cy="52" rx="48" ry="30" className={`canopy-1 ${phase >= 4 ? "show" : ""}`} fill="#3d9e35"/>
                      <ellipse cx="70" cy="35" rx="38" ry="26" className={`canopy-2 ${phase >= 4 ? "show" : ""}`} fill="#48b83e"/>
                      <ellipse cx="70" cy="18" rx="26" ry="20" className={`canopy-3 ${phase >= 4 ? "show" : ""}`} fill="#5dcc52"/>
                      {phase >= 4 && <>
                        <ellipse cx="58" cy="14" rx="8" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(-20 58 14)"/>
                        <ellipse cx="85" cy="30" rx="6" ry="4" fill="rgba(255,255,255,0.12)" transform="rotate(15 85 30)"/>
                      </>}
                    </svg>
                  </div>
                  <svg width="120" height="75" viewBox="0 0 120 75" fill="none">
                    <ellipse cx="60" cy="16" rx="46" ry="10" fill="#4a2f0d"/>
                    <ellipse cx="60" cy="14" rx="40" ry="7" fill="#5c3a10"/>
                    {phase >= 2 && <ellipse cx="60" cy="14" rx="20" ry="4" fill="#3a2208" opacity="0.7"/>}
                    <rect x="12" y="12" width="96" height="13" rx="6.5" fill="#c0763a"/>
                    <rect x="12" y="12" width="96" height="6" rx="3" fill="#d4894a"/>
                    <path d="M18 25 Q14 68 60 72 Q106 68 102 25 Z" fill="#b86d32"/>
                    <path d="M18 25 Q16 68 38 71" stroke="#9e5c28" strokeWidth="2" fill="none" opacity="0.5"/>
                    <ellipse cx="36" cy="45" rx="6" ry="14" fill="rgba(255,255,255,0.12)" transform="rotate(-12 36 45)"/>
                    <ellipse cx="60" cy="71" rx="30" ry="4" fill="#8a4e20" opacity="0.6"/>
                  </svg>
                  <div className="ground-line"></div>
                </div>
              </div>
            </div>
        )}

        {/* TOP NAV */}
        <div className="signup-logo-bar">
          <div className="signup-logo-left">
            <span className="signup-logo-icon">🌍</span>
            <span className="signup-logo-name">CCTRS</span>
          </div>
          <Link className="signup-signin-link" to="/signup">Sign Up</Link>
        </div>

        {/* push content below fixed nav */}
        <div style={{height: "80px"}}></div>

        {/* WHITE CARD */}
        <div className="login-form-box">
          <Link className="login-back" to="/">← Back to home</Link>
          <div className="login-form-header">
            <span className="login-form-icon">🌿</span>
            <h1>Welcome back</h1>
            <p>Track your impact and earn rewards for sustainable actions.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label>Password</label>
              <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              /><div style={{textAlign:"right", marginTop:"-0.5rem"}}>
              <Link to="/forgot-password" style={{fontSize:"0.82rem", color:"#2a9d8f", fontWeight:"600", textDecoration:"none"}}>
                Forgot password?
              </Link>
            </div>
            </div>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? " Logging In..." : "Login"}
            </button>
          </form>
          <div className="login-form-footer">
            <span>New here?</span>
            <Link to="/signup">Create an account</Link>
          </div>
        </div>
      </div>
  );
}