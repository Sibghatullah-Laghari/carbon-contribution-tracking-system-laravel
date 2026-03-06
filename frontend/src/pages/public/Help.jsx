import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const helpTopics = [
    {
        id: "getting-started",
        icon: "🚀",
        title: "Getting Started",
        articles: [
            {
                q: "How do I create an account?",
                a: "Click 'Sign Up' on the homepage. Fill in your full name, username, email and password. You'll receive a 6-digit OTP to your email — enter it to verify your account. Once verified, you can log in and start tracking your eco activities."
            },
            {
                q: "How do I log in?",
                a: "Click 'Login' on the homepage and enter your registered email and password. You can also use 'Continue with Google' to sign in instantly with your Google account."
            },
            {
                q: "I forgot my password. What do I do?",
                a: "On the login page, click 'Forgot Password'. Enter your registered email address and we'll send you a password reset link. The link expires in 30 minutes so use it promptly."
            },
            {
                q: "Can I change my username or email after signing up?",
                a: "Currently, username and email changes are not supported through the app. Please contact us at cctrsapp@gmail.com if you need to update your account details."
            }
        ]
    },
    {
        id: "activities",
        icon: "🌱",
        title: "Submitting Activities",
        articles: [
            {
                q: "What activities can I submit?",
                a: "CCTRS currently supports three activity types: Tree Plantation, Public Transport usage, and Recycling. Each has specific proof requirements to ensure fair and accurate verification."
            },
            {
                q: "How do I submit a Tree Plantation activity?",
                a: "Go to Submit Activity and select Tree Plantation. Enter the number of trees planted, upload a clear photo showing the planted tree(s), and allow location access so your GPS coordinates are recorded. Submit and wait for admin approval."
            },
            {
                q: "How do I submit a Public Transport activity?",
                a: "Select Public Transport, enter the distance travelled in km, and enable GPS tracking during your journey. The system validates your route speed to confirm you used public transport. Upload proof and submit."
            },
            {
                q: "How do I submit a Recycling activity?",
                a: "Select Recycling and upload 3 photos: your waste before sorting, sorted by category, and placed in recycling bins. Enter the weight in kg and submit with your GPS location."
            },
            {
                q: "How long does approval take?",
                a: "Activities are reviewed by administrators within 3–5 business days. You'll be able to see the status of your submission (Pending, Approved, or Rejected) in My Activities."
            }
        ]
    },
    {
        id: "points",
        icon: "⭐",
        title: "Points & Badges",
        articles: [
            {
                q: "How are carbon points calculated?",
                a: "Points are awarded based on the type and quantity of your verified activity. Tree Plantation earns points per tree, Public Transport earns points per km, and Recycling earns points per kg. Exact values are set by administrators."
            },
            {
                q: "What are the badge levels?",
                a: "There are three badge levels: Bronze (0–100 points), Silver (101–300 points), and Gold (300+ points). Your badge is automatically updated as you earn more points."
            },
            {
                q: "Why haven't my points been added yet?",
                a: "Points are only added after your activity is approved by an administrator. If your activity is still showing as Pending, please wait for the review to be completed."
            },
            {
                q: "Can points be removed?",
                a: "Yes. If an approved activity is later found to be fraudulent, administrators may reverse the points awarded. Repeated violations may result in account suspension."
            }
        ]
    },
    {
        id: "account",
        icon: "👤",
        title: "Account & Privacy",
        articles: [
            {
                q: "Who can see my information?",
                a: "Your name, email, carbon points and badge level are visible to other users on the public leaderboard. Your proof photos and GPS coordinates are only visible to CCTRS administrators for verification purposes."
            },
            {
                q: "How do I delete my account?",
                a: "Send a deletion request to cctrsapp@gmail.com with your registered email and username. Your account and all associated data will be permanently deleted within 30 days."
            },
            {
                q: "Is my data shared with third parties?",
                a: "No. CCTRS does not sell, trade, or share your personal data with any third parties. Your data is used solely to operate the platform."
            }
        ]
    }
];

export default function Help() {
    const [activeId, setActiveId] = useState(null);
    const [activeTopic, setActiveTopic] = useState("getting-started");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const toggle = (id) => setActiveId(activeId === id ? null : id);

    return (
        <div className="help-page">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .help-page { font-family: 'DM Sans', sans-serif; background: #f5faf9; color: #1a1a1a; min-height: 100vh; }

        .help-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 3rem;
          background: rgba(255,255,255,0.97); backdrop-filter: blur(12px);
          border-bottom: 1px solid #e0f0ed;
          box-shadow: 0 2px 20px rgba(42,157,143,0.08);
        }
        .help-nav-brand { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .help-nav-name { font-size: 1.2rem; font-weight: 700; color: #2a9d8f; }
        .help-nav-back {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.875rem; font-weight: 600; color: #2a9d8f;
          text-decoration: none; padding: 0.5rem 1.1rem;
          border: 2px solid #2a9d8f; border-radius: 8px; transition: all 0.2s;
        }
        .help-nav-back:hover { background: #2a9d8f; color: #fff; }

        .help-hero {
          background: linear-gradient(135deg, #0f4d43 0%, #1a7a6e 50%, #2a9d8f 100%);
          padding: 9rem 3rem 5rem; text-align: center;
        }
        .help-hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(2rem, 4vw, 3rem); color: #fff; margin-bottom: 0.75rem; }
        .help-hero p { font-size: 1rem; color: rgba(255,255,255,0.8); max-width: 500px; margin: 0 auto 2rem; line-height: 1.7; }
        .help-contact-bar {
          display: inline-flex; align-items: center; gap: 1rem;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px; padding: 0.9rem 1.75rem;
          font-size: 0.875rem; color: #fff; font-weight: 500;
        }
        .help-contact-bar a { color: #a8f0e0; font-weight: 700; text-decoration: none; }
        .help-contact-bar a:hover { text-decoration: underline; }

        .help-layout {
          max-width: 1100px; margin: 0 auto; padding: 3rem 2rem 5rem;
          display: grid; grid-template-columns: 220px 1fr; gap: 2.5rem; align-items: start;
        }

        .help-sidebar {
          position: sticky; top: 90px; background: #fff;
          border-radius: 16px; border: 1.5px solid #e0f0ed;
          overflow: hidden; box-shadow: 0 4px 20px rgba(42,157,143,0.07);
        }
        .help-sidebar-title {
          padding: 0.9rem 1.25rem; font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em; color: #2a9d8f;
          background: #f0faf8; border-bottom: 1px solid #e0f0ed;
        }
        .help-sidebar-item {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.85rem 1.25rem; font-size: 0.875rem; font-weight: 500;
          color: #555; cursor: pointer; transition: all 0.2s;
          border-left: 3px solid transparent; border-bottom: 1px solid #f5faf9;
        }
        .help-sidebar-item:last-child { border-bottom: none; }
        .help-sidebar-item:hover { background: #f5faf9; color: #2a9d8f; }
        .help-sidebar-item.active { background: #f0faf8; color: #2a9d8f; border-left-color: #2a9d8f; font-weight: 700; }

        .help-content { display: flex; flex-direction: column; gap: 2rem; }

        .help-section {
          background: #fff; border-radius: 20px; border: 1.5px solid #e0f0ed;
          overflow: hidden; box-shadow: 0 4px 20px rgba(42,157,143,0.06);
          scroll-margin-top: 100px;
        }
        .help-section-header {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.25rem 1.75rem;
          background: linear-gradient(135deg, #0f4d43, #2a9d8f);
        }
        .help-section-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
        }
        .help-section-header h2 { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #fff; }

        .help-article {
          border-bottom: 1px solid #f0f4f3; overflow: hidden;
        }
        .help-article:last-child { border-bottom: none; }
        .help-article-q {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.75rem; cursor: pointer;
          font-weight: 600; font-size: 0.92rem; color: #1a1a1a;
          transition: background 0.2s; gap: 1rem;
        }
        .help-article-q:hover { background: #f8fffe; }
        .help-article-chevron {
          font-size: 0.75rem; color: #2a9d8f; flex-shrink: 0;
          transition: transform 0.3s; display: inline-block;
        }
        .help-article-chevron.open { transform: rotate(180deg); }
        .help-article-a {
          padding: 0 1.75rem; max-height: 0; overflow: hidden;
          transition: max-height 0.35s ease, padding 0.3s;
          font-size: 0.875rem; color: #555; line-height: 1.75;
        }
        .help-article-a.open { max-height: 300px; padding: 0 1.75rem 1.25rem; }

        .help-footer-cta {
          max-width: 1100px; margin: 0 auto 4rem; padding: 0 2rem;
        }
        .help-footer-inner {
          background: linear-gradient(135deg, #0f4d43, #2a9d8f);
          border-radius: 20px; padding: 2.5rem 3rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 2rem; flex-wrap: wrap;
          box-shadow: 0 8px 32px rgba(42,157,143,0.25);
        }
        .help-footer-inner h3 { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: #fff; margin-bottom: 0.4rem; }
        .help-footer-inner p { font-size: 0.875rem; color: rgba(255,255,255,0.75); }
        .help-cta-btn {
          padding: 0.75rem 1.5rem; border-radius: 10px; background: #fff;
          color: #2a9d8f; font-weight: 700; font-size: 0.9rem;
          text-decoration: none; white-space: nowrap;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1); transition: all 0.2s;
        }
        .help-cta-btn:hover { transform: translateY(-2px); }

        @media (max-width: 768px) {
          .help-layout { grid-template-columns: 1fr; }
          .help-sidebar { position: static; }
          .help-nav { padding: 1rem 1.5rem; }
          .help-hero { padding: 7rem 1.5rem 3rem; }
        }
      `}</style>

            <nav className="help-nav">
                <Link className="help-nav-brand" to="/">
                    <span style={{fontSize:'1.6rem'}}>🌍</span>
                    <span className="help-nav-name">CCTRS</span>
                </Link>
                <Link className="help-nav-back" to="/">← Back to Home</Link>
            </nav>

            <div className="help-hero">
                <div style={{display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'100px', padding:'0.4rem 1.1rem', fontSize:'0.8rem', fontWeight:600, color:'#fff', marginBottom:'1.5rem'}}>
                    🙋 Help Centre
                </div>
                <h1>How can we help you?</h1>
                <p>Find answers to common questions about using CCTRS and tracking your eco impact.</p>
                <div className="help-contact-bar">
                    <span>Can't find what you need?</span>
                    <a href="mailto:cctrsapp@gmail.com">Email us →</a>
                </div>
            </div>

            <div className="help-layout">
                <div className="help-sidebar">
                    <div className="help-sidebar-title">Topics</div>
                    {helpTopics.map(t => (
                        <div key={t.id} className={`help-sidebar-item ${activeTopic === t.id ? 'active' : ''}`}
                             onClick={() => { setActiveTopic(t.id); document.getElementById(t.id)?.scrollIntoView({behavior:'smooth', block:'start'}); }}>
                            <span>{t.icon}</span>{t.title}
                        </div>
                    ))}
                </div>

                <div className="help-content">
                    {helpTopics.map(topic => (
                        <div key={topic.id} id={topic.id} className="help-section">
                            <div className="help-section-header">
                                <div className="help-section-icon">{topic.icon}</div>
                                <h2>{topic.title}</h2>
                            </div>
                            {topic.articles.map((article, i) => {
                                const id = `${topic.id}-${i}`;
                                const open = activeId === id;
                                return (
                                    <div key={id} className="help-article">
                                        <div className="help-article-q" onClick={() => toggle(id)}>
                                            <span>{article.q}</span>
                                            <span className={`help-article-chevron ${open ? 'open' : ''}`}>▼</span>
                                        </div>
                                        <div className={`help-article-a ${open ? 'open' : ''}`}>{article.a}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="help-footer-cta">
                <div className="help-footer-inner">
                    <div>
                        <h3>Still need help?</h3>
                        <p>Our team is happy to assist you with any questions.</p>
                    </div>
                    <a className="help-cta-btn" href="mailto:cctrsapp@gmail.com">Contact Support →</a>
                </div>
            </div>
        </div>
    );
}
