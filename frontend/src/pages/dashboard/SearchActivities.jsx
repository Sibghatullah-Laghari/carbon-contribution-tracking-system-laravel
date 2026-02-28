import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axios';

// ────────────────────────────────────────────────────────────────────────────
// Constants (mirrors Admin.jsx so card rendering is identical)
// ────────────────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  PENDING:          { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  DECLARED:         { bg: '#e0e7ff', color: '#4f46e5', label: 'Declared' },
  PROOF_SUBMITTED:  { bg: '#fef3c7', color: '#d97706', label: 'Ready for Review' },
  GPS_VALID:        { bg: '#dbeafe', color: '#2563eb', label: 'GPS Valid' },
  JOURNEY_STARTED:  { bg: '#ede9fe', color: '#7c3aed', label: 'Journey Started' },
  APPROVED:         { bg: '#d1fae5', color: '#059669', label: 'Approved' },
  REJECTED:         { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  FLAGGED:          { bg: '#ffedd5', color: '#ea580c', label: 'Flagged' },
};

const CATEGORIES = [
  { key: 'ALL',            label: 'All Categories',   icon: '📋' },
  { key: 'TREE_PLANTATION',label: 'Tree Plantation',  icon: '🌳' },
  { key: 'PUBLIC_TRANSPORT',label:'Public Transport', icon: '🚌' },
  { key: 'RECYCLING',      label: 'Recycling',        icon: '♻️' },
];

const CAT_UNITS = {
  TREE_PLANTATION:  'trees',
  PUBLIC_TRANSPORT: 'km',
  RECYCLING:        'kg',
};

const STATUS_OPTIONS = [
  { value: 'ALL',            label: 'All Statuses' },
  { value: 'DECLARED',       label: 'Declared' },
  { value: 'PROOF_SUBMITTED',label: 'Ready for Review' },
  { value: 'APPROVED',       label: 'Approved' },
  { value: 'REJECTED',       label: 'Rejected' },
  { value: 'FLAGGED',        label: 'Flagged' },
];

const PAGE_SIZE = 25;

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getProofImageSrc = (proofImage) => {
  if (!proofImage) return null;
  if (proofImage.startsWith('data:') || proofImage.startsWith('http')) return proofImage;
  return `data:image/jpeg;base64,${proofImage}`;
};

const getMapLink = (lat, lon) => {
  if (lat == null || lon == null) return null;
  return `https://www.google.com/maps?q=${lat},${lon}`;
};

const getCatInfo = (activityType) => {
  const type = (activityType || '').toUpperCase().replace(/ /g, '_');
  return CATEGORIES.slice(1).find(c => type.includes(c.key)) || null;
};

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────
const SearchActivities = () => {
  // Search fields
  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus]     = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  // Archive / deleted visibility (admin-only controls)
  const [includeArchived, setIncludeArchived] = useState(false);
  const [includeDeleted, setIncludeDeleted]   = useState(false);

  // Results & UI state
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(false);
  const [page, setPage]           = useState(1);
  const [preview, setPreview]     = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce timer
  const debounceRef = useRef(null);

  // ── Perform search ──────────────────────────────────────────────────────
  const performSearch = useCallback(async (q, cat, st, from, to, incArchived, incDeleted) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (q && q.trim())      params.query    = q.trim();
      if (cat && cat !== 'ALL') params.category = cat;
      if (st  && st  !== 'ALL') params.status   = st;
      if (from) params.dateFrom = from;
      if (to)   params.dateTo   = to;
      if (incArchived) params.includeArchived = true;
      if (incDeleted)  params.includeDeleted  = true;

      const res = await api.get('/admin/activities/search', { params });
      const data = res?.data?.data || res?.data || [];
      const arr = Array.isArray(data) ? data : [];
      setResults(arr);
      setTotalCount(arr.length);
      setSearched(true);
      setPage(1);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced auto-search when any filter changes ──────────────────────
  useEffect(() => {
    // Only auto-search if at least one filter is non-default
    const hasFilter = query.trim() || category !== 'ALL' || status !== 'ALL' || dateFrom || dateTo || includeArchived || includeDeleted;
    if (!hasFilter) {
      // Reset to blank state if user clears everything
      if (searched) { setResults([]); setSearched(false); setTotalCount(0); }
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query, category, status, dateFrom, dateTo, includeArchived, includeDeleted);
    }, 320);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, status, dateFrom, dateTo, includeArchived, includeDeleted]);

  // ── Manual search button ───────────────────────────────────────────────
  const handleSearchClick = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    performSearch(query, category, status, dateFrom, dateTo, includeArchived, includeDeleted);
  };

  // ── Clear all filters ──────────────────────────────────────────────────
  const handleClear = () => {
    setQuery(''); setCategory('ALL'); setStatus('ALL');
    setDateFrom(''); setDateTo('');
    setIncludeArchived(false); setIncludeDeleted(false);
    setResults([]); setSearched(false); setError(''); setTotalCount(0);
  };

  // ── Pagination ─────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilter = query || category !== 'ALL' || status !== 'ALL' || dateFrom || dateTo || includeArchived || includeDeleted;

  // ── Relevance score helper (YouTube-style ranking already done server-side;
  //    this adds a client-side boost when ID matches exactly) ─────────────
  const isExactIdMatch = (activity) => {
    if (!query.trim()) return false;
    return String(activity.id) === query.trim();
  };

  // Sort: exact ID match first, then server order (already by created_at DESC)
  const sortedPageResults = [...pageResults].sort((a, b) => {
    if (isExactIdMatch(a) && !isExactIdMatch(b)) return -1;
    if (!isExactIdMatch(a) && isExactIdMatch(b)) return 1;
    return 0;
  });

  return (
    <div className="dashboard-page">
      <style>{`
        /* ── Search bar ──────────────────────────────────────────── */
        .sa-hero {
          background: linear-gradient(135deg, #1a6b5d 0%, #2a9d8f 100%);
          border-radius: 20px; padding: 2rem 2rem 1.75rem;
          margin-bottom: 1.75rem; color: #fff;
          box-shadow: 0 8px 32px rgba(42,157,143,0.25);
        }
        .sa-hero-title {
          font-size: 1.6rem; font-weight: 900; margin-bottom: 0.25rem;
          letter-spacing: -0.5px;
        }
        .sa-hero-sub {
          opacity: 0.85; font-size: 0.9rem; margin-bottom: 1.25rem;
        }
        .sa-search-row {
          display: flex; gap: 0.75rem; align-items: center;
        }
        .sa-search-input {
          flex: 1; padding: 0.85rem 1.25rem;
          border-radius: 12px; border: 2px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.15); color: #fff;
          font-size: 1rem; font-weight: 600; outline: none;
          backdrop-filter: blur(8px); transition: border-color 0.2s;
          font-family: inherit;
        }
        .sa-search-input::placeholder { color: rgba(255,255,255,0.6); }
        .sa-search-input:focus { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.2); }
        .sa-search-btn {
          padding: 0.85rem 1.75rem; border-radius: 12px;
          background: #fff; color: #2a9d8f;
          border: none; font-weight: 800; font-size: 0.95rem;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .sa-search-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
        .sa-search-btn:active { transform: translateY(0); }
        .sa-clear-btn {
          padding: 0.85rem 1.25rem; border-radius: 12px;
          background: rgba(255,255,255,0.2); color: #fff;
          border: 1.5px solid rgba(255,255,255,0.3); font-weight: 700;
          font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
        }
        .sa-clear-btn:hover { background: rgba(255,255,255,0.3); }

        /* ── Filters bar ─────────────────────────────────────────── */
        .sa-filters {
          background: #fff; border-radius: 16px;
          border: 1.5px solid #e2eeec;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sa-filters-title {
          font-size: 0.72rem; font-weight: 700; color: #aaa;
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }
        .sa-filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .sa-filter-group label {
          display: block; font-size: 0.75rem; font-weight: 700;
          color: #666; text-transform: uppercase; letter-spacing: 0.04em;
          margin-bottom: 0.4rem;
        }
        .sa-filter-select, .sa-filter-date {
          width: 100%; padding: 0.6rem 0.85rem;
          border: 1.5px solid #e2eeec; border-radius: 10px;
          font-size: 0.88rem; font-weight: 600; color: #1a1a1a;
          background: #f8fffe; outline: none;
          font-family: inherit; transition: border-color 0.2s;
          cursor: pointer;
        }
        .sa-filter-select:focus, .sa-filter-date:focus { border-color: #2a9d8f; }
        .sa-filter-select option { font-weight: 600; }

        /* ── Results header ──────────────────────────────────────── */
        .sa-results-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;
        }
        .sa-results-count {
          font-size: 0.88rem; font-weight: 700; color: #444;
        }
        .sa-results-count span { color: #2a9d8f; }
        .sa-page-info {
          font-size: 0.82rem; color: #888; font-weight: 600;
        }

        /* ── Activity card (reuses Admin.jsx styles, extra highlights) */
        .activity-cards { display: flex; flex-direction: column; gap: 1rem; }

        .activity-review-card {
          background: #fff; border-radius: 16px;
          border: 1.5px solid #e2eeec;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          overflow: hidden; transition: box-shadow 0.2s;
        }
        .activity-review-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.10); }
        .activity-review-card.exact-match {
          border-color: #2a9d8f;
          box-shadow: 0 0 0 3px rgba(42,157,143,0.15), 0 4px 20px rgba(0,0,0,0.08);
        }

        .arc-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem; background: #f8fffe;
          border-bottom: 1px solid #e2eeec; flex-wrap: wrap; gap: 0.5rem;
        }
        .arc-header-left { display: flex; align-items: center; gap: 0.75rem; }
        .arc-id { font-size: 0.78rem; color: #555; font-weight: 700;
          font-family: monospace; background: #f0f4f3;
          padding: 0.2rem 0.55rem; border-radius: 6px; border: 1px solid #e2eeec; }
        .arc-type { font-weight: 800; color: #1a1a1a; font-size: 0.95rem; }
        .arc-user-block { margin-top: 2px; }
        .arc-user-name { font-size: 0.82rem; color: #444; font-weight: 600; }
        .arc-user-handle { font-size: 0.78rem; color: #999; margin-left: 0.3rem; }
        .arc-user-email { font-size: 0.78rem; color: #888; margin-top: 1px; }
        .arc-status {
          display: inline-flex; align-items: center;
          padding: 0.3rem 0.75rem; border-radius: 20px;
          font-size: 0.75rem; font-weight: 700;
        }
        .arc-body {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
        }
        @media (max-width: 768px) { .arc-body { grid-template-columns: 1fr; } }
        .arc-info { padding: 1rem 1.25rem; }
        .arc-info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .arc-info-label { font-size: 0.72rem; color: #aaa; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
        .arc-info-value { font-size: 0.9rem; font-weight: 700; color: #1a1a1a; }
        .arc-photos { padding: 1rem 1.25rem; border-left: 1px solid #e2eeec; }
        .arc-photos-title { font-size: 0.72rem; color: #aaa; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .arc-photo-thumb {
          width: 80px; height: 80px; border-radius: 8px; object-fit: cover;
          cursor: pointer; border: 2px solid #e2eeec; transition: border-color 0.2s;
        }
        .arc-photo-thumb:hover { border-color: #2a9d8f; }
        .arc-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1.25rem; border-top: 1px solid #e2eeec;
          background: #fafafa; flex-wrap: wrap; gap: 0.5rem;
        }
        .arc-footer-left { font-size: 0.8rem; color: #888; }
        .rejection-badge {
          background: #fee2e2; color: #dc2626;
          font-size: 0.78rem; padding: 0.3rem 0.75rem;
          border-radius: 8px; font-weight: 600; margin-top: 0.5rem;
        }

        /* ── Modal ───────────────────────────────────────────────── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 1rem;
        }
        .modal-card {
          background: #fff; border-radius: 16px;
          max-width: 600px; width: 100%;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3); overflow: hidden;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 1.25rem; border-bottom: 1px solid #e2eeec;
        }
        .modal-header h3 { font-weight: 800; color: #1a1a1a; }
        .modal-close {
          background: none; border: none; font-size: 1.5rem;
          cursor: pointer; color: #888; line-height: 1;
        }
        .modal-body img { width: 100%; display: block; max-height: 500px; object-fit: contain; }
        .modal-link { padding: 0.75rem 1.25rem; text-align: center; }
        .modal-link a { color: #2a9d8f; font-weight: 700; }

        /* ── Pagination ──────────────────────────────────────────── */
        .sa-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; margin-top: 1.5rem; flex-wrap: wrap;
        }
        .sa-page-btn {
          padding: 0.5rem 1rem; border-radius: 8px;
          border: 1.5px solid #e2eeec; background: #fff;
          font-size: 0.85rem; font-weight: 700; cursor: pointer;
          color: #444; transition: all 0.2s;
        }
        .sa-page-btn:hover:not(:disabled) { border-color: #2a9d8f; color: #2a9d8f; }
        .sa-page-btn.active { background: #2a9d8f; color: #fff; border-color: #2a9d8f; }
        .sa-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Empty / loading states ──────────────────────────────── */
        .sa-state-card {
          background: #fff; border-radius: 16px; border: 1.5px solid #e2eeec;
          padding: 3rem 2rem; text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sa-state-icon { font-size: 3.5rem; margin-bottom: 0.75rem; }
        .sa-state-title { font-size: 1.1rem; font-weight: 800; color: #1a1a1a; margin-bottom: 0.4rem; }
        .sa-state-sub { font-size: 0.88rem; color: #888; }

        /* ── Match highlight tag ─────────────────────────────────── */
        .sa-exact-tag {
          display: inline-block; background: #d1fae5; color: #059669;
          font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.5rem;
          border-radius: 20px; margin-left: 0.5rem; vertical-align: middle;
        }
      `}</style>

      {/* ─── HERO SEARCH BAR ─────────────────────────────────────────────── */}
      <div className="sa-hero">
        <div className="sa-hero-title">🔍 Search Activities</div>
        <div className="sa-hero-sub">
          Find any activity across thousands of records — by ID, user, category, status, or date.
        </div>
        <div className="sa-search-row">
          <input
            className="sa-search-input"
            type="text"
            placeholder="Search by Activity ID, user name, or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchClick()}
            autoFocus
          />
          <button className="sa-search-btn" onClick={handleSearchClick} disabled={loading}>
            {loading ? '⏳' : '🔍 Search'}
          </button>
          {hasActiveFilter && (
            <button className="sa-clear-btn" onClick={handleClear} title="Clear all filters">
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ─── FILTERS ─────────────────────────────────────────────────────── */}
      <div className="sa-filters">
        <div className="sa-filters-title">🎛️ Refine Results</div>
        <div className="sa-filters-grid">
          {/* Category */}
          <div className="sa-filter-group">
            <label>Category</label>
            <select
              className="sa-filter-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="sa-filter-group">
            <label>Status</label>
            <select
              className="sa-filter-select"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="sa-filter-group">
            <label>Date From</label>
            <input
              type="date"
              className="sa-filter-date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="sa-filter-group">
            <label>Date To</label>
            <input
              type="date"
              className="sa-filter-date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>

          {/* Visibility toggles */}
          <div className="sa-filter-group" style={{display:'flex',flexDirection:'column',gap:'0.5rem',justifyContent:'center'}}>
            <label style={{marginBottom:0}}>Visibility</label>
            <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer',fontWeight:600,fontSize:'0.82rem',color:'#555',textTransform:'none',letterSpacing:'normal'}}>
              <input type="checkbox" checked={includeArchived} onChange={e => setIncludeArchived(e.target.checked)} style={{accentColor:'#d97706',width:'15px',height:'15px'}} />
              📦 Include Auto-Archived
            </label>
            <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer',fontWeight:600,fontSize:'0.82rem',color:'#555',textTransform:'none',letterSpacing:'normal'}}>
              <input type="checkbox" checked={includeDeleted} onChange={e => setIncludeDeleted(e.target.checked)} style={{accentColor:'#dc2626',width:'15px',height:'15px'}} />
              🗑️ Include Deleted
            </label>
          </div>
        </div>
      </div>

      {/* ─── ERROR ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>
      )}

      {/* ─── IDLE STATE (no search yet) ─────────────────────────────────── */}
      {!searched && !loading && (
        <div className="sa-state-card">
          <div className="sa-state-icon">🔍</div>
          <div className="sa-state-title">Start Searching</div>
          <div className="sa-state-sub">
            Enter a search term above or pick a filter to find activities.<br />
            Supports ID, user name, email, category, status, and date range.
          </div>
        </div>
      )}

      {/* ─── LOADING STATE ──────────────────────────────────────────────── */}
      {loading && (
        <div className="sa-state-card">
          <div className="sa-state-icon" style={{ animation: 'spin 1s linear infinite', display:'inline-block' }}>⏳</div>
          <div className="sa-state-title">Searching…</div>
          <div className="sa-state-sub">Querying the database for matching activities.</div>
        </div>
      )}

      {/* ─── RESULTS ────────────────────────────────────────────────────── */}
      {searched && !loading && (
        <>
          {/* Results header */}
          <div className="sa-results-header">
            <div className="sa-results-count">
              {results.length === 0
                ? 'No results found'
                : <><span>{results.length.toLocaleString()}</span> activit{results.length === 1 ? 'y' : 'ies'} found</>
              }
              {results.length > 0 && totalPages > 1 && (
                <span style={{ color: '#aaa', marginLeft: '0.5rem', fontWeight: 500 }}>
                  — showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, results.length)}
                </span>
              )}
            </div>
            {results.length > 0 && (
              <div className="sa-page-info">Page {page} of {totalPages}</div>
            )}
          </div>

          {/* No results */}
          {results.length === 0 && (
            <div className="sa-state-card">
              <div className="sa-state-icon">😶‍🌫️</div>
              <div className="sa-state-title">No Activities Found</div>
              <div className="sa-state-sub">
                Try a different keyword, adjust your filters, or widen the date range.
              </div>
            </div>
          )}

          {/* Activity cards */}
          {results.length > 0 && (
            <div className="activity-cards">
              {sortedPageResults.map((activity, idx) => {
                const statusStyle = STATUS_STYLES[activity.status] || STATUS_STYLES.DECLARED;
                const proofSrc = getProofImageSrc(activity.proofImage);
                const mapLink  = getMapLink(activity.latitude, activity.longitude);
                const catInfo  = getCatInfo(activity.activityType);
                const exactMatch = isExactIdMatch(activity);
                const unit = catInfo ? CAT_UNITS[catInfo.key] : '';

                return (
                  <div
                    key={activity.id ?? `r-${idx}`}
                    className={`activity-review-card${exactMatch ? ' exact-match' : ''}`}
                  >
                    {/* CARD HEADER */}
                    <div className="arc-header">
                      <div className="arc-header-left">
                        <span style={{ fontSize: '1.5rem' }}>{catInfo?.icon || '📋'}</span>
                        <div>
                          <div className="arc-type">
                            {catInfo?.label || activity.activityType || 'Activity'}
                            {exactMatch && <span className="sa-exact-tag">Exact ID match</span>}
                          </div>
                          <div className="arc-user-block">
                            <div className="arc-user-name">
                              👤 {activity.userName || activity.userUsername || 'Unknown User'}
                              {activity.userUsername && activity.userName && (
                                <span className="arc-user-handle">@{activity.userUsername}</span>
                              )}
                            </div>
                            {(activity.userEmail) && (
                              <div className="arc-user-email">✉️ {activity.userEmail}</div>
                            )}
                            {activity.userRank && (
                              <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.15rem' }}>🏅 Rank #{activity.userRank}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <span className="arc-id">Activity #{activity.id}</span>
                        {activity.deleted && (
                          <span style={{background:'#fee2e2',color:'#dc2626',fontWeight:700,fontSize:'0.72rem',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'1px solid #fca5a5'}}>🗑️ Deleted</span>
                        )}
                        {activity.archived && !activity.deleted && (
                          <span style={{background:'#fef3c7',color:'#d97706',fontWeight:700,fontSize:'0.72rem',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'1px solid #fde68a'}}>📦 Archived</span>
                        )}
                        <span className="arc-status" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                          {statusStyle.label}
                        </span>
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="arc-body">
                      {/* LEFT — INFO */}
                      <div className="arc-info">
                        <div className="arc-info-grid">
                          <div>
                            <div className="arc-info-label">Quantity</div>
                            <div className="arc-info-value">
                              {activity.declaredQuantity ?? '-'} {unit}
                            </div>
                          </div>
                          <div>
                            <div className="arc-info-label">Points</div>
                            <div className="arc-info-value" style={{ color: '#2a9d8f' }}>
                              {activity.points || 0} pts
                            </div>
                          </div>
                          <div>
                            <div className="arc-info-label">Submitted</div>
                            <div className="arc-info-value" style={{ fontSize: '0.8rem' }}>
                              {formatDate(activity.createdAt)}
                            </div>
                          </div>
                          {mapLink && (
                            <div>
                              <div className="arc-info-label">Location</div>
                              <div className="arc-info-value" style={{ fontSize: '0.8rem' }}>
                                <a href={mapLink} target="_blank" rel="noreferrer" style={{ color: '#2a9d8f', fontWeight: '700' }}>
                                  📍 View on Map
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                        {activity.description && (
                          <div style={{ fontSize: '0.82rem', color: '#666', background: '#f8fffe', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2eeec' }}>
                            💬 {activity.description}
                          </div>
                        )}
                        {activity.status === 'REJECTED' && activity.rejectionReason && (
                          <div className="rejection-badge">
                            ❌ Rejection reason: {activity.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* RIGHT — PHOTOS */}
                      <div className="arc-photos">
                        <div className="arc-photos-title">📸 Proof Photos</div>
                        {proofSrc ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <img
                              src={proofSrc}
                              alt="Proof"
                              className="arc-photo-thumb"
                              onClick={() => setPreview({ src: proofSrc, mapLink })}
                            />
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.82rem', color: '#aaa' }}>No photos yet</div>
                        )}
                      </div>
                    </div>

                    {/* CARD FOOTER */}
                    <div className="arc-footer">
                      <div className="arc-footer-left">
                        {mapLink
                          ? `📍 ${activity.latitude?.toFixed(4)}, ${activity.longitude?.toFixed(4)}`
                          : 'No GPS data'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#888', fontWeight: 600 }}>
                        User ID: {activity.userId ?? '-'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PAGINATION ─────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="sa-pagination">
              <button
                className="sa-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Prev
              </button>

              {/* Page number buttons — show max 7 around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '…'
                    ? <span key={`ellipsis-${i}`} style={{ padding: '0.5rem 0.25rem', color: '#aaa' }}>…</span>
                    : <button
                        key={item}
                        className={`sa-page-btn${page === item ? ' active' : ''}`}
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </button>
                )
              }

              <button
                className="sa-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── PHOTO PREVIEW MODAL ────────────────────────────────────────── */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📸 Proof Photo</h3>
              <button className="modal-close" onClick={() => setPreview(null)}>×</button>
            </div>
            <div className="modal-body">
              <img src={preview.src} alt="Proof" />
            </div>
            {preview.mapLink && (
              <div className="modal-link">
                <a href={preview.mapLink} target="_blank" rel="noreferrer">
                  📍 View location on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchActivities;
