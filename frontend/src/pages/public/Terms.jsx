import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const sections = [
    {
        id: "responsibilities",
        icon: "👤",
        title: "User Responsibilities",
        content: [
            {
                subtitle: "Accurate Reporting",
                text: "Users must submit truthful and accurate records of their eco-friendly activities. Falsifying activity data, manipulating GPS coordinates, or submitting fraudulent proof photos is strictly prohibited and may result in immediate account suspension."
            },
            {
                subtitle: "Proof Submission",
                text: "When submitting activities, users are required to provide genuine photographic evidence taken at the time of the activity. Photos must clearly show the activity performed and must not be edited, filtered, or taken from other sources."
            },
            {
                subtitle: "Account Security",
                text: "You are responsible for maintaining the confidentiality of your account credentials. Any activity conducted under your account is your responsibility. Report any unauthorized access immediately to cctrsapp@gmail.com."
            },
            {
                subtitle: "Community Standards",
                text: "Users must treat all community members with respect. Harassment, spam, or any form of abusive behavior towards other users or administrators will not be tolerated and may result in permanent account termination."
            }
        ]
    },
    {
        id: "privacy",
        icon: "🔒",
        title: "Data & Privacy Policy",
        content: [
            {
                subtitle: "Data We Collect",
                text: "CCTRS collects personal information including your name, email address, username, and activity data such as GPS coordinates, photographs, and carbon point records. This data is necessary to operate the platform and verify your environmental contributions."
            },
            {
                subtitle: "How We Use Your Data",
                text: "Your data is used solely to operate CCTRS services — verifying activities, calculating carbon points, displaying leaderboards, and sending important account notifications. We do not sell, trade, or rent your personal information to third parties."
            },
            {
                subtitle: "Data Storage & Security",
                text: "All data is stored securely on cloud infrastructure with industry-standard encryption. We implement technical and organizational measures to protect your personal data against unauthorized access, alteration, or deletion."
            },
            {
                subtitle: "Your Rights",
                text: "You have the right to access, correct, or request deletion of your personal data at any time. To exercise these rights, contact us at cctrsapp@gmail.com. We will respond to all data requests within 30 days."
            },
            {
                subtitle: "Cookies & Analytics",
                text: "CCTRS uses essential cookies to maintain your session and preferences. We do not use advertising cookies or share browsing data with third-party advertisers. Basic analytics may be used to improve platform performance."
            },
            {
                subtitle: "Photo & Image Data",
                text: "When you submit activity proof, photographs are uploaded and stored directly in our database in encoded format. These images are retained for administrative review and audit purposes. Proof photos are visible to CCTRS administrators only and are not publicly displayed to other users. By submitting photos, you confirm you have the right to share them and consent to their storage on our platform."
            },
            {
                subtitle: "Location & GPS Data",
                text: "CCTRS collects GPS coordinates at the time of activity submission to verify the authenticity and location of your eco-friendly actions. Your precise location data is stored alongside your activity record and is accessible only to administrators for verification purposes. Location data is never shared publicly or sold to third parties. You may disable location access in your device settings, but this may prevent successful activity verification."
            },
            {
                subtitle: "Public Display of User Information",
                text: "By creating a CCTRS account, you acknowledge and consent that your display name and email address may be visible to other registered users on the public leaderboard for the purpose of ranking and community recognition. Your carbon points and badge level are also displayed publicly. If you do not wish your information to appear on the leaderboard, please contact us at cctrsapp@gmail.com to request removal."
            }
        ]
    },
    {
        id: "verification",
        icon: "✅",
        title: "Activity Verification Rules",
        content: [
            {
                subtitle: "Tree Plantation",
                text: "Tree planting activities require photographic proof showing the planted tree(s) with visible soil disturbance or planting tools. GPS location must correspond to a valid outdoor location. Each tree must be a distinct, living sapling — decorative or indoor plants do not qualify."
            },
            {
                subtitle: "Public Transport",
                text: "Public transport usage must be verified with GPS tracking showing movement consistent with bus, train, or metro routes. The journey must have a minimum distance of 2 km. Private hire vehicles (e.g. taxis, ride-sharing) do not qualify as public transport."
            },
            {
                subtitle: "Recycling",
                text: "Recycling submissions require three photographs: the waste items before sorting, the sorted waste by category, and the waste placed in designated recycling bins or facilities. The weight declared must be reasonable and consistent with the photographic evidence."
            },
            {
                subtitle: "Review Process",
                text: "All submitted activities are reviewed by CCTRS administrators within 3–5 business days. Administrators may approve, reject, or request additional evidence. Decisions made by administrators are final. Repeated rejection of fraudulent submissions may trigger account review."
            },
            {
                subtitle: "Points Calculation",
                text: "Carbon points are awarded based on the type and quantity of the verified activity. Points are credited to your account only after administrative approval. CCTRS reserves the right to adjust point values at any time with prior notice to users."
            }
        ]
    },
    {
        id: "termination",
        icon: "⚠️",
        title: "Account Termination Policy",
        content: [
            {
                subtitle: "Grounds for Termination",
                text: "CCTRS reserves the right to suspend or permanently terminate accounts that violate these terms. Grounds include fraudulent activity submissions, repeated submission of false evidence, harassment of other users or staff, creation of multiple accounts to gain unfair advantages, or any attempt to manipulate the platform."
            },
            {
                subtitle: "Suspension Process",
                text: "In most cases, users will receive a warning before suspension. However, severe violations — including deliberate fraud or abusive behaviour — may result in immediate termination without prior notice. Suspended users will be notified via email."
            },
            {
                subtitle: "Appeals",
                text: "If you believe your account was suspended in error, you may submit an appeal to cctrsapp@gmail.com within 14 days of suspension. Include your username, the reason you believe the suspension was incorrect, and any supporting evidence. Appeals are reviewed within 7 business days."
            },
            {
                subtitle: "Effect of Termination",
                text: "Upon termination, your access to CCTRS will be revoked immediately. Your activity history and carbon points will be removed from public leaderboards. Data may be retained for up to 90 days for audit purposes before permanent deletion."
            },
            {
                subtitle: "Voluntary Deletion",
                text: "You may request deletion of your account at any time by contacting cctrsapp@gmail.com. Account deletion is irreversible. All associated data including points, badges, and activity history will be permanently removed within 30 days of the request."
            }
        ]
    },
    {
        id: "intellectual-property",
        icon: "💡",
        title: "Intellectual Property",
        content: [
            {
                subtitle: "Platform Ownership",
                text: "The CCTRS platform, including its design, logo, source code, features, and content produced by CCTRS, is the exclusive intellectual property of CCTRS and its developers. You may not copy, reproduce, distribute, or create derivative works from any part of the platform without prior written permission."
            },
            {
                subtitle: "User-Owned Content",
                text: "Photographs and activity descriptions submitted by users remain the intellectual property of the user who submitted them. By uploading content to CCTRS, you grant CCTRS a limited, non-exclusive licence to store, display to administrators, and use your content solely for the purpose of operating and improving the platform."
            },
            {
                subtitle: "Prohibited Use",
                text: "You may not use the CCTRS name, logo, or branding in any external communications, social media, or publications without explicit written consent from the CCTRS team. Misrepresentation of affiliation with CCTRS is strictly prohibited."
            },
            {
                subtitle: "Feedback & Suggestions",
                text: "Any feedback, suggestions, or ideas you submit to CCTRS regarding the platform may be used by CCTRS without any obligation to compensate you. By submitting feedback, you waive any intellectual property claims related to those suggestions."
            }
        ]
    },
    {
        id: "disclaimer",
        icon: "⚖️",
        title: "Disclaimer of Warranties",
        content: [
            {
                subtitle: "Platform Provided As-Is",
                text: "CCTRS is provided on an as-is and as-available basis without warranties of any kind, either express or implied. We do not guarantee that the platform will be uninterrupted, error-free, or free of viruses or other harmful components."
            },
            {
                subtitle: "No Guarantee of Uptime",
                text: "While we strive to maintain high availability, CCTRS does not guarantee 100% uptime. The platform may be temporarily unavailable due to scheduled maintenance, technical issues, or circumstances beyond our control. We will endeavour to notify users of planned downtime in advance."
            },
            {
                subtitle: "Points & Rewards",
                text: "CCTRS carbon points and badges are symbolic recognition of eco-friendly behaviour and hold no monetary value. CCTRS makes no warranties regarding the continuity of the points system and reserves the right to modify, reset, or discontinue reward features at any time."
            },
            {
                subtitle: "Limitation of Liability",
                text: "To the maximum extent permitted by applicable law, CCTRS and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including loss of data, points, or account access."
            }
        ]
    },
    {
        id: "changes",
        icon: "🔄",
        title: "Changes to Terms",
        content: [
            {
                subtitle: "Right to Modify",
                text: "CCTRS reserves the right to update, modify, or replace these Terms & Conditions at any time. Changes may be made to reflect updates to platform features, legal requirements, or operational changes. The most current version of the terms will always be available at /terms."
            },
            {
                subtitle: "Notice of Changes",
                text: "When significant changes are made to these terms, CCTRS will notify registered users via email to the address associated with their account. The notification will include a summary of the key changes and the date they take effect."
            },
            {
                subtitle: "Continued Use",
                text: "Your continued use of the CCTRS platform after changes to the terms have been posted and notified constitutes your acceptance of the updated terms. If you do not agree to the revised terms, you must discontinue use of the platform and may request account deletion."
            },
            {
                subtitle: "Version History",
                text: "CCTRS maintains a record of previous versions of these terms. If you require a copy of a previous version for reference, please contact us at cctrsapp@gmail.com."
            }
        ]
    },
    {
        id: "governing-law",
        icon: "🏛️",
        title: "Governing Law",
        content: [
            {
                subtitle: "Applicable Law",
                text: "These Terms & Conditions are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, without regard to its conflict of law provisions. By using CCTRS, you agree to submit to the jurisdiction of Pakistani courts for any disputes arising from these terms or your use of the platform."
            },
            {
                subtitle: "Dispute Resolution",
                text: "In the event of any dispute or claim arising out of or relating to these terms or the CCTRS platform, the parties agree to first attempt to resolve the matter amicably through direct communication. Please contact us at cctrsapp@gmail.com before initiating any formal proceedings."
            },
            {
                subtitle: "Jurisdiction",
                text: "Any legal proceedings related to CCTRS shall be brought exclusively in the courts of Pakistan. If any provision of these terms is found to be unenforceable under Pakistani law, the remaining provisions shall continue in full force and effect."
            },
            {
                subtitle: "Compliance with Local Laws",
                text: "Users are responsible for ensuring their use of CCTRS complies with all applicable local, provincial, and national laws of Pakistan. CCTRS is designed to promote environmental responsibility and operates in alignment with Pakistan's environmental protection regulations and digital data guidelines."
            }
        ]
    }
];

export default function Terms() {
    const [activeSection, setActiveSection] = useState("responsibilities");
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
        <div className="terms-page">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .terms-page {
          font-family: 'DM Sans', sans-serif;
          background: #f5faf9;
          color: #1a1a1a;
          min-height: 100vh;
        }

        /* NAV */
        .terms-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 3rem;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e0f0ed;
          box-shadow: 0 2px 20px rgba(42,157,143,0.08);
          transition: all 0.3s;
        }
        .terms-nav.scrolled { padding: 0.75rem 3rem; }
        .terms-nav-brand { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .terms-nav-logo { font-size: 1.6rem; }
        .terms-nav-name { font-size: 1.2rem; font-weight: 700; color: #2a9d8f; }
        .terms-nav-back {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.875rem; font-weight: 600; color: #2a9d8f;
          text-decoration: none; padding: 0.5rem 1.1rem;
          border: 2px solid #2a9d8f; border-radius: 8px;
          transition: all 0.2s;
        }
        .terms-nav-back:hover { background: #2a9d8f; color: #fff; }

        /* HERO */
        .terms-hero {
          background: linear-gradient(135deg, #0f4d43 0%, #1a7a6e 50%, #2a9d8f 100%);
          padding: 9rem 3rem 5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .terms-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .terms-hero-inner { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }
        .terms-hero-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
          border-radius: 100px; padding: 0.4rem 1.1rem;
          font-size: 0.8rem; font-weight: 600; color: #fff;
          margin-bottom: 1.5rem;
        }
        .terms-hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          color: #fff; line-height: 1.2;
          margin-bottom: 1rem;
        }
        .terms-hero p {
          font-size: 1rem; color: rgba(255,255,255,0.8);
          line-height: 1.7; max-width: 520px; margin: 0 auto 2rem;
        }
        .terms-hero-meta {
          display: inline-flex; gap: 2rem;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px; padding: 0.9rem 2rem;
        }
        .terms-meta-item { text-align: center; }
        .terms-meta-label { font-size: 0.72rem; color: rgba(255,255,255,0.65); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .terms-meta-value { font-size: 0.9rem; color: #fff; font-weight: 700; margin-top: 2px; }

        /* LAYOUT */
        .terms-layout {
          max-width: 1100px; margin: 0 auto;
          padding: 3rem 2rem 5rem;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 3rem;
          align-items: start;
        }

        /* SIDEBAR */
        .terms-sidebar {
          position: sticky; top: 90px;
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #e0f0ed;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(42,157,143,0.07);
        }
        .terms-sidebar-title {
          padding: 1rem 1.25rem;
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #2a9d8f;
          background: #f0faf8;
          border-bottom: 1px solid #e0f0ed;
        }
        .terms-sidebar-item {
          display: flex; align-items: center; gap: 0.65rem;
          padding: 0.85rem 1.25rem;
          font-size: 0.875rem; font-weight: 500; color: #555;
          cursor: pointer; transition: all 0.2s;
          border-left: 3px solid transparent;
          border-bottom: 1px solid #f5faf9;
        }
        .terms-sidebar-item:last-child { border-bottom: none; }
        .terms-sidebar-item:hover { background: #f5faf9; color: #2a9d8f; }
        .terms-sidebar-item.active {
          background: #f0faf8; color: #2a9d8f;
          border-left-color: #2a9d8f; font-weight: 700;
        }
        .terms-sidebar-icon { font-size: 1rem; flex-shrink: 0; }

        /* CONTENT */
        .terms-content { display: flex; flex-direction: column; gap: 2rem; }

        .terms-section {
          background: #fff;
          border-radius: 20px;
          border: 1.5px solid #e0f0ed;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(42,157,143,0.06);
          scroll-margin-top: 100px;
          transition: box-shadow 0.3s;
        }
        .terms-section:hover { box-shadow: 0 8px 32px rgba(42,157,143,0.12); }

        .terms-section-header {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #0f4d43, #2a9d8f);
          color: #fff;
        }
        .terms-section-header-icon {
          width: 46px; height: 46px; border-radius: 12px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; flex-shrink: 0;
        }
        .terms-section-header h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem; color: #fff;
        }
        .terms-section-header-num {
          margin-left: auto;
          font-size: 0.72rem; font-weight: 700;
          background: rgba(255,255,255,0.2);
          padding: 0.25rem 0.75rem; border-radius: 100px;
          color: rgba(255,255,255,0.9);
        }

        .terms-section-body { padding: 1.75rem 2rem; display: flex; flex-direction: column; gap: 1.5rem; }

        .terms-clause {
          padding-left: 1rem;
          border-left: 3px solid #e0f0ed;
          transition: border-color 0.2s;
        }
        .terms-clause:hover { border-left-color: #2a9d8f; }
        .terms-clause-title {
          font-size: 0.9rem; font-weight: 700; color: #1a6b5e;
          margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;
        }
        .terms-clause-title::before {
          content: ''; width: 6px; height: 6px;
          background: #2a9d8f; border-radius: 50%; flex-shrink: 0;
        }
        .terms-clause p {
          font-size: 0.9rem; color: #555; line-height: 1.75;
        }

        /* FOOTER BANNER */
        .terms-footer-banner {
          max-width: 1100px; margin: 0 auto 4rem;
          padding: 0 2rem;
        }
        .terms-footer-inner {
          background: linear-gradient(135deg, #0f4d43, #2a9d8f);
          border-radius: 20px;
          padding: 2.5rem 3rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 2rem; flex-wrap: wrap;
          box-shadow: 0 8px 32px rgba(42,157,143,0.25);
        }
        .terms-footer-text h3 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.4rem; color: #fff; margin-bottom: 0.4rem;
        }
        .terms-footer-text p { font-size: 0.875rem; color: rgba(255,255,255,0.75); }
        .terms-footer-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .terms-btn-white {
          padding: 0.75rem 1.5rem; border-radius: 10px;
          background: #fff; color: #2a9d8f;
          font-weight: 700; font-size: 0.9rem;
          text-decoration: none; border: none; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .terms-btn-white:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .terms-btn-outline {
          padding: 0.75rem 1.5rem; border-radius: 10px;
          background: transparent; color: #fff;
          font-weight: 600; font-size: 0.9rem;
          text-decoration: none;
          border: 2px solid rgba(255,255,255,0.5);
          transition: all 0.2s;
        }
        .terms-btn-outline:hover { border-color: #fff; background: rgba(255,255,255,0.1); }

        @media (max-width: 768px) {
          .terms-layout { grid-template-columns: 1fr; }
          .terms-sidebar { position: static; }
          .terms-nav { padding: 1rem 1.5rem; }
          .terms-hero { padding: 7rem 1.5rem 3rem; }
          .terms-hero-meta { flex-direction: column; gap: 1rem; }
          .terms-footer-inner { flex-direction: column; }
        }
      `}</style>

            {/* NAV */}
            <nav className={`terms-nav ${scrolled ? "scrolled" : ""}`}>
                <Link className="terms-nav-brand" to="/">
                    <span className="terms-nav-logo">🌍</span>
                    <span className="terms-nav-name">CCTRS</span>
                </Link>
                <Link className="terms-nav-back" to="/">← Back to Home</Link>
            </nav>

            {/* HERO */}
            <div className="terms-hero">
                <div className="terms-hero-inner">
                    <div className="terms-hero-badge">📋 Legal</div>
                    <h1>Terms & Conditions</h1>
                    <p>Please read these terms carefully before using the CCTRS platform. By creating an account, you agree to be bound by these terms.</p>
                    <div className="terms-hero-meta">
                        <div className="terms-meta-item">
                            <div className="terms-meta-label">Last Updated</div>
                            <div className="terms-meta-value">March 2026</div>
                        </div>
                        <div className="terms-meta-item">
                            <div className="terms-meta-label">Effective</div>
                            <div className="terms-meta-value">Immediately</div>
                        </div>
                        <div className="terms-meta-item">
                            <div className="terms-meta-label">Version</div>
                            <div className="terms-meta-value">1.0</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LAYOUT */}
            <div className="terms-layout">

                {/* SIDEBAR */}
                <div className="terms-sidebar">
                    <div className="terms-sidebar-title">Contents</div>
                    {sections.map(s => (
                        <div
                            key={s.id}
                            className={`terms-sidebar-item ${activeSection === s.id ? "active" : ""}`}
                            onClick={() => scrollTo(s.id)}
                        >
                            <span className="terms-sidebar-icon">{s.icon}</span>
                            {s.title}
                        </div>
                    ))}
                </div>

                {/* SECTIONS */}
                <div className="terms-content">
                    {sections.map((section, sIdx) => (
                        <div key={section.id} id={section.id} className="terms-section">
                            <div className="terms-section-header">
                                <div className="terms-section-header-icon">{section.icon}</div>
                                <h2>{section.title}</h2>
                                <span className="terms-section-header-num">Section {sIdx + 1}</span>
                            </div>
                            <div className="terms-section-body">
                                {section.content.map((clause, cIdx) => (
                                    <div key={cIdx} className="terms-clause">
                                        <div className="terms-clause-title">{clause.subtitle}</div>
                                        <p>{clause.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FOOTER BANNER */}
            <div className="terms-footer-banner">
                <div className="terms-footer-inner">
                    <div className="terms-footer-text">
                        <h3>Questions about our terms?</h3>
                        <p>Contact us at cctrsapp@gmail.com — we're happy to help.</p>
                    </div>
                    <div className="terms-footer-actions">
                        <Link className="terms-btn-white" to="/signup">Accept & Sign Up</Link>
                        <a className="terms-btn-outline" href="mailto:cctrsapp@gmail.com">Contact Us</a>
                    </div>
                </div>
            </div>

        </div>
    );
}
