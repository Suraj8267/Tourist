// src/tourist/TouristItinerary.js (Enhanced)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TouristNavbar from './navbar';
import AddDestination from './AddDestination';

function TouristItinerary() {
    const [touristData, setTouristData] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const [showAddDestination, setShowAddDestination] = useState(false);
    const [routeOptimization, setRouteOptimization] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedData = localStorage.getItem('touristData');
        if (!storedData) {
            navigate('/tourist-login');
            return;
        }
        
        const data = JSON.parse(storedData);
        setTouristData(data);
        
        const itineraryData = data.itinerary;
        if (Array.isArray(itineraryData)) {
            setItinerary(itineraryData);
        } else {
            setItinerary([]);
        }

        // Fetch route optimization on load
        if (data.tourist_id) {
            fetchRouteOptimization(data.tourist_id);
        }
    }, [navigate]);

    const fetchRouteOptimization = async (touristId) => {
        try {
            const response = await fetch(`http://localhost:8000/route-optimization/${touristId}`);
            if (response.ok) {
                const data = await response.json();
                setRouteOptimization(data);
            }
        } catch (error) {
            console.error('Error fetching route optimization:', error);
        }
    };

    const handleDestinationAdded = (addedDestination) => {
        // Refresh tourist data
        refreshTouristData();
        setShowAddDestination(false);
        
        // Show success message
        alert(`✅ ${addedDestination.destination.location} added to your itinerary with safety score: ${addedDestination.safety_score}/100`);
    };

    const refreshTouristData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/tourist/${touristData.tourist_id}`);
            if (response.ok) {
                const updatedData = await response.json();
                localStorage.setItem('touristData', JSON.stringify(updatedData));
                setTouristData(updatedData);
                setItinerary(updatedData.itinerary || []);
                
                // Refresh route optimization
                fetchRouteOptimization(updatedData.tourist_id);
            }
        } catch (error) {
            console.error('Error refreshing tourist data:', error);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const getSafetyScore = (day) => {
        return day.safety_score || 80; // Use stored score or default
    };

    const getSafetyColor = (score) => {
        if (score >= 90) return 'safe';
        if (score >= 70) return 'warning';
        return 'danger';
    };

    if (!touristData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading itinerary...</p>
            </div>
        );
    }

    return (
        <div className="tourist-app">
            <TouristNavbar touristName={touristData.full_name?.split(' ')[0]} />
            
            <div className="dashboard-container">
                <main className="dashboard-main">
                    <section className="itinerary-section">
                        <div className="itinerary-header">
                            <h2>🗺️ Travel Itinerary</h2>
                            <button 
                                className="btn-add-destination"
                                onClick={() => setShowAddDestination(true)}
                            >
                                ➕ Add Destination
                            </button>
                        </div>
                        
                        <div className="itinerary-overview">
                            <div className="overview-card">
                                <h3>Trip Overview</h3>
                                <div className="overview-stats">
                                    <div className="stat">
                                        <span className="stat-label">Destination:</span>
                                        <span className="stat-value">{touristData.destination}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Duration:</span>
                                        <span className="stat-value">{formatDate(touristData.checkin_date)} - {formatDate(touristData.checkout_date)}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Total Days:</span>
                                        <span className="stat-value">{itinerary.length}</span>
                                    </div>
                                    {routeOptimization && (
                                        <div className="stat">
                                            <span className="stat-label">Average Safety:</span>
                                            <span className={`stat-value safety-${getSafetyColor(routeOptimization.average_safety_score)}`}>
                                                {routeOptimization.average_safety_score}/100
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Route Optimization Suggestions */}
                        {routeOptimization && routeOptimization.suggestions.length > 0 && (
                            <div className="optimization-suggestions">
                                <h3>💡 Route Optimization Suggestions</h3>
                                <div className="suggestions-list">
                                    {routeOptimization.suggestions.map((suggestion, index) => (
                                        <div key={index} className={`suggestion-item ${suggestion.type}`}>
                                            <div className="suggestion-header">
                                                <span className="day-label">Day {suggestion.day}</span>
                                                <span className="location-label">{suggestion.location}</span>
                                                <span className="score-badge">{suggestion.current_score}/100</span>
                                            </div>
                                            <p className="suggestion-text">{suggestion.suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="itinerary-list">
                            {Array.isArray(itinerary) && itinerary.length > 0 ? (
                                itinerary.map((day, index) => {
                                    if (!day || typeof day !== 'object') {
                                        return null;
                                    }

                                    const safetyScore = getSafetyScore(day);
                                    
                                    return (
                                        <div key={index} className="itinerary-item enhanced">
                                            <div className="itinerary-header">
                                                <div className="itinerary-date">
                                                    <span className="day-number">Day {index + 1}</span>
                                                    <span className="date-text">{formatDate(day.date || 'Date not available')}</span>
                                                    {day.added_by_user && (
                                                        <span className="user-added-badge">✨ Added by you</span>
                                                    )}
                                                </div>
                                                <div className={`safety-score ${getSafetyColor(safetyScore)}`}>
                                                    <span className="score-label">Safety Score</span>
                                                    <span className="score-value">{safetyScore}/100</span>
                                                </div>
                                            </div>
                                            
                                            <div className="itinerary-content">
                                                <div className="location-info">
                                                    <h4>📍 {day.location || 'Location not specified'}</h4>
                                                    <p className="activities">🎯 {day.activities || 'Activities not specified'}</p>
                                                    <p className="accommodation">🏨 {day.accommodation || 'Accommodation not specified'}</p>
                                                </div>

                                                {/* Safety Tips */}
                                                {safetyScore < 85 && (
                                                    <div className="safety-tips">
                                                        <h5>⚠️ Safety Tips:</h5>
                                                        <ul>
                                                            {safetyScore < 70 ? (
                                                                <>
                                                                    <li>Consider traveling in groups</li>
                                                                    <li>Keep emergency contacts handy</li>
                                                                    <li>Avoid isolated areas</li>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <li>Stay aware of surroundings</li>
                                                                    <li>Keep valuables secure</li>
                                                                </>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-itinerary">
                                    <div className="no-itinerary-card">
                                        <h3>📋 No Itinerary Available</h3>
                                        <p>Start building your travel itinerary by adding destinations.</p>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => setShowAddDestination(true)}
                                        >
                                            ➕ Add First Destination
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="itinerary-actions">
                            <button 
                                className="btn-secondary"
                                onClick={() => navigate('/tourist/dashboard')}
                            >
                                ← Back to Dashboard
                            </button>
                            {itinerary.length > 0 && (
                                <button 
                                    className="btn-primary"
                                    onClick={() => navigate('/tourist/map')}
                                >
                                    🗺️ View on Map
                                </button>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            {/* Add Destination Modal */}
            {showAddDestination && (
                <AddDestination
                    touristId={touristData.tourist_id}
                    onDestinationAdded={handleDestinationAdded}
                    onCancel={() => setShowAddDestination(false)}
                />
            )}
        </div>
    );
}

export default TouristItinerary;
