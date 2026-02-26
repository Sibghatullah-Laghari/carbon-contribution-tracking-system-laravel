import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const STATUS_STYLES = {
  PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  DECLARED: { bg: '#e0e7ff', color: '#4f46e5', label: 'Declared' },
  PROOF_SUBMITTED: { bg: '#fef3c7', color: '#d97706', label: 'Ready for Review' },
  APPROVED: { bg: '#d1fae5', color: '#059669', label: 'Approved' },
  REJECTED: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' }
};

const CATEGORIES = [
  { key: 'TREE_PLANTATION', label: 'Tree Plantation', icon: '🌳', unit: 'trees' },
  { key: 'PUBLIC_TRANSPORT', label: 'Public Transport', icon: '🚌', unit: 'km' },
  { key: 'RECYCLING', label: 'Recycling', icon: '♻️', unit: 'kg' },
];

const Admin = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryTab, setCategoryTab] = useState('ALL');
  const [preview, setPreview] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true); setError('');
      const res = await api.get('/admin/activities');
      const data = res?.data?.data || res?.data || [];
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (activityId) => {
    setActionLoading(activityId);
    try {
      await api.put(`/admin/activities/approve/${activityId}`);
      setActivities(prev => prev.map(a => a.id === activityId ? { ...a, status: 'APPROVED' } : a));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal);
    try {
      await api.put(`/admin/activities/reject/${rejectModal}`, { reason: rejectReason || '' });
      setActivities(prev => prev.map(a => a.id === rejectModal ? { ...a, status: 'REJECTED', rejectionReason: rejectReason } : a));
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
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

  const matchesCategory = (activity) => {
    if (categoryTab === 'ALL') return true;
    const type = (activity.activityType || activity.type || '').toUpperCase().replace(/ /g, '_');
    return type.includes(categoryTab);
  };

  const filteredActivities = activities.filter(a => {
    const statusMatch = statusFilter === 'ALL' || a.status === statusFilter;
    const categoryMatch = matchesCategory(a);
    return statusMatch && categoryMatch;
  });

  const countByCategory = (catKey) => {
    return activities.filter(a => {
      const type = (a.activityType || a.type || '').toUpperCase().replace(/ /g, '_');
      return catKey === 'ALL' ? true : type.includes(catKey);
    }).length;
  };

  const pendingCount = activities.filter(a =>
      a.status === 'PROOF_SUBMITTED' || a.status === 'PENDING'
  ).length;

  return (
      <div className="dashboard-page">
        <style>{`
        .admin-cat-tabs {
          display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;
        }
        .cat-tab {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.25rem; border-radius: 12px;
          border: 2px solid #e2eeec; background: #fff;
          font-weight: 700; font-size: 0.9rem; cursor: pointer;
          transition: all 0.2s; color: #666;
        }
        .cat-tab:hover { border-color: #2a9d8f; color: #2a9d8f; }
        .cat-tab.active { background: #2a9d8f; color: #fff; border-color: #2a9d8f; }
        .cat-tab-count {
          background: rgba(255,255,255,0.3); padding: 1px 7px;
          border-radius: 20px; font-size: 0.75rem;
        }
        .cat-tab:not(.active) .cat-tab-count { background: #f0f4f3; color: #888; }
        .cat-tab-icon { font-size: 1.2rem; }

        .status-filters {
          display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;
        }
        .status-filter-btn {
          padding: 0.4rem 1rem; border-radius: 20px;
          border: 1.5px solid #e2eeec; background: #fff;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          transition: all 0.2s; color: #666;
        }
        .status-filter-btn:hover { border-color: #2a9d8f; color: #2a9d8f; }
        .status-filter-btn.active { background: #2a9d8f; color: #fff; border-color: #2a9d8f; }

        .activity-cards { display: flex; flex-direction: column; gap: 1rem; }

        .activity-review-card {
          background: #fff; border-radius: 16px;
          border: 1.5px solid #e2eeec;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          overflow: hidden; transition: box-shadow 0.2s;
        }
        .activity-review-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }

        .arc-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem; background: #f8fffe;
          border-bottom: 1px solid #e2eeec; flex-wrap: wrap; gap: 0.5rem;
        }
        .arc-header-left { display: flex; align-items: center; gap: 0.75rem; }
        .arc-id { font-size: 0.78rem; color: #aaa; font-weight: 600; }
        .arc-type { font-weight: 800; color: #1a1a1a; font-size: 0.95rem; }
        .arc-user { font-size: 0.82rem; color: #666; }
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
        .arc-info-item { }
        .arc-info-label { font-size: 0.72rem; color: #aaa; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
        .arc-info-value { font-size: 0.9rem; font-weight: 700; color: #1a1a1a; }

        .arc-photos { padding: 1rem 1.25rem; border-left: 1px solid #e2eeec; }
        .arc-photos-title { font-size: 0.72rem; color: #aaa; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .arc-photos-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; }
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
        .arc-actions { display: flex; gap: 0.5rem; }

        .btn-approve-new {
          padding: 0.5rem 1.2rem; border-radius: 8px;
          background: #16a34a; color: #fff;
          border: none; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-approve-new:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
        .btn-reject-new {
          padding: 0.5rem 1.2rem; border-radius: 8px;
          background: #dc2626; color: #fff;
          border: none; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-reject-new:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
        .btn-approve-new:disabled, .btn-reject-new:disabled { opacity: 0.6; cursor: not-allowed; }

        .rejection-badge {
          background: #fee2e2; color: #dc2626;
          font-size: 0.78rem; padding: 0.3rem 0.75rem;
          border-radius: 8px; font-weight: 600;
        }

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

        .reject-modal-body { padding: 1.25rem; }
        .reject-modal-body label { font-weight: 700; color: #333; display: block; margin-bottom: 0.5rem; }
        .reject-modal-body textarea {
          width: 100%; padding: 0.75rem; border: 1.5px solid #e2eeec;
          border-radius: 8px; font-size: 0.9rem; resize: vertical;
          font-family: 'Inter', sans-serif; outline: none;
        }
        .reject-modal-body textarea:focus { border-color: #dc2626; }
        .reject-modal-footer {
          display: flex; gap: 0.75rem; justify-content: flex-end;
          padding: 0.75rem 1.25rem; border-top: 1px solid #e2eeec;
        }
        .btn-cancel {
          padding: 0.6rem 1.2rem; border-radius: 8px;
          background: #f0f4f3; color: #666;
          border: none; font-weight: 700; cursor: pointer;
        }

        .metrics-row {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem; margin-bottom: 1.5rem;
        }
        .metric-card {
          background: #fff; border-radius: 12px; padding: 1rem 1.25rem;
          border: 1.5px solid #e2eeec; text-align: center;
        }
        .metric-value { font-size: 2rem; font-weight: 800; color: #2a9d8f; }
        .metric-label { font-size: 0.78rem; color: #888; font-weight: 600; margin-top: 2px; }
        .metric-pending .metric-value { color: #d97706; }
        .metric-approved .metric-value { color: #059669; }
        .metric-rejected .metric-value { color: #dc2626; }
      `}</style>

        <div className="dashboard-header">
          <h1 className="dashboard-title">🛠️ Admin Panel</h1>
          <p className="dashboard-subtitle">Review and approve activity submissions by category.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* METRICS */}
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-value">{activities.length}</div>
            <div className="metric-label">Total Activities</div>
          </div>
          <div className="metric-card metric-pending">
            <div className="metric-value">{pendingCount}</div>
            <div className="metric-label">Pending Review</div>
          </div>
          <div className="metric-card metric-approved">
            <div className="metric-value">{activities.filter(a => a.status === 'APPROVED').length}</div>
            <div className="metric-label">Approved</div>
          </div>
          <div className="metric-card metric-rejected">
            <div className="metric-value">{activities.filter(a => a.status === 'REJECTED').length}</div>
            <div className="metric-label">Rejected</div>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="admin-cat-tabs">
          <button
              className={`cat-tab ${categoryTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setCategoryTab('ALL')}
          >
            <span className="cat-tab-icon">📋</span>
            All Activities
            <span className="cat-tab-count">{activities.length}</span>
          </button>
          {CATEGORIES.map(cat => (
              <button
                  key={cat.key}
                  className={`cat-tab ${categoryTab === cat.key ? 'active' : ''}`}
                  onClick={() => setCategoryTab(cat.key)}
              >
                <span className="cat-tab-icon">{cat.icon}</span>
                {cat.label}
                <span className="cat-tab-count">{countByCategory(cat.key)}</span>
              </button>
          ))}
        </div>

        {/* STATUS FILTERS */}
        <div className="status-filters">
          {['ALL', 'PROOF_SUBMITTED', 'APPROVED', 'REJECTED'].map(status => (
              <button
                  key={status}
                  className={`status-filter-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
              >
                {status === 'ALL' ? 'All Statuses' : STATUS_STYLES[status]?.label || status}
                {status !== 'ALL' && (
                    <span style={{marginLeft:"4px", opacity:0.7}}>
                ({activities.filter(a => a.status === status && matchesCategory(a)).length})
              </span>
                )}
              </button>
          ))}
        </div>

        {/* ACTIVITIES */}
        {loading ? (
            <div className="page-state">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
            <div className="card" style={{padding:"2rem", textAlign:"center", color:"#888"}}>
              <div style={{fontSize:"3rem", marginBottom:"0.5rem"}}>
                {categoryTab === 'TREE_PLANTATION' ? '🌳' : categoryTab === 'PUBLIC_TRANSPORT' ? '🚌' : categoryTab === 'RECYCLING' ? '♻️' : '📋'}
              </div>
              <div style={{fontWeight:"700", color:"#333"}}>No activities found</div>
              <div style={{fontSize:"0.85rem", marginTop:"0.25rem"}}>
                {statusFilter !== 'ALL' ? `No ${STATUS_STYLES[statusFilter]?.label} activities in this category` : 'No activities in this category yet'}
              </div>
            </div>
        ) : (
            <div className="activity-cards">
              {filteredActivities.map((activity, idx) => {
                const statusStyle = STATUS_STYLES[activity.status] || STATUS_STYLES.PENDING;
                const isActionLoading = actionLoading === activity.id;
                const proofSrc = getProofImageSrc(activity.proofImage);
                const mapLink = getMapLink(activity.latitude, activity.longitude);
                const catInfo = CATEGORIES.find(c =>
                    (activity.activityType || '').toUpperCase().replace(/ /g, '_').includes(c.key)
                );

                return (
                    <div key={activity.id || idx} className="activity-review-card">
                      {/* CARD HEADER */}
                      <div className="arc-header">
                        <div className="arc-header-left">
                          <span style={{fontSize:"1.5rem"}}>{catInfo?.icon || '📋'}</span>
                          <div>
                            <div className="arc-type">
                              {catInfo?.label || activity.activityType || 'Activity'}
                            </div>
                            <div className="arc-user">
                              👤 {activity.user?.username || activity.username || 'Unknown'}
                              {(activity.user?.email || activity.userEmail) && (
                                  <span style={{marginLeft:"0.5rem", opacity:0.7}}>
                            — {activity.user?.email || activity.userEmail}
                          </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{display:"flex", alignItems:"center", gap:"0.75rem"}}>
                          <span className="arc-id">#{activity.id}</span>
                          <span
                              className="arc-status"
                              style={{background: statusStyle.bg, color: statusStyle.color}}
                          >
                      {statusStyle.label}
                    </span>
                        </div>
                      </div>

                      {/* CARD BODY */}
                      <div className="arc-body">
                        {/* LEFT — INFO */}
                        <div className="arc-info">
                          <div className="arc-info-grid">
                            <div className="arc-info-item">
                              <div className="arc-info-label">Quantity</div>
                              <div className="arc-info-value">
                                {activity.quantity ?? activity.declaredQuantity ?? '-'} {catInfo?.unit || ''}
                              </div>
                            </div>
                            <div className="arc-info-item">
                              <div className="arc-info-label">Points</div>
                              <div className="arc-info-value" style={{color:"#2a9d8f"}}>
                                {activity.carbonPoints || activity.points || 0} pts
                              </div>
                            </div>
                            <div className="arc-info-item">
                              <div className="arc-info-label">Submitted</div>
                              <div className="arc-info-value" style={{fontSize:"0.8rem"}}>
                                {formatDate(activity.createdAt || activity.date)}
                              </div>
                            </div>
                            {mapLink && (
                                <div className="arc-info-item">
                                  <div className="arc-info-label">Location</div>
                                  <div className="arc-info-value" style={{fontSize:"0.8rem"}}>
                                    <a href={mapLink} target="_blank" rel="noreferrer"
                                       style={{color:"#2a9d8f", fontWeight:"700"}}>
                                      📍 View on Map
                                    </a>
                                  </div>
                                </div>
                            )}
                          </div>
                          {activity.description && (
                              <div style={{fontSize:"0.82rem", color:"#666", background:"#f8fffe", padding:"0.6rem 0.75rem", borderRadius:"8px", border:"1px solid #e2eeec"}}>
                                💬 {activity.description}
                              </div>
                          )}
                          {activity.status === 'REJECTED' && activity.rejectionReason && (
                              <div className="rejection-badge" style={{marginTop:"0.5rem"}}>
                                ❌ Rejection reason: {activity.rejectionReason}
                              </div>
                          )}
                        </div>

                        {/* RIGHT — PHOTOS */}
                        <div className="arc-photos">
                          <div className="arc-photos-title">📸 Proof Photos</div>
                          {proofSrc ? (
                              <div className="arc-photos-grid">
                                <img
                                    src={proofSrc}
                                    alt="Proof"
                                    className="arc-photo-thumb"
                                    onClick={() => setPreview({ src: proofSrc, mapLink })}
                                />
                              </div>
                          ) : (
                              <div style={{fontSize:"0.82rem", color:"#aaa"}}>No photos submitted yet</div>
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
                        <div className="arc-actions">
                          {(activity.status === 'PENDING' || activity.status === 'PROOF_SUBMITTED') ? (
                              <>
                                <button
                                    className="btn-approve-new"
                                    onClick={() => handleApprove(activity.id)}
                                    disabled={isActionLoading}
                                >
                                  {isActionLoading ? '...' : '✓ Approve'}
                                </button>
                                <button
                                    className="btn-reject-new"
                                    onClick={() => { setRejectModal(activity.id); setRejectReason(''); }}
                                    disabled={isActionLoading}
                                >
                                  ✕ Reject
                                </button>
                              </>
                          ) : (
                              <span style={{fontSize:"0.82rem", color:"#aaa"}}>
                        {activity.status === 'APPROVED' ? '✓ Approved' : activity.status === 'REJECTED' ? '✕ Rejected' : '-'}
                      </span>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        {/* PHOTO PREVIEW MODAL */}
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

        {/* REJECT REASON MODAL */}
        {rejectModal && (
            <div className="modal-overlay" onClick={() => setRejectModal(null)}>
              <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>❌ Reject Activity</h3>
                  <button className="modal-close" onClick={() => setRejectModal(null)}>×</button>
                </div>
                <div className="reject-modal-body">
                  <label>Reason for rejection (optional)</label>
                  <textarea
                      rows={4}
                      placeholder="Enter reason why this activity is being rejected..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                  />
                  <div style={{fontSize:"0.8rem", color:"#888", marginTop:"0.5rem"}}>
                    This reason will be sent to the user via email.
                  </div>
                </div>
                <div className="reject-modal-footer">
                  <button className="btn-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
                  <button
                      className="btn-reject-new"
                      onClick={handleRejectSubmit}
                      disabled={actionLoading === rejectModal}
                  >
                    {actionLoading === rejectModal ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            </div>
        )}

        <div style={{marginTop:"1rem"}}>
          <button onClick={fetchActivities} disabled={loading} className="btn btn-primary">
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>
  );
};

export default Admin;