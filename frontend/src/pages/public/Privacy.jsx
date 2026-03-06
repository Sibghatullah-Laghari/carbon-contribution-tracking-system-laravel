import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const sections = [
    {
        id: "collection",
        icon: "📋",
        title: "Information We Collect",
        clauses: [
            { title: "Account Information", text: "When you create a CCTRS account, we collect your full name, email address, username, and password (stored in encrypted form). If you sign up via Google, we receive your name and email from Google's OAuth service." },
            { title: "Activity Data", text: "When you submit eco-friendly activities, we collect the activity type, quantity, date and time of submission, GPS coordinates at the time of submission, and photographic proof images." },
            { title: "Usage Data", text: "We may collect basic usage information such as pages visited and features used to help us improve the platform. This data is anonymised and not linked to your personal identity." },
        ]
    },
    {
        id: "usage",
        icon: "⚙️",
        title: "How We Use Your Information",
        clauses: [
            { title: "Platform Operation", text: "We use your information to operate CCTRS — verifying your submitted activities, calculating carbon points, updating your badge level, and displaying your ranking on the leaderboard." },
            { title: "Communications", text: "We use your email address to send OTP verification codes, password reset links, activity status notifications (approved/rejected), and important platform updates. We do not send marketing emails." },
            { title: "Safety & Fraud Prevention", text: "We use activity data and GPS information to detect and prevent fraudulent submissions, ensuring the integrity of the platform for all users." },
        ]
    },
    {
        id: "sharing",
        icon: "🤝",
        title: "Information Sharing",
        clauses: [
            { title: "Public Leaderboard", text: "Your display name, email address, carbon points, and badge level are visible to all registered users on the public leaderboard. By creating an account, you consent to this public display." },
            { title: "Administrator Access", text: "CCTRS administrators can view your submitted proof photos, GPS coordinates, and activity history for the purpose of verifying your submissions. This access is strictly limited to verification purposes." },
            { title: "No Third-Party Selling", text: "CCTRS does not sell, rent, or trade your personal information to any third party. We do not use your data for advertising purposes, and we do not share your data with advertisers." },
            { title: "Legal Requirements", text: "We may disclose your information if required to do so by Pakistani law or in response to valid legal process, such as a court order or government request." },
        ]
    },
    {
        id: "storage",
        icon: "🗄️",
        title: "Data Storage & Security",
        clauses: [
            { title: "Cloud Storage", text: "All data is stored on secure cloud infrastructure (Supabase/PostgreSQL) with industry-standard encryption. Proof images are stored as encoded data within the database." },
            { title: "Security Measures", text: "We implement technical measures including encrypted passwords (BCrypt), JWT-based authentication, and HTTPS to protect your data from unauthorised access." },
            { title: "Data Retention", text: "Your data is retained for as long as your account is active. Upon account deletion, your data is permanently removed within 30 days. Activity data may be retained for up to 90 days for audit purposes." },
        ]
    },
    {
        id: "rights",
        icon: "✋",
        title: "Your Rights",
        clauses: [
            { title: "Access Your Data", text: "You have the right to request a copy of all personal data CCTRS holds about you. Contact us at cctrsapp@gmail.com and we will respond within 30 days." },
            { title: "Correct Your Data", text: "If any of your personal information is inaccurate, you may request a correction by contacting our support team. We will update your records promptly." },
            { title: "Delete Your Data", text: "You may request deletion of your account and all associated personal data at any time. Send your request to cctrsapp@gmail.com. Deletion is irreversible and completed within 30 days." },
            { title: "Withdraw Consent", text: "You may withdraw consent for your data to be used for any non-essential purposes at any time. Note that withdrawing consent for essential uses (such as activity verification) may prevent you from using the platform." },
        ]
    },
    {
        id: "cookies",
        icon: "🍪",
        title: "Cookies",
        clauses: [
            { title: "Essential Cookies", text: "CCTRS uses essential cookies to maintain your login session and remember your preferences. These cookies are necessary for the platform to function and cannot be disabled." },
            { title: "No Advertising Cookies", text: "We do not use advertising cookies or tracking pixels. We do not allow third-party advertisers to place cookies on our platform." },
            { title: "Managing Cookies", text: "You can manage or delete cookies through your browser settings. Note that disabling essential cookies may prevent you from logging in or using the platform properly." },
        ]
    },
];

export default function Privacy() {
    const [activeSection, setActiveSection] = useState("collection");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="privacy-page">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .privacy-page { font-family: 'DM Sans', sans-serif; background: #f5faf9; color: #1a1a1a; min-height: 100vh; }

        .priv-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 3rem; background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px); border-bottom: 1px solid #e0f0ed;
          box-shadow: 0 2px 20px rgba(42,157,143,0.08);
        }
        .priv-nav-brand { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .priv-nav-name { font-size: 1.2rem; font-weight: 700; color: #2a9d8f; }
        .priv-nav-back {
          font-size: 0.875rem; font-weight: 600; color: #2a9d8f;
          text-decoration: none; padding: 0.5rem 1.1rem;
          border: 2px solid #2a9d8f; border-radius: 8px; transition: all 0.2s;
        }
        .priv-nav-back:hover { background: #2a9d8f; color: #fff; }

        .priv-hero {
          background: linear-gradient(135deg, #0f4d43 0%, #1a7a6e 50%, #2a9d8f 100%);
          padding: 9rem 3rem 5rem; text-align: center;
        }
        .priv-hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(2rem, 4vw, 3rem); color: #fff; margin-bottom: 0.75rem; }
        .priv-hero p { font-size: 1rem; color: rgba(255,255,255,0.8); max-width: 500px; margin: 0 auto 2rem; line-height: 1.7; }
        .priv-meta {
          display: inline-flex; gap: 2rem;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px; padding: 0.9rem 2rem;
        }
        .priv-meta-item { text-align: center; }
        .priv-meta-label { font-size: 0.72rem; color: rgba(255,255,255,0.65); font-weight: 600; text-transform: uppercase; }
        .priv-meta-value { font-size: 0.9rem; color: #fff; font-weight: 700; margin-top: 2px; }

        .priv-layout {
          max-width: 1100px; margin: 0 auto; padding: 3rem 2rem 5rem;
          display: grid; grid-template-columns: 220px 1fr; gap: 2.5rem; align-items: start;
        }

        .priv-sidebar {
          position: sticky; top: 90px; background: #fff;
          border-radius: 16px; border: 1.5px solid #e0f0ed;
          overflow: hidden; box-shadow: 0 4px 20px rgba(42,157,143,0.07);
        }
        .priv-sidebar-title {
          padding: 0.9rem 1.25rem; font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em; color: #2a9d8f;
          background: #f0faf8; border-bottom: 1px solid #e0f0ed;
        }
        .priv-sidebar-item {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.85rem 1.25rem; font-size: 0.875rem; font-weight: 500;
          color: #555; cursor: pointer; transition: all 0.2s;
          border-left: 3px solid transparent; border-bottom: 1px solid #f5faf9;
        }
        .priv-sidebar-item:last-child { border-bottom: none; }
        .priv-sidebar-item:hover { background: #f5faf9; color: #2a9d8f; }
        .priv-sidebar-item.active { background: #f0faf8; color: #2a9d8f; border-left-color: #2a9d8f; font-weight: 700; }

        .priv-content { display: flex; flex-direction: column; gap: 2rem; }

        .priv-section {
          background: #fff; border-radius: 20px; border: 1.5px solid #e0f0ed;
          overflow: hidden; box-shadow: 0 4px 20px rgba(42,157,143,0.06);
          scroll-margin-top: 100px; transition: box-shadow 0.3s;
        }
        .priv-section:hover { box-shadow: 0 8px 32px rgba(42,157,143,0.12); }

        .priv-section-header {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.25rem 1.75rem;
          background: linear-gradient(135deg, #0f4d43, #2a9d8f);
        }
        .priv-section-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
        }
        .priv-section-header h2 { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #fff; }

        .priv-section-body { padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }

        .priv-clause {
          padding-left: 1rem; border-left: 3px solid #e0f0ed; transition: border-color 0.2s;
        }
        .priv-clause:hover { border-left-color: #2a9d8f; }
        .priv-clause-title {
          font-size: 0.88rem; font-weight: 700; color: #1a6b5e;
          margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.4rem;
        }
        .priv-clause-title::before { content: ''; width: 6px; height: 6px; background: #2a9d8f; border-radius: 50%; flex-shrink: 0; }
        .priv-clause p { font-size: 0.875rem; color: #555; line-height: 1.75; }

        .priv-footer {
          max-width: 1100px; margin: 0 auto 4rem; padding: 0 2rem;
        }
        .priv-footer-inner {
          background: linear-gradient(135deg, #0f4d43, #2a9d8f);
          border-radius: 20px; padding: 2.5rem 3rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 2rem; flex-wrap: wrap; box-shadow: 0 8px 32px rgba(42,157,143,0.25);
        }
        .priv-footer-inner h3 { font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: #fff; margin-bottom: 0.3rem; }
        .priv-footer-inner p { font-size: 0.875rem; color: rgba(255,255,255,0.75); }
        .priv-footer-btn {
          padding: 0.75rem 1.5rem; border-radius: 10px; background: #fff;
          color: #2a9d8f; font-weight: 700; font-size: 0.9rem;
          text-decoration: none; white-space: nowrap; transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .priv-footer-btn:hover { transform: translateY(-2px); }

        @media (max-width: 768px) {
          .priv-layout { grid-template-columns: 1fr; }
          .priv-sidebar { position: static; }
          .priv-nav { padding: 1rem 1.5rem; }
          .priv-hero { padding: 7rem 1.5rem 3rem; }
          .priv-meta { flex-direction: column; gap: 1rem; }
          .priv-footer-inner { flex-direction: column; }
        }
      `}</style>

            <nav className="priv-nav">
                <Link className="priv-nav-brand" to="/">
                    <span style={{fontSize:'1.6rem'}}>🌍</span>
                    <span className="priv-nav-name">CCTRS</span>
                </Link>
                <Link className="priv-nav-back" to="/">← Back to Home</Link>
            </nav>

            <div className="priv-hero">
                <div style={{display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'100px', padding:'0.4rem 1.1rem', fontSize:'0.8rem', fontWeight:600, color:'#fff', marginBottom:'1.5rem'}}>
                    🔒 Privacy
                </div>
                <h1>Privacy Policy</h1>
                <p>We are committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.</p>
                <div className="priv-meta">
                    <div className="priv-meta-item"><div className="priv-meta-label">Last Updated</div><div className="priv-meta-value">March 2026</div></div>
                    <div className="priv-meta-item"><div className="priv-meta-label">Jurisdiction</div><div className="priv-meta-value">Pakistan</div></div>
                    <div className="priv-meta-item"><div className="priv-meta-label">Version</div><div className="priv-meta-value">1.0</div></div>
                </div>
            </div>

            <div className="priv-layout">
                <div className="priv-sidebar">
                    <div className="priv-sidebar-title">Contents</div>
                    {sections.map(s => (
                        <div key={s.id} className={`priv-sidebar-item ${activeSection === s.id ? 'active' : ''}`} onClick={() => scrollTo(s.id)}>
                            <span>{s.icon}</span>{s.title}
                        </div>
                    ))}
                </div>

                <div className="priv-content">
                    {sections.map(section => (
                        <div key={section.id} id={section.id} className="priv-section">
                            <div className="priv-section-header">
                                <div className="priv-section-icon">{section.icon}</div>
                                <h2>{section.title}</h2>
                            </div>
                            <div className="priv-section-body">
                                {section.clauses.map((clause, i) => (
                                    <div key={i} className="priv-clause">
                                        <div className="priv-clause-title">{clause.title}</div>
                                        <p>{clause.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="priv-footer">
                <div className="priv-footer-inner">
                    <div>
                        <h3>Questions about your privacy?</h3>
                        <p>Contact us at cctrsapp@gmail.com — we'll respond within 30 days.</p>
                    </div>
                    <a className="priv-footer-btn" href="mailto:cctrsapp@gmail.com">Contact Us →</a>
                </div>
            </div>
        </div>
    );
}
