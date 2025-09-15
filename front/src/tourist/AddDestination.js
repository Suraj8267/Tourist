// src/tourist/components/AddDestination.js
import React, { useState } from 'react';

function AddDestination({ touristId, onDestinationAdded, onCancel }) {
    const [formData, setFormData] = useState({
        location: '',
        date: '',
        activities: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [safetyScore, setSafetyScore] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Check safety score when location changes
        if (name === 'location' && value.trim().length > 2) {
            checkSafetyScore(value.trim());
        }
    };

    const checkSafetyScore = async (location) => {
        try {
            const response = await fetch(`http://localhost:8000/safety-scores/${encodeURIComponent(location)}`);
            if (response.ok) {
                const data = await response.json();
                setSafetyScore(data);
            }
        } catch (error) {
            console.error('Error fetching safety score:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.location.trim() || !formData.date) {
            setError('Please fill in location and date');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/add-destination/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tourist_id: touristId,
                    location: formData.location.trim(),
                    date: formData.date,
                    activities: formData.activities || 'Exploring the area'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to add destination');
            }

            // Success callback
            onDestinationAdded(data);
            
            // Reset form
            setFormData({ location: '', date: '', activities: '' });
            setSafetyScore(null);

        } catch (error) {
            console.error('Error adding destination:', error);
            setError(error.message || 'Failed to add destination');
        } finally {
            setIsLoading(false);
        }
    };

    const getSafetyColor = (score) => {
        if (score >= 90) return 'safe';
        if (score >= 70) return 'warning';
        return 'danger';
    };

    return (
        <div className="add-destination-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>➕ Add New Destination</h3>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="add-destination-form">
                    {error && (
                        <div className="error-message">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="location">📍 Destination</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            placeholder="Enter destination (e.g., Delhi, Mumbai, Tokyo)"
                            value={formData.location}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        
                        {safetyScore && (
                            <div className={`safety-preview ${getSafetyColor(safetyScore.safety_score)}`}>
                                <div className="safety-header">
                                    <span className="safety-label">Safety Score</span>
                                    <span className="safety-value">{safetyScore.safety_score}/100</span>
                                </div>
                                <div className="safety-factors">
                                    <strong>Risk Factors:</strong>
                                    <ul>
                                        {safetyScore.risk_factors.map((factor, index) => (
                                            <li key={index}>{factor}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">📅 Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="activities">🎯 Activities (Optional)</label>
                        <textarea
                            id="activities"
                            name="activities"
                            placeholder="What do you plan to do there?"
                            value={formData.activities}
                            onChange={handleChange}
                            rows="3"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={isLoading || !formData.location.trim() || !formData.date}
                        >
                            {isLoading ? 'Adding...' : 'Add Destination'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDestination;
