import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const commonFaqs = [
    { q: "What is CCTRS?", a: "CCTRS is a platform that rewards you for eco-friendly activities like tree planting, public transport usage, and recycling." },
    { q: "Is CCTRS free to use?", a: "Yes, CCTRS is completely free to use." },
    { q: "What activities can I log?", a: "Tree Plantation, Public Transport, and Recycling — each requires photo proof and GPS location." },
    { q: "How long does approval take?", a: "Activities are reviewed within 3–5 business days." },
    { q: "Do points expire?", a: "No, carbon points never expire once earned and approved." },
    { q: "How do I reset my password?", a: "Click Forgot Password on the login page and follow the instructions sent to your email." },
];

export default function FAQ() {
    const [openId, setOpenId] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", question: "" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const toggle = (i) => setOpenId(openId === i ? null : i);

    const handleSubmit = async () => {
        if (!form.email.trim() || !form.question.trim()) { setError("Email and question are required."); return; }
        setLoading(true); setError("");
        try { await api.post("/public/questions", form); setSubmitted(true); }
        catch (err) { setError(err?.response?.data?.message || "Failed to submit. Please try again."); }
        finally { setLoading(false); }
    };

    return (
        <div className="faq-page">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .faq-page { font-family: 'DM Sans', sans-serif; background: #f5faf9; color: #1a1a1a; min-height: 100vh; }
        .faq-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1rem 3rem; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid #e0f0ed; box-shadow: 0 2px 20px rgba(42,157,143,0.08); }
        .faq-nav-brand { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .faq-nav-name { font-size: 1.2rem; font-weight: 700; color: #2a9d8f; }
        .faq-nav-back { font-size: 0.875rem; font-weight: 600; color: #2a9d8f; text-decoration: none; padding: 0.5rem 1.1rem; border: 2px solid #2a9d8f; border-radius: 8px; transition: all 0.2s; }
        .faq-nav-back:hover { background: #2a9d8f; color: #fff; }
        .faq-hero { background: linear-gradient(135deg, #0f4d43 0%, #1a7a6e 50%, #2a9d8f 100%); padding: 9rem 3rem 5rem; text-align: center; }
        .faq-hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(2rem, 4vw, 3rem); color: #fff; margin-bottom: 0.75rem; }
        .faq-hero p { font-size: 1rem; color: rgba(255,255,255,0.8); }
        .faq-body { max-width: 780px; margin: 0 auto; padding: 3rem 2rem 5rem; }
        .faq-section-title { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: #1a1a1a; margin-bottom: 1.25rem; }
        .faq-card { background: #fff; border-radius: 14px; border: 1.5px solid #e0f0ed; overflow: hidden; margin-bottom: 0.75rem; box-shadow: 0 2px 12px rgba(42,157,143,0.05); transition: box-shadow 0.2s; }
        .faq-card:hover { box-shadow: 0 6px 24px rgba(42,157,143,0.1); }
        .faq-q { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.5rem; cursor: pointer; font-weight: 600; font-size: 0.92rem; color: #1a1a1a; gap: 1rem; transition: background 0.2s; }
        .faq-q:hover { background: #f8fffe; }
        .faq-chevron { font-size: 0.75rem; color: #2a9d8f; flex-shrink: 0; transition: transform 0.3s; }
        .faq-chevron.open { transform: rotate(180deg); }
        .faq-a { max-height: 0; overflow: hidden; transition: max-height 0.35s ease, padding 0.3s; font-size: 0.875rem; color: #555; line-height: 1.75; padding: 0 1.5rem; }
        .faq-a.open { max-height: 200px; padding: 0.75rem 1.5rem 1.25rem; border-top: 1px solid #f0f4f3; }
        .faq-divider { height: 1.5px; background: #e0f0ed; margin: 2.5rem 0; border-radius: 999px; }
        .faq-form-card { background: #fff; border-radius: 20px; border: 1.5px solid #e0f0ed; padding: 2rem; box-shadow: 0 4px 20px rgba(42,157,143,0.08); }
        .faq-form-label { font-size: 0.82rem; font-weight: 700; color: #444; margin-bottom: 0.4rem; display: block; }
        .faq-form-input, .faq-form-textarea { width: 100%; padding: 0.8rem 1rem; border: 1.5px solid #e0f0ed; border-radius: 10px; font-size: 0.9rem; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; margin-bottom: 1rem; background: #f8fffe; }
        .faq-form-input:focus, .faq-form-textarea:focus { border-color: #2a9d8f; background: #fff; }
        .faq-form-textarea { resize: vertical; min-height: 110px; }
        .faq-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .faq-submit-btn { width: 100%; padding: 0.9rem; background: linear-gradient(135deg, #0f4d43, #2a9d8f); color: #fff; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .faq-submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .faq-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .faq-success { text-align: center; padding: 2.5rem 1rem; }
        .faq-success-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        .faq-success h3 { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #1a1a1a; margin-bottom: 0.5rem; }
        .faq-success p { font-size: 0.9rem; color: #666; line-height: 1.7; margin-bottom: 1.5rem; }
        .faq-my-link { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #2a9d8f; color: #fff; border-radius: 10px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: all 0.2s; }
        .faq-my-link:hover { background: #238a7e; transform: translateY(-1px); }
        .faq-error { background: #fee2e2; color: #dc2626; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
        @media (max-width: 768px) { .faq-nav { padding: 1rem 1.5rem; } .faq-hero { padding: 7rem 1.5rem 3rem; } .faq-body { padding: 2rem 1rem 3rem; } .faq-form-row { grid-template-columns: 1fr; } }
      `}</style>

            <nav className="faq-nav">
                <Link className="faq-nav-brand" to="/"><span style={{fontSize:'1.6rem'}}>🌍</span><span className="faq-nav-name">CCTRS</span></Link>
                <Link className="faq-nav-back" to="/">← Back to Home</Link>
            </nav>

            <div className="faq-hero">
                <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'100px',padding:'0.4rem 1.1rem',fontSize:'0.8rem',fontWeight:600,color:'#fff',marginBottom:'1.5rem'}}>❓ FAQ</div>
                <h1>Frequently Asked Questions</h1>
                <p>Quick answers — or ask us your own question below.</p>
            </div>

            <div className="faq-body">
                <div className="faq-section-title">💬 Common Questions</div>
                {commonFaqs.map((item, i) => (
                    <div key={i} className="faq-card">
                        <div className="faq-q" onClick={() => toggle(i)}><span>{item.q}</span><span className={`faq-chevron ${openId === i ? 'open' : ''}`}>▼</span></div>
                        <div className={`faq-a ${openId === i ? 'open' : ''}`}>{item.a}</div>
                    </div>
                ))}

                <div className="faq-divider" />

                <div className="faq-section-title">✉️ Ask Us a Question</div>
                <div className="faq-form-card">
                    {submitted ? (
                        <div className="faq-success">
                            <div className="faq-success-icon">✅</div>
                            <h3>Question Submitted!</h3>
                            <p>We received your question and will reply to your email once answered. Track your question status below.</p>
                            <Link className="faq-my-link" to="/my-questions">View My Questions →</Link>
                        </div>
                    ) : (
                        <>
                            {error && <div className="faq-error">{error}</div>}
                            <div className="faq-form-row">
                                <div><label className="faq-form-label">Your Name (optional)</label><input className="faq-form-input" placeholder="e.g. Ahmed" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                                <div><label className="faq-form-label">Email Address *</label><input className="faq-form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                            </div>
                            <label className="faq-form-label">Your Question *</label>
                            <textarea className="faq-form-textarea" placeholder="Type your question here..." value={form.question} onChange={e => setForm({...form, question: e.target.value})} />
                            <button className="faq-submit-btn" onClick={handleSubmit} disabled={loading}>{loading ? "Submitting..." : "Submit Question →"}</button>
                            <p style={{textAlign:'center',marginTop:'1rem',fontSize:'0.82rem',color:'#888'}}>Already submitted? <Link to="/my-questions" style={{color:'#2a9d8f',fontWeight:700}}>Check your questions →</Link></p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
