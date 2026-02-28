import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ACTIVITY_TYPES = [
  { value: 'TREE_PLANTATION', label: 'Tree Plantation', unit: 'trees' },
  { value: 'PUBLIC_TRANSPORT', label: 'Public Transport', unit: 'km' },
  { value: 'RECYCLING', label: 'Recycling', unit: 'kg' },
];

const SubmitActivity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    activityType: '',
    description: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedType = ACTIVITY_TYPES.find(t => t.value === formData.activityType);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.activityType || !formData.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        activityType: formData.activityType,
        description: formData.description,
        declaredQuantity: parseFloat(formData.quantity)
      };

      const res = await api.post('/api/activities', payload);
      const activity = res?.data?.data || res?.data;
      const activityId = activity?.id || activity?.activityId;

      if (!activityId) {
        throw new Error('Activity created but ID not returned');
      }

      // Route PUBLIC_TRANSPORT to GPS journey flow
      if (formData.activityType === 'PUBLIC_TRANSPORT') {
        sessionStorage.setItem('journeySession', JSON.stringify({
          activityId,
          declaredKm: parseFloat(formData.quantity)
        }));
        navigate('/journey', { state: { activityId, declaredKm: parseFloat(formData.quantity) } });
        return;
      }

      // Route RECYCLING to recycling proof flow
      if (formData.activityType === 'RECYCLING') {
        sessionStorage.setItem('recyclingSession', JSON.stringify({
          activityId,
          declaredKg: parseFloat(formData.quantity)
        }));
        navigate('/recycling', { state: { activityId, declaredKg: parseFloat(formData.quantity) } });
        return;
      }

      // For all other activity types → start proof session
      const proofRes = await api.post(`/api/proof/start?activityId=${activityId}`);
      const proofData = proofRes?.data?.data || proofRes?.data;
      const proofId = proofData?.id || proofData?.proofId;

      navigate('/proof', { state: { activityId, proofId } });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit activity';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Submit Activity</h1>
          <p className="dashboard-subtitle">Log your sustainability action and start verification.</p>
        </div>

        <div className="card section-card form-card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="form-grid">
              <div className="form-field">
                <label>
                  Activity Type *
                  <select
                      name="activityType"
                      value={formData.activityType}
                      onChange={handleChange}
                      className="form-select"
                      required
                  >
                    <option value="">Select an activity type</option>
                    {ACTIVITY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-field">
                <label>
                  Quantity {selectedType ? `(${selectedType.unit})` : ''} *
                  <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="0.1"
                      step="0.1"
                      placeholder={selectedType ? `Enter ${selectedType.unit}` : 'Enter quantity'}
                      className="form-input"
                      required
                  />
                </label>
              </div>
            </div>

            <div className="form-field">
              <label>
                Description (optional)
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add any additional details about your activity..."
                    className="form-textarea"
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? 'Submitting...' : 'Submit & Continue to Proof'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default SubmitActivity;