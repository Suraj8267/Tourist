// src/components/SafetyScoreWidget.js - Real-time safety score display
import React, { useState, useEffect } from 'react';

const SafetyScoreWidget = ({ location, destination }) => {
    const [safetyScore, setSafetyScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (location || destination) {
            fetchSafetyScore();
        }
    }, [location, destination]);

    const fetchSafetyScore = async () => {
        setLoading(true);
        try {
            const locationName = destination || 'current_location';
            const response = await fetch(`http://localhost:8000/safety-scores/${locationName}`);
            
            if (response.ok) {
                const data = await response.json();
                setSafetyScore(data.score);
                setRecommendations(data.recommendations || []);
            } else {
                // Fallback to mock data
                const mockScore = getMockSafetyScore(locationName);
                setSafetyScore(mockScore.score);
                setRecommendations(mockScore.recommendations);
            }
        } catch (error) {
            console.error('Error fetching safety score:', error);
            // Fallback to mock data
            const mockScore = getMockSafetyScore(destination || 'Delhi');
            setSafetyScore(mockScore.score);
            setRecommendations(mockScore.recommendations);
        } finally {
            setLoading(false);
        }
    };

    const getMockSafetyScore = (locationName) => {
        const mockData = {
            'Delhi': { 
                score: 75, 
                recommendations: ['Avoid isolated areas at night', 'Use registered taxis', 'Keep valuables secure'] 
            },
            'Mumbai': { 
                score: 80, 
                recommendations: ['Be cautious during monsoon', 'Keep emergency contacts handy'] 
            },
            'Goa': { 
                score: 90, 
                recommendations: ['Beach safety guidelines', 'Licensed water sports only'] 
            },
            'Rajasthan': { 
                score: 85, 
                recommendations: ['Stay hydrated', 'Respect local customs'] 
            },
            'Kerala': { 
                score: 88, 
                recommendations: ['Monsoon precautions', 'Ayurveda center verification'] 
            }
        };
        
        return mockData[locationName] || { score: 75, recommendations: ['Stay alert', 'Follow local guidelines'] };
    };

    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981'; // Green
        if (score >= 70) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return 'Very Safe';
        if (score >= 70) return 'Moderately Safe';
        return 'Exercise Caution';
    };

    const getScoreIcon = (score) => {
        if (score >= 90) return '🟢';
        if (score >= 70) return '🟡';
        return '🔴';
    };

    if (loading) {
        return (
            <div className="safety-score-widget loading">
                <div className="widget-header">
                    <h4>🛡️ Safety Score</h4>
                </div>
                <div className="loading-content">
                    <div className="score-spinner"></div>
                    <p>Calculating safety score...</p>
                </div>
            </div>
        );
    }

    if (!safetyScore) return null;

    return (
        <div className="safety-score-widget">
            <div className="widget-header">
                <h4>🛡️ Safety Score</h4>
                {destination && <span className="location-name">{destination}</span>}
            </div>
            
            <div className="score-display">
                <div 
                    className="score-circle"
                    style={{ borderColor: getScoreColor(safetyScore) }}
                >
                    <div className="score-number" style={{ color: getScoreColor(safetyScore) }}>
                        {safetyScore}
                    </div>
                    <div className="score-total">/100</div>
                </div>
                
                <div className="score-info">
                    <div className="score-label">
                        <span className="score-icon">{getScoreIcon(safetyScore)}</span>
                        <span>{getScoreLabel(safetyScore)}</span>
                    </div>
                    
                    <div className="score-bar">
                        <div 
                            className="score-fill"
                            style={{ 
                                width: `${safetyScore}%`,
                                backgroundColor: getScoreColor(safetyScore)
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {recommendations.length > 0 && (
                <div className="safety-recommendations">
                    <h5>💡 Safety Tips</h5>
                    <ul>
                        {recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="widget-footer">
                <button 
                    className="refresh-btn"
                    onClick={fetchSafetyScore}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>
                <small>Last updated: {new Date().toLocaleTimeString()}</small>
            </div>
        </div>
    );
};

export default SafetyScoreWidget;
