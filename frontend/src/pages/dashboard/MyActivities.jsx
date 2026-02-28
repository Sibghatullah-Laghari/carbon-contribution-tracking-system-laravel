import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const STATUS_STYLES = {
  DECLARED: { bg: '#e0e7ff', color: '#4f46e5', label: 'Declared' },
  PROOF_SUBMITTED: { bg: '#fef3c7', color: '#d97706', label: 'Under Review' },
  PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  APPROVED: { bg: '#d1fae5', color: '#059669', label: 'Approved' },
  REJECTED: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  VERIFIED: { bg: '#dbeafe', color: '#2563eb', label: 'Verified' },
  FLAGGED: { bg: '#ffe4e6', color: '#be123c', label: 'Flagged' }
};

const MyActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
        const res = await api.get('/api/activities');
      const data = res?.data?.data || res?.data || [];
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load activities';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatActivityType = (type) => {
    if (!type) return '-';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const getStatusStyle = (status) => {
    return STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'TREE_PLANTATION':
        return '🌳';
      case 'PUBLIC_TRANSPORT':
        return '🚌';
      case 'RECYCLING':
        return '♻️';
      default:
        return '🌱';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Activities</h1>
        <p className="dashboard-subtitle">Track every submission from start to verification.</p>
        <div style={{ marginTop: '0.75rem' }}>
          <button
            onClick={fetchActivities}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card section-card">
        {loading ? (
          <div className="page-state">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="page-state">No activities found. Submit your first activity!</div>
        ) : (
          <div className="activity-list">
            {activities.map((activity, idx) => {
              const statusStyle = getStatusStyle(activity.status);
              const activityType = activity.activityType || activity.type;
              return (
                <div className="activity-card" key={activity.id || idx}>
                  <div className="activity-icon">{getActivityIcon(activityType)}</div>
                  <div className="activity-body">
                    <div className="activity-meta">
                      <span className="activity-type">{formatActivityType(activityType)}</span>
                      <span className="activity-date">{formatDate(activity.createdAt || activity.date)}</span>
                    </div>
                    <div className="activity-details">
                      <span>Quantity: {activity.quantity ?? activity.declaredQuantity ?? '-'}</span>
                      <span className="activity-points">{activity.carbonPoints || activity.points || 0} pts</span>
                    </div>
                  </div>
                  <div className="activity-status">
                    <span
                      className="status-pill status-pill--dynamic"
                      style={{ '--status-bg': statusStyle.bg, '--status-color': statusStyle.color }}
                    >
                      {statusStyle.label}
                    </span>
                    <span className={`activity-verify ${activity.status === 'APPROVED' ? 'verified' : ''}`}>
                      {activity.status === 'APPROVED' ? 'Verified' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="section-footer">
        <button
          onClick={fetchActivities}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default MyActivities;
