// src/tourist/EnhancedMap.js - Alternative Map Implementation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TouristNavbar from './navbar';
import { useLocation } from './hooks/uselocation';
import './tourist.css';

function EnhancedMap() {
    const [touristData, setTouristData] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
    const [mapStyle, setMapStyle] = useState('standard');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [safeZones, setSafeZones] = useState([]);
    const [dangerZones, setDangerZones] = useState([]);
    const navigate = useNavigate();

    // Get current location
    const { location, error: locationError, isTracking } = useLocation(
        touristData?.tourist_id, 
        true
    );

    useEffect(() => {
        const storedData = localStorage.getItem('touristData');
        if (!storedData) {
            navigate('/tourist-login');
            return;
        }
        
        const data = JSON.parse(storedData);
        setTouristData(data);
        setItinerary(data.itinerary || []);

        // Load safety zones
        loadSafetyZones();
    }, [navigate]);

    useEffect(() => {
        if (location) {
            setMapCenter([location.lat, location.lng]);
            setCurrentLocation(location);
        }
    }, [location]);

    const loadSafetyZones = () => {
        setSafeZones([
            { id: 1, center: [28.6139, 77.2090], radius: 2000, name: "Central Delhi - Tourist Areas" },
            { id: 2, center: [28.5562, 77.1000], radius: 1500, name: "Airport Area" },
            { id: 3, center: [19.0760, 72.8777], radius: 2500, name: "Mumbai Central" },
            { id: 4, center: [15.2993, 74.1240], radius: 3000, name: "North Goa Beaches" }
        ]);

        setDangerZones([
            { id: 1, center: [28.6500, 77.1500], radius: 1000, name: "High Crime Area", severity: "high" },
            { id: 2, center: [19.0500, 72.9000], radius: 800, name: "Industrial Zone", severity: "medium" }
        ]);
    };

    const getCoordinatesForLocation = (locationName) => {
        const locationCoords = {
            'Delhi': [28.6139, 77.2090],
            'Mumbai': [19.0760, 72.8777],
            'Goa': [15.2993, 74.1240],
            'Rajasthan': [26.9124, 75.7873],
            'Kerala': [9.9312, 76.2673],
            'Tokyo': [35.6762, 139.6503],
            'London': [51.5074, -0.1278],
            'Paris': [48.8566, 2.3522],
            'New York': [40.7128, -74.0060]
        };
        
        return locationCoords[locationName] || [28.6139, 77.2090];
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const getSafetyColor = (score) => {
        if (score >= 90) return '#10b981'; // Green
        if (score >= 70) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    if (!touristData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading map...</p>
            </div>
        );
    }

    return (
        <div className="tourist-app">
            <TouristNavbar touristName={touristData.full_name?.split(' ')[0]} />
            
            <div className="enhanced-map-container">
                <div className="map-header">
                    <h2>🗺️ Enhanced Travel Map</h2>
                    <div className="map-controls">
                        <button 
                            className="btn-back"
                            onClick={() => navigate('/tourist/itinerary')}
                        >
                            ← Back to Itinerary
                        </button>
                        <div className="location-status">
                            <span className={`status-dot ${isTracking ? 'active' : 'inactive'}`}></span>
                            <span>{isTracking ? 'Location Active' : 'Location Inactive'}</span>
                        </div>
                    </div>
                </div>

                {/* Alternative Map Implementation using Google Maps Embed */}
                <div className="map-alternatives">
                    <div className="map-option active">
                        <h3>🌍 Interactive Map View</h3>
                        <div className="google-map-container">
                            {currentLocation ? (
                                <iframe
                                    src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${currentLocation.lat},${currentLocation.lng}&zoom=12&maptype=roadmap`}
                                    width="100%"
                                    height="400"
                                    style={{ border: 0, borderRadius: '12px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Tourist Location Map"
                                ></iframe>
                            ) : (
                                <div className="map-placeholder">
                                    <div className="placeholder-content">
                                        <h4>📍 Location Required</h4>
                                        <p>Enable location services to view your position on the map</p>
                                        <button 
                                            className="btn-primary"
                                            onClick={() => window.location.reload()}
                                        >
                                            🔄 Refresh Location
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alternative: Static Map with Markers */}
                    <div className="map-option">
                        <h3>📊 Route Overview</h3>
                        <div className="static-map-view">
                            <div className="route-visualization">
                                {currentLocation && (
                                    <div className="location-card current">
                                        <div className="location-marker current">📍</div>
                                        <div className="location-info">
                                            <h4>Current Location</h4>
                                            <p>{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
                                            <small>Accuracy: ±{Math.round(currentLocation.accuracy)}m</small>
                                        </div>
                                    </div>
                                )}

                                {itinerary.map((day, index) => {
                                    const coords = getCoordinatesForLocation(day.location);
                                    const safetyScore = day.safety_score || 80;
                                    const distance = currentLocation ? 
                                        calculateDistance(currentLocation.lat, currentLocation.lng, coords[0], coords[1]) : 0;
                                    
                                    return (
                                        <div key={index} className="location-card destination">
                                            <div className={`location-marker ${safetyScore >= 70 ? 'safe' : 'danger'}`}>
                                                {safetyScore >= 70 ? '🟢' : '🔴'}
                                            </div>
                                            <div className="location-info">
                                                <h4>Day {index + 1}: {day.location}</h4>
                                                <p>{coords[0].toFixed(4)}, {coords[1].toFixed(4)}</p>
                                                <div className="location-stats">
                                                    <span className="safety-badge" style={{background: getSafetyColor(safetyScore)}}>
                                                        Safety: {safetyScore}/100
                                                    </span>
                                                    {currentLocation && (
                                                        <span className="distance-badge">
                                                            📏 {distance.toFixed(1)} km away
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="activities">🎯 {day.activities}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Alternative: List View with Directions */}
                    <div className="map-option">
                        <h3>🧭 Navigation Guide</h3>
                        <div className="navigation-list">
                            {itinerary.map((day, index) => {
                                const coords = getCoordinatesForLocation(day.location);
                                const safetyScore = day.safety_score || 80;
                                
                                return (
                                    <div key={index} className="navigation-item">
                                        <div className="nav-step">
                                            <span className="step-number">{index + 1}</span>
                                        </div>
                                        <div className="nav-content">
                                            <h4>{day.location}</h4>
                                            <p className="nav-date">{new Date(day.date).toLocaleDateString()}</p>
                                            <p className="nav-activities">{day.activities}</p>
                                            
                                            <div className="nav-actions">
                                                <a 
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-nav"
                                                >
                                                    🧭 Get Directions
                                                </a>
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-nav"
                                                >
                                                    📍 View on Maps
                                                </a>
                                            </div>
                                            
                                            <div className="safety-indicator">
                                                <span className={`safety-dot ${safetyScore >= 70 ? 'safe' : 'warning'}`}></span>
                                                <span>Safety Score: {safetyScore}/100</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Safety Information Panel */}
                <div className="safety-panel">
                    <h3>🛡️ Safety Information</h3>
                    <div className="safety-grid">
                        <div className="safety-card safe">
                            <h4>🟢 Safe Zones</h4>
                            <p>{safeZones.length} areas identified</p>
                            <ul>
                                {safeZones.slice(0, 3).map(zone => (
                                    <li key={zone.id}>{zone.name}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="safety-card warning">
                            <h4>⚠️ Warning Areas</h4>
                            <p>{dangerZones.length} areas to avoid</p>
                            <ul>
                                {dangerZones.map(zone => (
                                    <li key={zone.id}>{zone.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="map-actions">
                    <button 
                        className="btn-emergency"
                        onClick={() => navigate('/tourist/emergency')}
                    >
                        🚨 Emergency Help
                    </button>
                    <button 
                        className="btn-primary"
                        onClick={() => navigate('/tourist/dashboard')}
                    >
                        🏠 Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EnhancedMap;
