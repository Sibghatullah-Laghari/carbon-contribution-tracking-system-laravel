import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function MyQuestions() {
    const [email, setEmail] = useState("");
    const [questions, setQuestions] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (!email.trim()) { setError("Please enter your email address."); return; }
        setLoading(true); setError(""); setSearched(false);
        try {
            const res = await api.get(`/public/questions?email=${encodeURIComponent(email.trim())}`);
            setQuestions(res?.data?.data || []);
            setSearched(true);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to fetch questions.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="mq-page">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .mq-page { font-family: 'DM Sans', sans-serif; background: #f5faf9; color: #1a1a1a; min-height: 100vh; }
        .mq-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1rem 3rem; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid #e0f0ed; box-shadow: 0 2px 20px rgba(42,157,143,0.08); }
        .mq-nav-brand { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .mq-nav-name { font-size: 1.2rem; font-weight: 700; color: #2a9d8f; }
        .mq-nav-back { font-size: 0.875rem; font-weight: 600; color: #2a9d8f; text-decoration: none; padding: 0.5rem 1.1rem; border: 2px solid #2a9d8f; border-radius: 8px; transition: all 0.2s; }
        .mq-nav-back:hover { background: #2a9d8f; color: #fff; }
        .mq-hero { background: linear-gradient(135deg, #0f4d43 0%, #1a7a6e 50%, #2a9d8f 100%); padding: 9rem 3rem 5rem; text-align: center; }
        .mq-hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(2rem, 4vw, 2.8rem); color: #fff; margin-bottom: 0.75rem; }
        .mq-hero p { font-size: 1rem; color: rgba(255,255,255,0.8); }
        .mq-body { max-width: 720px; margin: 0 auto; padding: 3rem 2rem 5rem; }
        .mq-search-card { background: #fff; border-radius: 20px; border: 1.5px solid #e0f0ed; padding: 2rem; box-shadow: 0 4px 20px rgba(42,157,143,0.08); margin-bottom: 2rem; }
        .mq-search-card h2 { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #1a1a1a; margin-bottom: 1rem; }
        .mq-search-row { display: flex; gap: 0.75rem; }
        .mq-input { flex: 1; padding: 0.8rem 1rem; border: 1.5px solid #e0f0ed; border-radius: 10px; font-size: 0.9rem; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; background: #f8fffe; }
        .mq-input:focus { border-color: #2a9d8f; background: #fff; }
        .mq-search-btn { padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #0f4d43, #2a9d8f); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .mq-search-btn:hover:not(:disabled) { opacity: 0.9; }
        .mq-search-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .mq-error { background: #fee2e2; color: #dc2626; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
        .mq-empty { text-align: center; padding: 3rem; background: #fff; border-radius: 20px; border: 1.5px solid #e0f0ed; }
        .mq-empty-icon { font-size: 3rem; margin-bottom: 0.75rem; }
        .mq-empty h3 { font-family: 'DM Serif Display', serif; color: #1a1a1a; margin-bottom: 0.5rem; }
        .mq-empty p { font-size: 0.875rem; color: #888; margin-bottom: 1.25rem; }
        .mq-ask-btn { display: inline-flex; padding: 0.7rem 1.4rem; background: #2a9d8f; color: #fff; border-radius: 10px; font-weight: 700; font-size: 0.875rem; text-decoration: none; transition: all 0.2s; }
        .mq-ask-btn:hover { background: #238a7e; }
        .mq-list { display: flex; flex-direction: column; gap: 1.25rem; }
        .mq-card { background: #fff; border-radius: 16px; border: 1.5px solid #e0f0ed; overflow: hidden; box-shadow: 0 2px 12px rgba(42,157,143,0.06); }
        .mq-card-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; background: #f8fffe; border-bottom: 1px solid #e0f0ed; flex-wrap: wrap; gap: 0.5rem; }
        .mq-card-date { font-size: 0.78rem; color: #999; }
        .mq-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
        .mq-badge.answered { background: #d1fae5; color: #059669; }
        .mq-badge.unanswered { background: #fef3c7; color: #d97706; }
        .mq-card-body { padding: 1.25rem 1.5rem; }
        .mq-question-label { font-size: 0.72rem; font-weight: 700; color: #2a9d8f; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; }
        .mq-question-text { font-size: 0.9rem; color: #1a1a1a; font-weight: 600; line-height: 1.5; margin-bottom: 1rem; }
        .mq-answer-box { background: #f0faf8; border-left: 3px solid #2a9d8f; border-radius: 0 10px 10px 0; padding: 0.9rem 1rem; }
        .mq-answer-label { font-size: 0.72rem; font-weight: 700; color: #2a9d8f; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; }
        .mq-answer-text { font-size: 0.875rem; color: #333; line-height: 1.7; }
        .mq-pending-box { background: #fef9ec; border-left: 3px solid #f59e0b; border-radius: 0 10px 10px 0; padding: 0.9rem 1rem; font-size: 0.875rem; color: #92400e; }
        @media (max-width: 768px) { .mq-nav { padding: 1rem 1.5rem; } .mq-hero { padding: 7rem 1.5rem 3rem; } .mq-body { padding: 2rem 1rem 3rem; } .mq-search-row { flex-direction: column; } }
      `}</style>

            <nav className="mq-nav">
                <Link className="mq-nav-brand" to="/"><span style={{fontSize:'1.6rem'}}>🌍</span><span className="mq-nav-name">CCTRS</span></Link>
                <Link className="mq-nav-back" to="/faq">← Back to FAQ</Link>
            </nav>

            <div className="mq-hero">
                <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'100px',padding:'0.4rem 1.1rem',fontSize:'0.8rem',fontWeight:600,color:'#fff',marginBottom:'1.5rem'}}>📬 My Questions</div>
                <h1>Track Your Questions</h1>
                <p>Enter your email to see the status of questions you've submitted.</p>
            </div>

            <div className="mq-body">
                <div className="mq-search-card">
                    <h2>🔍 Find Your Questions</h2>
                    {error && <div className="mq-error">{error}</div>}
                    <div className="mq-search-row">
                        <input className="mq-input" type="email" placeholder="Enter your email address..." value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        <button className="mq-search-btn" onClick={handleSearch} disabled={loading}>{loading ? "Searching..." : "Search →"}</button>
                    </div>
                </div>

                {searched && questions.length === 0 && (
                    <div className="mq-empty">
                        <div className="mq-empty-icon">📭</div>
                        <h3>No Questions Found</h3>
                        <p>We couldn't find any questions submitted with this email address.</p>
                        <Link className="mq-ask-btn" to="/faq">Ask a Question →</Link>
                    </div>
                )}

                {questions.length > 0 && (
                    <div className="mq-list">
                        <div style={{fontSize:'0.82rem', color:'#888', marginBottom:'0.25rem', fontWeight:600}}>
                            {questions.length} question{questions.length !== 1 ? 's' : ''} found
                        </div>
                        {questions.map(q => (
                            <div key={q.id} className="mq-card">
                                <div className="mq-card-header">
                                    <span className="mq-card-date">Submitted: {formatDate(q.createdAt)}</span>
                                    <span className={`mq-badge ${q.status === 'ANSWERED' ? 'answered' : 'unanswered'}`}>
                    {q.status === 'ANSWERED' ? '✅ Answered' : '⏳ Pending'}
                  </span>
                                </div>
                                <div className="mq-card-body">
                                    <div className="mq-question-label">❓ Your Question</div>
                                    <div className="mq-question-text">{q.question}</div>
                                    {q.status === 'ANSWERED' ? (
                                        <div className="mq-answer-box">
                                            <div className="mq-answer-label">✅ Answer from CCTRS</div>
                                            <div className="mq-answer-text">{q.answer}</div>
                                        </div>
                                    ) : (
                                        <div className="mq-pending-box">
                                            ⏳ Your question is being reviewed. We'll send the answer to <strong>{q.email}</strong>.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
