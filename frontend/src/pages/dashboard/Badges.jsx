import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const BADGE_DEFINITIONS = [
  { id: 1, name: 'Bronze', minPoints: 0, icon: '🥉', color: '#b45309', description: 'Getting started with sustainable actions' },
  { id: 2, name: 'Silver', minPoints: 101, icon: '🥈', color: '#6b7280', description: 'Making consistent positive impact' },
  { id: 3, name: 'Gold', minPoints: 301, icon: '🥇', color: '#d97706', description: 'Leading the way in sustainability' }
];

const Badges = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/me');
      const user = res?.data?.data || res?.data || {};
      setUserPoints(user.totalPoints || user.carbonPoints || user.points || 0);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load user data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBadge = () => {
    for (let i = BADGE_DEFINITIONS.length - 1; i >= 0; i--) {
      if (userPoints >= BADGE_DEFINITIONS[i].minPoints) {
        return BADGE_DEFINITIONS[i];
      }
    }
    return BADGE_DEFINITIONS[0];
  };

  const getNextBadge = () => {
    const current = getCurrentBadge();
    const currentIndex = BADGE_DEFINITIONS.findIndex(b => b.id === current.id);
    if (currentIndex < BADGE_DEFINITIONS.length - 1) {
      return BADGE_DEFINITIONS[currentIndex + 1];
    }
    return null;
  };

  const currentBadge = getCurrentBadge();
  const nextBadge = getNextBadge();
  const progressToNext = nextBadge
    ? Math.min(100, ((userPoints - currentBadge.minPoints) / (nextBadge.minPoints - currentBadge.minPoints)) * 100)
    : 100;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Badges</h1>
        <p className="dashboard-subtitle">Celebrate milestones as you grow your impact.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="page-state">Loading badges...</div>
      ) : (
        <>
          <div className="card badge-current">
            <div className="badge-hero">
              <div className="badge-icon active">{currentBadge.icon}</div>
              <div>
                <h2 style={{ color: currentBadge.color }}>{currentBadge.name}</h2>
                <p>{currentBadge.description}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.25rem' }}>
              <span className="badge-points">{userPoints.toLocaleString()}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-500)' }}>points earned</span>
            </div>

            {nextBadge && (
              <div className="badge-progress">
                <div className="badge-progress-label">
                  Progress to {nextBadge.name} — {nextBadge.minPoints.toLocaleString()} pts required
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressToNext}%`, backgroundColor: currentBadge.color }}
                  />
                </div>
                <div className="badge-progress-meta">
                  {(nextBadge.minPoints - userPoints).toLocaleString()} pts to go
                </div>
              </div>
            )}
          </div>

          <div className="section-header">
            <h2>All Badges</h2>
            <span className="section-hint">Unlock each level as you contribute more.</span>
          </div>

          <div className="badge-grid">
            {BADGE_DEFINITIONS.map(badge => {
              const isUnlocked = userPoints >= badge.minPoints;
              const isActive = currentBadge.id === badge.id;
              return (
                <div
                  key={badge.id}
                  className={`card badge-card ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}`}
                >
                  <div className="badge-icon" style={{ color: badge.color }}>
                    {badge.icon}
                  </div>
                  <div className="badge-name" style={{ color: isUnlocked ? badge.color : '#9ca3af' }}>
                    {badge.name}
                  </div>
                  <div className="badge-meta">{badge.minPoints.toLocaleString()} pts</div>
                  {isUnlocked && (
                    <div className="badge-status">✓ Unlocked</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Badges;
