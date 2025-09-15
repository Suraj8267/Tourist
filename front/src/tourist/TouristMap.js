// src/tourist/TouristMap.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleMapComponent from '../components/GoogleMapComponent';
import TouristNavbar from './navbar';
import { useLocation } from './hooks/uselocation';
import './tourist.css';

// Google Maps marker configurations
const createGoogleMarkerIcon = (color) => ({
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="${color}" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>
    `)}`,
    scaledSize: { width: 32, height: 32 }
});

const currentLocationIcon = createGoogleMarkerIcon('#4285F4');
const destinationIcon = createGoogleMarkerIcon('#34A853');
const dangerIcon = createGoogleMarkerIcon('#EA4335');

function TouristMap() {
    const [touristData, setTouristData] = useState(null);
    const [itinerary, setItinerary] = useState([]);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default Delhi
    const [safeZones, setSafeZones] = useState([]);
    const [dangerZones, setDangerZones] = useState([]);
    const [mapStyle, setMapStyle] = useState('standard');
    const [showTraffic, setShowTraffic] = useState(false);
    const navigate = useNavigate();

    // Get current location with enhanced accuracy
    const { location, error: locationError, isTracking } = useLocation(
        touristData?.tourist_id, 
        true
    );

    // Update map center when location changes
    useEffect(() => {
        if (location && location.lat && location.lng) {
            setMapCenter([location.lat, location.lng]);
        }
    }, [location]);

    useEffect(() => {
        const storedData = localStorage.getItem('touristData');
        if (!storedData) {
            navigate('/tourist-login');
            return;
        }
        
        const data = JSON.parse(storedData);
        setTouristData(data);
        setItinerary(data.itinerary || []);

        // Load safety zones (mock data)
        loadSafetyZones();
    }, [navigate]);

    // Update map center when location is available
    useEffect(() => {
        if (location) {
            setMapCenter([location.lat, location.lng]);
        }
    }, [location]);

    const loadSafetyZones = () => {
        // Mock safety zones data - In production, load from backend
        setSafeZones([
            // Delhi safe zones
            { id: 1, center: [28.6139, 77.2090], radius: 2000, name: "Central Delhi - Tourist Areas" },
            { id: 2, center: [28.5562, 77.1000], radius: 1500, name: "Airport Area" },
            
            // Mumbai safe zones  
            { id: 3, center: [19.0760, 72.8777], radius: 2500, name: "Mumbai Central" },
            
            // Goa safe zones
            { id: 4, center: [15.2993, 74.1240], radius: 3000, name: "North Goa Beaches" }
        ]);

        setDangerZones([
            // Areas to avoid
            { id: 1, center: [28.6500, 77.1500], radius: 1000, name: "High Crime Area", severity: "high" },
            { id: 2, center: [19.0500, 72.9000], radius: 800, name: "Industrial Zone", severity: "medium" }
        ]);
    };

    // Mock coordinate conversion for destinations
    const getCoordinatesForLocation = (locationName) => {
        const locationCoords = {
            'Delhi': [28.6139, 77.2090],
            'Mumbai': [19.0760, 72.8777],
            'Goa': [15.2993, 74.1240],
            'Rajasthan': [26.9124, 75.7873], // Jaipur
            'Kerala': [9.9312, 76.2673], // Kochi
            'Tokyo': [35.6762, 139.6503],
            'London': [51.5074, -0.1278],
            'Paris': [48.8566, 2.3522],
            'New York': [40.7128, -74.0060]
        };
        
        return locationCoords[locationName] || [28.6139, 77.2090];
    };

    // Create route polyline
    const createRoutePolyline = () => {
        if (!location || itinerary.length === 0) return [];

        const points = [[location.lat, location.lng]]; // Start with current location
        
        itinerary.forEach(day => {
            const coords = getCoordinatesForLocation(day.location);
            points.push(coords);
        });

        return points;
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
            
            <div className="map-container">
                <div className="map-header">
                    <h2>🗺️ Your Travel Map</h2>
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

                <GoogleMapComponent
                    center={{ lat: mapCenter[0], lng: mapCenter[1] }}
                    zoom={15}
                    markers={[
                        // Current location marker
                        ...(location ? [{
                            lat: location.lat,
                            lng: location.lng,
                            title: 'Your Current Location',
                            icon: currentLocationIcon,
                            info: `
                                <div>
                                    <strong>📍 Your Current Location</strong><br />
                                    <small>Accuracy: ±${Math.round(location.accuracy)}m</small><br />
                                    <small>Last updated: ${new Date(location.timestamp).toLocaleTimeString()}</small>
                                </div>
                            `
                        }] : []),
                        // Destination markers
                        ...itinerary.map((day, index) => {
                            const coords = getCoordinatesForLocation(day.location);
                            const safetyScore = day.safety_score || 80;
                            const isDangerous = safetyScore < 70;
                            
                            return {
                                lat: coords[0],
                                lng: coords[1],
                                title: `Day ${index + 1}: ${day.location}`,
                                icon: isDangerous ? dangerIcon : destinationIcon,
                                info: `
                                    <div>
                                        <strong>Day ${index + 1}: ${day.location}</strong><br />
                                        <strong>Date:</strong> ${new Date(day.date).toLocaleDateString()}<br />
                                        <strong>Activities:</strong> ${day.activities}<br />
                                        <div style="background: ${getSafetyColor(safetyScore)}; color: white; padding: 5px; border-radius: 3px; margin-top: 5px;">
                                            Safety Score: ${safetyScore}/100
                                        </div>
                                    </div>
                                `
                            };
                        })
                    ]}
                    onLocationUpdate={(pos) => {
                        // Handle location updates from Google Maps
                        if (location) {
                            setMapCenter([pos.lat, pos.lng]);
                        }
                    }}
                    showCurrentLocation={true}
                    className="tourist-map-view"
                />

                {/* Map Legend */}
                {/* Enhanced Map Controls */}
                <div className="map-controls-panel">
                    <div className="map-legend">
                        <h4>🗺️ Map Legend</h4>
                        <div className="legend-grid">
                            <div className="legend-item">
                                <span className="legend-icon current">📍</span>
                                <span>Your Location</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-icon safe">🟢</span>
                                <span>Safe Destinations</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-icon danger">🔴</span>
                                <span>High-Risk Areas</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-line"></span>
                                <span>Your Route</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-zone safe-zone"></span>
                                <span>Safe Zones</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-zone danger-zone"></span>
                                <span>Warning Zones</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Map View Options */}
                    <div className="map-view-options">
                        <h4>🎛️ View Options</h4>
                        <div className="view-buttons">
                            <button className="view-btn active" title="Standard Map">
                                🗺️ Standard
                            </button>
                            <button className="view-btn" title="Satellite View">
                                🛰️ Satellite
                            </button>
                            <button className="view-btn" title="Dark Theme">
                                🌙 Dark
                            </button>
                        </div>
                    </div>
                    
                    {/* Safety Information */}
                    <div className="safety-info">
                        <h4>🛡️ Safety Status</h4>
                        <div className="safety-stats">
                            <div className="safety-stat safe">
                                <span className="stat-number">{safeZones.length}</span>
                                <span className="stat-label">Safe Zones</span>
                            </div>
                            <div className="safety-stat warning">
                                <span className="stat-number">{dangerZones.length}</span>
                                <span className="stat-label">Warning Areas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TouristMap;
