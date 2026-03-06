import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answerModal, setAnswerModal] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [answerLoading, setAnswerLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [search, setSearch] = useState('');

    const fetchQuestions = async () => {
        try {
            setLoading(true); setError('');
            const res = await api.get('/admin/questions');
            setQuestions(res?.data?.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQuestions(); }, []);

    const handleAnswer = async () => {
        if (!answerText.trim()) return;
        setAnswerLoading(true);
        try {
            await api.post(`/admin/questions/${answerModal.id}/answer`, { answer: answerText });
            setQuestions(prev => prev.map(q =>
                q.id === answerModal.id ? { ...q, status: 'ANSWERED', answer: answerText } : q
            ));
            setAnswerModal(null);
            setAnswerText('');
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to send answer');
        } finally {
            setAnswerLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filtered = questions.filter(q => {
        const matchStatus = filterStatus === 'ALL' || q.status === filterStatus;
        const matchSearch = search.trim() === '' ||
            q.question.toLowerCase().includes(search.toLowerCase()) ||
            q.email.toLowerCase().includes(search.toLowerCase()) ||
            (q.name && q.name.toLowerCase().includes(search.toLowerCase()));
        return matchStatus && matchSearch;
    });

    const unanswered = questions.filter(q => q.status === 'UNANSWERED').length;
    const answered = questions.filter(q => q.status === 'ANSWERED').length;

    return (
        <div className="dashboard-page">
            <style>{`
        .qe-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; margin-bottom:1.5rem; }
        .qe-stat { background:#fff; border-radius:14px; padding:1rem 1.25rem; border:1.5px solid #e2eeec; text-align:center; }
        .qe-stat-val { font-size:2rem; font-weight:900; line-height:1; margin-bottom:4px; }
        .qe-stat-label { font-size:0.72rem; color:#888; font-weight:600; text-transform:uppercase; }
        .qe-toolbar { display:flex; gap:0.75rem; margin-bottom:1.25rem; flex-wrap:wrap; align-items:center; }
        .qe-search { flex:1; min-width:200px; padding:0.6rem 1rem; border:1.5px solid #e2eeec; border-radius:10px; font-size:0.88rem; outline:none; font-family:inherit; transition:border-color 0.2s; background:#f8fffe; }
        .qe-search:focus { border-color:#2a9d8f; background:#fff; }
        .qe-filter-btn { padding:0.5rem 1rem; border-radius:20px; border:1.5px solid #e2eeec; background:#fff; font-size:0.8rem; font-weight:600; cursor:pointer; transition:all 0.2s; color:#666; white-space:nowrap; }
        .qe-filter-btn:hover { border-color:#2a9d8f; color:#2a9d8f; }
        .qe-filter-btn.active { background:#2a9d8f; color:#fff; border-color:#2a9d8f; }
        .qe-card { background:#fff; border-radius:16px; border:1.5px solid #e2eeec; overflow:hidden; margin-bottom:1rem; box-shadow:0 2px 12px rgba(0,0,0,0.05); transition:box-shadow 0.2s; }
        .qe-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.09); }
        .qe-card-header { display:flex; align-items:center; justify-content:space-between; padding:0.9rem 1.25rem; background:#f8fffe; border-bottom:1px solid #e2eeec; flex-wrap:wrap; gap:0.5rem; }
        .qe-name { font-weight:700; font-size:0.9rem; color:#1a1a1a; }
        .qe-meta { font-size:0.78rem; color:#888; margin-top:2px; }
        .qe-badge { padding:0.25rem 0.75rem; border-radius:20px; font-size:0.72rem; font-weight:700; }
        .qe-badge.answered { background:#d1fae5; color:#059669; }
        .qe-badge.unanswered { background:#fef3c7; color:#d97706; }
        .qe-card-body { padding:1.1rem 1.25rem; }
        .qe-q-label { font-size:0.72rem; font-weight:700; color:#2a9d8f; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.35rem; }
        .qe-q-text { font-size:0.92rem; color:#1a1a1a; font-weight:600; line-height:1.55; margin-bottom:0.9rem; }
        .qe-answer-box { background:#f0faf8; border-left:3px solid #2a9d8f; border-radius:0 10px 10px 0; padding:0.85rem 1rem; }
        .qe-answer-text { font-size:0.875rem; color:#333; line-height:1.75; }
        .qe-card-footer { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1.25rem; border-top:1px solid #f0f4f3; background:#fafafa; flex-wrap:wrap; gap:0.5rem; }
        .qe-answered-at { font-size:0.75rem; color:#888; }
        .btn-answer { padding:0.5rem 1.2rem; border-radius:8px; background:#2a9d8f; color:#fff; border:none; font-weight:700; font-size:0.85rem; cursor:pointer; transition:all 0.2s; }
        .btn-answer:hover { background:#238a7e; transform:translateY(-1px); }
        .qe-empty { text-align:center; padding:3rem; background:#fff; border-radius:16px; border:1.5px solid #e2eeec; }
        .qe-empty-icon { font-size:3rem; margin-bottom:0.5rem; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:999; padding:1rem; }
        .modal-card { background:#fff; border-radius:16px; max-width:580px; width:100%; box-shadow:0 25px 50px rgba(0,0,0,0.3); overflow:hidden; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; border-bottom:1px solid #e2eeec; }
        .modal-header h3 { font-weight:800; color:#1a1a1a; }
        .modal-close { background:none; border:none; font-size:1.5rem; cursor:pointer; color:#888; line-height:1; }
        .modal-footer { display:flex; gap:0.75rem; justify-content:flex-end; padding:0.75rem 1.25rem; border-top:1px solid #e2eeec; }
        .btn-cancel { padding:0.6rem 1.2rem; border-radius:8px; background:#f0f4f3; color:#666; border:none; font-weight:700; cursor:pointer; }
      `}</style>

            {/* HEADER */}
            <div className="dashboard-header" style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem'}}>
                <div>
                    <h1 className="dashboard-title">💬 Question Engine</h1>
                    <p className="dashboard-subtitle">View and answer questions submitted by users. Answers are sent via email.</p>
                </div>
                <button onClick={fetchQuestions} disabled={loading} className="btn btn-primary">
                    {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* STATS */}
            <div className="qe-stats">
                <div className="qe-stat" style={{borderTop:'3px solid #2a9d8f'}}>
                    <div className="qe-stat-val" style={{color:'#2a9d8f'}}>{questions.length}</div>
                    <div className="qe-stat-label">💬 Total</div>
                </div>
                <div className="qe-stat" style={{borderTop:'3px solid #d97706'}}>
                    <div className="qe-stat-val" style={{color:'#d97706'}}>{unanswered}</div>
                    <div className="qe-stat-label">⏳ Unanswered</div>
                </div>
                <div className="qe-stat" style={{borderTop:'3px solid #059669'}}>
                    <div className="qe-stat-val" style={{color:'#059669'}}>{answered}</div>
                    <div className="qe-stat-label">✅ Answered</div>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="qe-toolbar">
                <input
                    className="qe-search"
                    placeholder="🔍 Search by name, email or question..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {[['ALL','All'], ['UNANSWERED','⏳ Unanswered'], ['ANSWERED','✅ Answered']].map(([val, label]) => (
                    <button
                        key={val}
                        className={`qe-filter-btn ${filterStatus === val ? 'active' : ''}`}
                        onClick={() => setFilterStatus(val)}
                    >
                        {label}
                        {val !== 'ALL' && (
                            <span style={{marginLeft:'4px', opacity:0.75}}>
                ({questions.filter(q => q.status === val).length})
              </span>
                        )}
                    </button>
                ))}
            </div>

            {/* QUESTIONS LIST */}
            {loading ? (
                <div className="page-state">Loading questions...</div>
            ) : filtered.length === 0 ? (
                <div className="qe-empty">
                    <div className="qe-empty-icon">💬</div>
                    <div style={{fontWeight:700, color:'#333', marginBottom:'0.25rem'}}>No questions found</div>
                    <div style={{fontSize:'0.82rem', color:'#aaa'}}>
                        {search ? 'Try a different search term' : 'Questions submitted by users will appear here'}
                    </div>
                </div>
            ) : (
                filtered.map(q => (
                    <div key={q.id} className="qe-card">
                        <div className="qe-card-header">
                            <div>
                                <div className="qe-name">{q.name || 'Anonymous'}</div>
                                <div className="qe-meta">✉️ {q.email} · 🕐 {formatDate(q.createdAt)}</div>
                            </div>
                            <span className={`qe-badge ${q.status === 'ANSWERED' ? 'answered' : 'unanswered'}`}>
                {q.status === 'ANSWERED' ? '✅ Answered' : '⏳ Unanswered'}
              </span>
                        </div>

                        <div className="qe-card-body">
                            <div className="qe-q-label">❓ Question</div>
                            <div className="qe-q-text">{q.question}</div>
                            {q.status === 'ANSWERED' && q.answer && (
                                <div className="qe-answer-box">
                                    <div className="qe-q-label" style={{marginBottom:'0.35rem'}}>✅ Your Answer</div>
                                    <div className="qe-answer-text">{q.answer}</div>
                                </div>
                            )}
                        </div>

                        <div className="qe-card-footer">
                            {q.status === 'ANSWERED' ? (
                                <>
                                    <span style={{fontSize:'0.78rem', color:'#059669', fontWeight:700}}>✅ Answer sent to {q.email}</span>
                                    <span className="qe-answered-at">Answered: {formatDate(q.answeredAt)}</span>
                                </>
                            ) : (
                                <>
                                    <span style={{fontSize:'0.78rem', color:'#d97706', fontWeight:600}}>⏳ Waiting for answer</span>
                                    <button className="btn-answer" onClick={() => { setAnswerModal(q); setAnswerText(''); }}>
                                        ✏️ Answer Question
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}

            {/* ANSWER MODAL */}
            {answerModal && (
                <div className="modal-overlay" onClick={() => !answerLoading && setAnswerModal(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✏️ Answer Question</h3>
                            <button className="modal-close" onClick={() => setAnswerModal(null)} disabled={answerLoading}>×</button>
                        </div>
                        <div style={{padding:'1.25rem'}}>
                            <div style={{background:'#f8fffe', borderRadius:'10px', padding:'0.9rem 1rem', marginBottom:'1.25rem', border:'1.5px solid #e2eeec'}}>
                                <div style={{fontSize:'0.72rem', fontWeight:700, color:'#2a9d8f', textTransform:'uppercase', marginBottom:'0.35rem'}}>
                                    Question from {answerModal.name || 'Anonymous'} · {answerModal.email}
                                </div>
                                <div style={{fontSize:'0.92rem', color:'#1a1a1a', fontWeight:600, lineHeight:1.5}}>{answerModal.question}</div>
                            </div>
                            <label style={{fontSize:'0.82rem', fontWeight:700, color:'#333', display:'block', marginBottom:'0.5rem'}}>
                                Your Answer *
                            </label>
                            <textarea
                                rows={5}
                                placeholder="Type your answer here... It will be emailed directly to the user."
                                value={answerText}
                                onChange={e => setAnswerText(e.target.value)}
                                style={{width:'100%', padding:'0.75rem', border:'1.5px solid #e2eeec', borderRadius:'10px', fontSize:'0.9rem', resize:'vertical', fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s'}}
                                onFocus={e => e.target.style.borderColor='#2a9d8f'}
                                onBlur={e => e.target.style.borderColor='#e2eeec'}
                            />
                            <div style={{fontSize:'0.78rem', color:'#888', marginTop:'0.5rem'}}>
                                📧 Answer will be emailed to <strong>{answerModal.email}</strong>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setAnswerModal(null)} disabled={answerLoading}>Cancel</button>
                            <button className="btn-answer" onClick={handleAnswer} disabled={answerLoading || !answerText.trim()}>
                                {answerLoading ? 'Sending...' : '📧 Send Answer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQuestions;
