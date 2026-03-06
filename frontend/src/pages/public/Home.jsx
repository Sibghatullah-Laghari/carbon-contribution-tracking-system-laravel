import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")),
        { threshold: 0.1 }
    );
    document.querySelectorAll(".animate").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
      <div className="home">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .home { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a1a; overflow-x: hidden; }

        /* NAV */
        .home-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 3rem;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8f5f2;
          box-shadow: 0 2px 16px rgba(42,157,143,0.06);
        }
        .home-brand { display: flex; align-items: center; gap: 0.6rem; }
        .home-logo { font-size: 1.8rem; filter: drop-shadow(0 2px 4px rgba(42,157,143,0.3)); }
        .home-title {
          font-weight: 800; font-size: 1.3rem; color: #1a1a1a;
          letter-spacing: -0.01em;
          background: linear-gradient(135deg, #1a6b5e, #2a9d8f);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .home-actions { display: flex; align-items: center; gap: 0.75rem; }
        .ghost-btn {
  font-weight: 600; font-size: 0.9rem; color: #2a9d8f !important;
  text-decoration: none; padding: 0.55rem 1.3rem;
  border-radius: 8px; background: #ffffff;
  border: 1.5px solid #2a9d8f;
  transition: all 0.2s;
  box-shadow: 0 0 0 2px rgba(42,157,143,0.08);
}
.ghost-btn:hover { background: #f0faf9; color: #2a9d8f !important; transform: translateY(-1px); }
        .primary-btn {
          font-weight: 700; font-size: 0.9rem; color: #fff;
          text-decoration: none; padding: 0.55rem 1.4rem;
          border-radius: 8px; background: #2a9d8f;
          transition: all 0.2s; border: none; cursor: pointer;
          box-shadow: 0 2px 12px rgba(42,157,143,0.35);
        }
        .primary-btn:hover { background: #238a7e; transform: translateY(-1px); }

        /* HERO */
        .hero {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a6b5e 0%, #2a9d8f 55%, #26c69b 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 7rem 3rem 5rem; position: relative; overflow: hidden; text-align: center;
        }
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .hero-dot {
          position: absolute; border-radius: 50%;
          background: rgba(255,255,255,0.12);
          animation: float 6s ease-in-out infinite;
        }
        .hero-dot:nth-child(1) { width: 80px; height: 80px; top: 15%; left: 8%; animation-delay: 0s; }
        .hero-dot:nth-child(2) { width: 50px; height: 50px; top: 60%; left: 5%; animation-delay: 1s; }
        .hero-dot:nth-child(3) { width: 100px; height: 100px; top: 20%; right: 8%; animation-delay: 2s; }
        .hero-dot:nth-child(4) { width: 40px; height: 40px; top: 70%; right: 10%; animation-delay: 0.5s; }
        .hero-dot:nth-child(5) { width: 60px; height: 60px; bottom: 15%; left: 20%; animation-delay: 1.5s; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        .hero-inner { position: relative; z-index: 1; max-width: 800px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.35);
          border-radius: 100px; padding: 0.4rem 1.1rem;
          font-size: 0.8rem; font-weight: 600; color: #fff;
          margin-bottom: 1.5rem;
          animation: fadeDown 0.6s ease forwards;
        }
        .hero h1 {
          font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800;
          color: #fff; line-height: 1.15; letter-spacing: -0.03em;
          margin-bottom: 1.2rem;
          animation: fadeDown 0.6s 0.1s ease both;
        }
        .hero-desc {
          font-size: 1.1rem; color: rgba(255,255,255,0.85);
          line-height: 1.7; margin-bottom: 2.5rem;
          max-width: 560px; margin-left: auto; margin-right: auto;
          animation: fadeDown 0.6s 0.2s ease both;
        }
        .hero-buttons {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          margin-bottom: 3rem;
          animation: fadeDown 0.6s 0.3s ease both;
        }
        .btn-white {
          font-weight: 700; font-size: 1rem; color: #2a9d8f;
          text-decoration: none; padding: 0.9rem 2.2rem;
          border-radius: 10px; background: #fff;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }
        .btn-outline-white {
          font-weight: 600; font-size: 1rem; color: #fff;
          text-decoration: none; padding: 0.9rem 2.2rem;
          border-radius: 10px; border: 2px solid rgba(255,255,255,0.6);
          transition: all 0.25s;
        }
        .btn-outline-white:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
        .hero-stats {
          display: flex; gap: 2rem; justify-content: center;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
          border-radius: 16px; padding: 1.2rem 2rem;
          border: 1px solid rgba(255,255,255,0.2);
          animation: fadeDown 0.6s 0.4s ease both;
        }
        .hero-stat-item { text-align: center; }
        .hero-stat-value { font-size: 1.6rem; font-weight: 800; color: #fff; display: block; }
        .hero-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.75); font-weight: 500; }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* FEATURES */
        .features-section { padding: 5rem 2rem; background: #f8fffe; }
        .section-label {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
          color: #2a9d8f; text-transform: uppercase; text-align: center; margin-bottom: 0.5rem;
        }
        .section-title {
          font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800;
          color: #1a1a1a; text-align: center; margin-bottom: 0.75rem; letter-spacing: -0.02em;
        }
        .section-sub { font-size: 1rem; color: #666; text-align: center; margin-bottom: 3rem; }
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem; max-width: 1100px; margin: 0 auto;
        }
        .feature-card {
          background: #fff; border-radius: 20px; overflow: hidden;
          border: 1px solid #e8f5f2;
          box-shadow: 0 2px 12px rgba(42,157,143,0.06);
          transition: all 0.3s;
        }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(42,157,143,0.15); }
        .feature-card-top {
          height: 140px; display: flex; align-items: center; justify-content: center;
          font-size: 3.5rem;
        }
        .feature-card-top.green { background: linear-gradient(135deg, #1a8a7d, #2a9d8f); }
        .feature-card-top.teal  { background: linear-gradient(135deg, #1a8a7d, #2a9d8f); }
        .feature-card-top.mint  { background: linear-gradient(135deg, #1a8a7d, #2a9d8f); }
        .feature-card-body h3 { font-size: 1.05rem; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5rem; }
        .feature-card-body p { font-size: 0.875rem; color: #666; line-height: 1.6; margin-bottom: 1rem; }
        .feature-link {
          font-size: 0.85rem; font-weight: 600; color: #2a9d8f;
          text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;
          transition: gap 0.2s;
        }
        .feature-link:hover { gap: 0.6rem; }

        /* HOW IT WORKS - STEPS */
        .how-section { padding: 5rem 2rem; background: #fff; }
        .steps-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem; max-width: 1100px; margin: 3rem auto 0;
          position: relative;
        }
        .steps-grid::before {
          content: '';
          position: absolute; top: 40px; left: 12%; right: 12%;
          height: 2px; background: linear-gradient(90deg, #2a9d8f, #26c69b);
          z-index: 0;
        }
        .step-card { text-align: center; position: relative; z-index: 1; }
        .step-number {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #2a9d8f, #26c69b);
          color: #fff; font-size: 1.5rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.2rem;
          box-shadow: 0 4px 20px rgba(42,157,143,0.3);
          border: 4px solid #fff;
        }
        .step-card h3 { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5rem; }
        .step-card p { font-size: 0.85rem; color: #666; line-height: 1.6; }

        /* IMPACT */
        .impact-section { padding: 5rem 2rem; background: #f8fffe; text-align: center; }
        .impact-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem; max-width: 1100px; margin: 3rem auto 0;
        }
        .impact-card {
          background: #fff; border-radius: 16px; padding: 2rem 1.5rem;
          text-align: left; border: 1px solid #e8f5f2;
          transition: all 0.3s;
          box-shadow: 0 2px 12px rgba(42,157,143,0.05);
        }
        .impact-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(42,157,143,0.12); }
        .impact-card-icon { font-size: 2.2rem; margin-bottom: 1rem; }
        .impact-card h3 { font-size: 1.05rem; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5rem; }
        .impact-card p { font-size: 0.875rem; color: #666; line-height: 1.6; }
        .impact-tag {
          display: inline-block; margin-top: 1rem;
          font-size: 0.72rem; font-weight: 700; color: #2a9d8f;
          background: #e6f7f5; padding: 0.25rem 0.8rem; border-radius: 100px;
        }

        /* FOOTER */
        .home-footer { background: #0d3d35; padding: 4rem 2rem 1.5rem; }
        .footer-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem; padding-bottom: 3rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .footer-brand-title { font-size: 1.2rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .footer-brand p { font-size: 0.875rem; color: rgba(255,255,255,0.6); line-height: 1.7; }
        .footer-col h4 { font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 1rem; letter-spacing: 0.05em; text-transform: uppercase; }
        .footer-col ul { list-style: none; }
        .footer-col ul li { margin-bottom: 0.6rem; }
        .footer-col ul li a { font-size: 0.875rem; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
        .footer-col ul li a:hover { color: #4dd9b0; }
        .footer-contact p { font-size: 0.875rem; color: rgba(255,255,255,0.6); margin-bottom: 0.75rem; }
        .footer-contact a { font-size: 0.875rem; color: #4dd9b0; text-decoration: none; font-weight: 600; }
        .footer-contact a:hover { text-decoration: underline; }
        .footer-bottom { max-width: 1100px; margin: 1.5rem auto 0; text-align: center; font-size: 0.8rem; color: rgba(255,255,255,0.4); }

        /* ANIMATIONS */
        .animate { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .animate.visible { opacity: 1; transform: translateY(0); }
        .animate-delay-1 { transition-delay: 0.15s; }
        .animate-delay-2 { transition-delay: 0.3s; }
        .animate-delay-3 { transition-delay: 0.45s; }

        @media (max-width: 900px) {
          .features-grid, .impact-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr 1fr; }
          .steps-grid::before { display: none; }
          .footer-inner { grid-template-columns: 1fr 1fr; }
          .home-header { padding: 1rem 1.5rem; }
          .hero { padding: 6rem 1.5rem 4rem; }
          .hero-stats { flex-direction: column; gap: 1rem; }
        }
        @media (max-width: 600px) {
          .steps-grid { grid-template-columns: 1fr; }
          .footer-inner { grid-template-columns: 1fr; }
        }
      `}</style>

        {/* NAV */}
        <header className="home-header">
          <div className="home-brand">
            <span className="home-logo">🌍</span>
            <span className="home-title">CCTRS</span>
          </div>
          <div className="home-actions">
            <Link className="ghost-btn" to="/login">Login</Link>
            <Link className="primary-btn" to="/signup">Sign Up</Link>
          </div>
        </header>

        {/* HERO */}
        <section className="hero">
          <div className="hero-dot"></div>
          <div className="hero-dot"></div>
          <div className="hero-dot"></div>
          <div className="hero-dot"></div>
          <div className="hero-dot"></div>
          <div className="hero-inner">
            <div className="hero-badge">🌱 Eco Rewards Platform</div>
            <h1>Turn everyday eco actions into rewards</h1>
            <p className="hero-desc">
              Track your sustainable habits, earn points, and celebrate your impact
              with badges and community recognition.
            </p>
            <div className="hero-buttons">
              <Link className="btn-white" to="/signup">Get Started →</Link>
              <Link className="btn-outline-white" to="/login">I already have an account</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat-item">
                <span className="hero-stat-value">+240</span>
                <span className="hero-stat-label">Monthly Points</span>
              </div>
              <div className="hero-stat-item">
                <span className="hero-stat-value">18</span>
                <span className="hero-stat-label">Activities Logged</span>
              </div>
              <div className="hero-stat-item">
                <span className="hero-stat-value">Silver</span>
                <span className="hero-stat-label">Current Badge</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <h2 className="section-title animate">Everything you need to go green</h2>
          <p className="section-sub animate">Simple tools to track, verify and celebrate your eco impact.</p>
          <div className="features-grid">
            <div className="feature-card animate">
              <div className="feature-card-top green">📷</div>
              <div className="feature-card-body">
                <h3>Quick Verification</h3>
                <p>Capture a photo and location to validate your eco-friendly actions instantly.</p>
                <Link className="feature-link" to="/signup">Get started →</Link>
              </div>
            </div>
            <div className="feature-card animate animate-delay-1">
              <div className="feature-card-top teal">📊</div>
              <div className="feature-card-body">
                <h3>Progress Insights</h3>
                <p>Track monthly performance and keep improving your sustainability score over time.</p>
                <Link className="feature-link" to="/signup">View insights →</Link>
              </div>
            </div>
            <div className="feature-card animate animate-delay-2">
              <div className="feature-card-top mint">🏆</div>
              <div className="feature-card-body">
                <h3>Earn Recognition</h3>
                <p>Climb the leaderboard and unlock badges as your environmental impact grows.</p>
                <Link className="feature-link" to="/signup">See badges →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - STEPS */}
        <section className="how-section">
          <p className="section-label animate">How It Works</p>
          <h2 className="section-title animate">Start making an impact in 4 steps</h2>
          <p className="section-sub animate">Simple process to track and get rewarded for your eco actions.</p>
          <div className="steps-grid">
            <div className="step-card animate">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up in seconds and set up your eco profile to start tracking your impact.</p>
            </div>
            <div className="step-card animate animate-delay-1">
              <div className="step-number">2</div>
              <h3>Log Activity</h3>
              <p>Submit eco activities like tree planting, public transport, or recycling.</p>
            </div>
            <div className="step-card animate animate-delay-2">
              <div className="step-number">3</div>
              <h3>Verify & Prove</h3>
              <p>Upload a photo and GPS location as proof. Our team reviews your submission.</p>
            </div>
            <div className="step-card animate animate-delay-3">
              <div className="step-number">4</div>
              <h3>Earn Points</h3>
              <p>Get carbon points, unlock badges, and climb the community leaderboard!</p>
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section className="impact-section">
          <p className="section-label animate">Real Impact</p>
          <h2 className="section-title animate">Small Actions, Big Impact</h2>
          <p className="section-sub animate">Simple changes in your daily routine can lead to massive environmental benefits.</p>
          <div className="impact-grid">
            <div className="impact-card animate">
              <div className="impact-card-icon">🌳</div>
              <h3>Plant a Tree</h3>
              <p>Each tree absorbs up to 22 kg of CO₂ annually, improving air quality and supporting biodiversity.</p>
              <span className="impact-tag">🌱 Active Activity</span>
            </div>
            <div className="impact-card animate animate-delay-1">
              <div className="impact-card-icon">🚌</div>
              <h3>Use Public Transport</h3>
              <p>Cuts individual CO₂ emissions by 50% per trip compared to driving a personal vehicle.</p>
              <span className="impact-tag">🌱 Active Activity</span>
            </div>
            <div className="impact-card animate animate-delay-2">
              <div className="impact-card-icon">♻️</div>
              <h3>Recycling</h3>
              <p>Recycling 1 kg of waste reduces landfill usage and saves significant energy in production.</p>
              <span className="impact-tag">🌱 Active Activity</span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="home-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-brand-title"><span>🌍</span> CCTRS</div>
              <p>Our mission is to make it easier for everyone to track their environmental impact and make sustainable choices every day.</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/leaderboard">Leaderboard</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/help">Help</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact Us</h4>
              <div className="footer-contact">
                <p>Have questions or feedback? Reach us at:</p>
                <a href="mailto:cctrsapp@gmail.com">cctrsapp@gmail.com</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 CCTRS. All rights reserved. · Built with 💚 for the planet</p>
          </div>
        </footer>
      </div>
  );
}