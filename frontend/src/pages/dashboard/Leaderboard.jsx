import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const RANK_STYLES = {
  1: { bg: '#fef3c7', color: '#d97706', icon: '🥇' },
  2: { bg: '#f3f4f6', color: '#6b7280', icon: '🥈' },
  3: { bg: '#fef3c7', color: '#92400e', icon: '🥉' }
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/leaderboard');
      const data = res?.data?.data || res?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load leaderboard';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank) => {
    return RANK_STYLES[rank] || { bg: '#fff', color: '#374151', icon: null };
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Leaderboard</h1>
        <p className="dashboard-subtitle">Celebrate the top contributors and stay inspired.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card section-card">
        {loading ? (
          <div className="page-state">Loading leaderboard...</div>
        ) : users.length === 0 ? (
          <div className="page-state">No users on the leaderboard yet.</div>
        ) : (
          <div>
            {/* Top 3 Podium */}
            {users.length >= 3 && (
              <div className="podium">
                {/* 2nd Place */}
                <div className="podium-card">
                  <div className="podium-icon">🥈</div>
                  <div className="podium-tile podium-silver">
                    <div className="podium-name">{users[1]?.name || users[1]?.username || 'User'}</div>
                    {users[1]?.email && <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{users[1].email}</div>}
                    <div className="podium-score">
                      {(users[1]?.totalPoints || users[1]?.carbonPoints || users[1]?.points || 0).toLocaleString()} pts
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="podium-card podium-first">
                  <div className="podium-icon">🥇</div>
                  <div className="podium-tile podium-gold">
                    <div className="podium-name podium-name-strong">
                      {users[0]?.name || users[0]?.username || 'User'}
                    </div>
                    {users[0]?.email && <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{users[0].email}</div>}
                    <div className="podium-score podium-score-strong">
                      {(users[0]?.totalPoints || users[0]?.carbonPoints || users[0]?.points || 0).toLocaleString()} pts
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="podium-card">
                  <div className="podium-icon">🥉</div>
                  <div className="podium-tile podium-bronze">
                    <div className="podium-name small">
                      {users[2]?.name || users[2]?.username || 'User'}
                    </div>
                    {users[2]?.email && <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{users[2].email}</div>}
                    <div className="podium-score small">
                      {(users[2]?.totalPoints || users[2]?.carbonPoints || users[2]?.points || 0).toLocaleString()} pts
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Ranking Table */}
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="cell-center">Rank</th>
                    <th>User</th>
                    <th className="cell-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const rank = user.rank || idx + 1;
                    const rankStyle = getRankStyle(rank);
                    return (
                      <tr key={user.id || user.userId || idx}>
                        <td className="cell-center">
                          <span className="rank-pill" style={{ backgroundColor: rankStyle.bg, color: rankStyle.color }}>
                            {rankStyle.icon || rank}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: rank <= 3 ? 600 : 500, color: rankStyle.color }}>
                            {user.username || user.name || 'Anonymous'}
                          </div>
                          {user.email && (
                            <div className="table-muted">
                              {user.email}
                            </div>
                          )}
                        </td>
                        <td className="cell-right table-strong" style={{ color: rank <= 3 ? rankStyle.color : '#2a9d8f' }}>
                          {(user.totalPoints || user.carbonPoints || user.points || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="section-footer">
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
