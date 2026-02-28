import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../../api/axios';

// ─── constants ───────────────────────────────────────────────────────────────
const ACTIVITY_TYPES = [
  'Tree Plantation',
  'Recycling',
  'Public Transport',
  'Solar Energy',
  'Composting',
  'Cycling',
  'Other',
];
const STATUS_OPTIONS = ['APPROVED', 'PENDING', 'REJECTED', 'PROOF_SUBMITTED'];

// ─── label formatters ────────────────────────────────────────────────────────
function formatMonthLabel(l) {
  try {
    const [y, m] = l.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return l; }
}
function formatDayLabel(l) {
  try {
    const d = new Date(l + 'T00:00:00');
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  } catch { return l; }
}
function formatHourLabel(h) {
  const n = parseInt(h, 10);
  if (isNaN(n)) return h;
  const s = n < 12 ? 'AM' : 'PM';
  const d = n % 12 === 0 ? 12 : n % 12;
  return `${d}${s}`;
}
function humanizeLabels(labels, g) {
  if (g === 'DAY')  return labels.map(formatDayLabel);
  if (g === 'HOUR') return labels.map(formatHourLabel);
  return labels.map(formatMonthLabel);
}

// ─── date helpers ─────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const currentYearStart = () => `${new Date().getFullYear()}-01-01`;
const currentYearEnd   = () => `${new Date().getFullYear()}-12-31`;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyProgress = () => {
  // chart style
  const [chartType, setChartType] = useState('bar');

  // granularity: MONTH | DAY | HOUR
  const [granularity, setGranularity] = useState('MONTH');

  // filter form state
  const [filterFrom,   setFilterFrom]   = useState(currentYearStart());
  const [filterTo,     setFilterTo]     = useState(currentYearEnd());
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // applied (sent to API)
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate:     currentYearStart(),
    toDate:       currentYearEnd(),
    granularity:  'MONTH',
    activityType: '',
    status:       '',
  });

  // data
  const [labels,      setLabels]      = useState([]);
  const [values,      setValues]      = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchProgressData = useCallback(async (filters) => {
    try {
      setLoading(true);
      setError('');
      const p = new URLSearchParams();
      if (filters.fromDate)     p.set('fromDate',     filters.fromDate);
      if (filters.toDate)       p.set('toDate',       filters.toDate);
      p.set('granularity', filters.granularity || 'MONTH');
      if (filters.activityType) p.set('activityType', filters.activityType);
      if (filters.status)       p.set('status',       filters.status);

      const res  = await api.get(`/api/report/progress?${p.toString()}`);
      const data = res?.data?.data || res?.data || {};
      const g    = data.granularity || filters.granularity || 'MONTH';

      const raw = Array.isArray(data.labels) ? data.labels : [];
      const vals = Array.isArray(data.values) ? data.values : [];
      setLabels(humanizeLabels(raw, g));
      setValues(vals);
      setTotalPoints(data.totalPoints || vals.reduce((s, v) => s + (Number(v) || 0), 0));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProgressData(appliedFilters); }, [appliedFilters, fetchProgressData]);

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleGranularityChange = (g) => {
    setGranularity(g);
    let from = filterFrom, to = filterTo;
    if (g === 'HOUR') {
      const today = todayStr();
      setFilterFrom(today); setFilterTo(today);
      from = today; to = today;
    } else if (g === 'MONTH') {
      const ys = currentYearStart(), ye = currentYearEnd();
      setFilterFrom(ys); setFilterTo(ye);
      from = ys; to = ye;
    }
    setAppliedFilters({ ...appliedFilters, granularity: g, fromDate: from, toDate: to });
  };

  const handleApply = () =>
    setAppliedFilters({ fromDate: filterFrom, toDate: filterTo, granularity, activityType: filterType, status: filterStatus });

  const handleReset = () => {
    const ys = currentYearStart(), ye = currentYearEnd();
    setGranularity('MONTH'); setFilterFrom(ys); setFilterTo(ye); setFilterType(''); setFilterStatus('');
    setAppliedFilters({ fromDate: ys, toDate: ye, granularity: 'MONTH', activityType: '', status: '' });
  };

  // ── chart config ──────────────────────────────────────────────────────────
  const chartData = {
    labels,
    datasets: [{
      label: 'Carbon Points',
      data: values,
      backgroundColor: 'rgba(42, 157, 143, 0.6)',
      borderColor:     'rgba(42, 157, 143, 1)',
      borderWidth: 2,
      tension: 0.3,
    }],
  };
  const titleMap = { MONTH: 'Monthly', DAY: 'Daily', HOUR: 'Hourly' };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      legend: { position: 'top' },
      title:  { display: true, text: `${titleMap[appliedFilters.granularity] || 'Monthly'} Carbon Contribution Progress` },
    },
    scales: { y: { beginAtZero: true } },
  };
  const hasData = values.some((v) => Number(v) > 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Monthly Progress</h1>
        <p className="dashboard-subtitle">Visualize your carbon contribution over time.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── PART 1: History Filter ──────────────────────────────────────────── */}
      <div className="card section-card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary, #555)' }}>
          Filter History
        </h3>
        <div className="progress-filter-row">
          <div className="progress-filter-group">
            <label className="progress-filter-label">From</label>
            <input type="date" className="form-control progress-filter-input"
              value={filterFrom} max={filterTo || undefined}
              onChange={(e) => setFilterFrom(e.target.value)} />
          </div>
          <div className="progress-filter-group">
            <label className="progress-filter-label">To</label>
            <input type="date" className="form-control progress-filter-input"
              value={filterTo} min={filterFrom || undefined}
              onChange={(e) => setFilterTo(e.target.value)} />
          </div>
          <div className="progress-filter-group">
            <label className="progress-filter-label">Activity Type</label>
            <select className="form-control progress-filter-input"
              value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="progress-filter-group">
            <label className="progress-filter-label">Status</label>
            <select className="form-control progress-filter-input"
              value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Approved Only</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="progress-filter-actions">
            <button className="btn btn-primary" onClick={handleApply} disabled={loading} style={{ minWidth: '70px' }}>
              Apply
            </button>
            <button className="btn btn-secondary" onClick={handleReset} disabled={loading} style={{ minWidth: '70px' }}>
              Reset
            </button>
          </div>
        </div>
        {granularity === 'HOUR' && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary, #888)' }}>
            Hourly view works best when From and To are the same day.
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-label">Total Points</div>
          <div className="stat-value stat-positive">{totalPoints.toLocaleString()}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Data Points</div>
          <div className="stat-value stat-primary">{labels.length}</div>
        </div>
      </div>

      {/* ── PART 2: Granularity + chart-type selectors ──────────────────────── */}
      <div className="chart-toolbar" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <button onClick={() => setChartType('bar')}  className={`toggle-button ${chartType === 'bar'  ? 'active' : ''}`}>Bar Chart</button>
        <button onClick={() => setChartType('line')} className={`toggle-button ${chartType === 'line' ? 'active' : ''}`}>Line Chart</button>
        <span style={{ margin: '0 0.25rem', color: '#ccc', alignSelf: 'center' }}>|</span>
        <button onClick={() => handleGranularityChange('MONTH')} className={`toggle-button ${granularity === 'MONTH' ? 'active' : ''}`}>Monthly</button>
        <button onClick={() => handleGranularityChange('DAY')}   className={`toggle-button ${granularity === 'DAY'   ? 'active' : ''}`}>Daily</button>
        <button onClick={() => handleGranularityChange('HOUR')}  className={`toggle-button ${granularity === 'HOUR'  ? 'active' : ''}`}>Hourly</button>
      </div>

      {/* ── Chart (same component, new data) ────────────────────────────────── */}
      <div className="card section-card chart-card">
        {loading ? (
          <div className="page-state">Loading chart data…</div>
        ) : !hasData ? (
          <div className="page-state">No data for the selected period. Try adjusting the filters.</div>
        ) : (
          <div className="chart-shell">
            {chartType === 'bar'
              ? <Bar  data={chartData} options={chartOptions} />
              : <Line data={chartData} options={chartOptions} />}
          </div>
        )}
      </div>

      <div className="section-footer">
        <button onClick={() => fetchProgressData(appliedFilters)} disabled={loading} className="btn btn-primary">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default MonthlyProgress;
