// src/tourist/TouristDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TouristNavbar from './navbar';
import { useLocation } from './hooks/uselocation';

function TouristDashboard() {
    const [touristData, setTouristData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [connectionStatus, setConnectionStatus] = useState('online');
    const navigate = useNavigate();

    // Location tracking
    const { location, error: locationError, isTracking } = useLocation(
        touristData?.tourist_id, 
        true // Enable tracking
    );

    useEffect(() => {
        // Get tourist data from localStorage
        const storedData = localStorage.getItem('touristData');
        if (!storedData) {
            navigate('/tourist-login');
            return;
        }
        
        setTouristData(JSON.parse(storedData));

        // Update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatLocation = (location) => {
        if (!location) return 'Getting location...';
        return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    };

    if (!touristData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="tourist-app">
            <TouristNavbar touristName={touristData.full_name?.split(' ')[0]} />
            
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="header-profile">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="back-button"
                            title="Back to Main Dashboard"
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                marginRight: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <ArrowLeft size={20} color="white" />
                        </button>
                        <div className="profile-avatar">
                            <span>{touristData.full_name?.charAt(0) || '👤'}</span>
                        </div>
                        <div className="profile-info">
                            <h2>{touristData.full_name}</h2>
                            <div className="safety-status">
                                <span className="status-dot safe"></span>
                                <span>Safe Status</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="header-actions">
                        <div className="location-status">
                            <span className={`location-dot ${isTracking ? 'active' : 'inactive'}`}></span>
                            <span>{isTracking ? 'Location Active' : 'Location Inactive'}</span>
                        </div>
                        <div className="connection-status">
                            <span className={`connection-dot ${connectionStatus}`}></span>
                            <span>Connected</span>
                        </div>
                        <button 
                            className="emergency-btn"
                            onClick={() => navigate('/tourist/emergency')}
                        >
                            🚨 Emergency
                        </button>
                    </div>
                </header>

                <main className="dashboard-main">
                    {/* Current Location Section */}
                    <section className="current-location">
                        <h3>📍 Current Location</h3>
                        <div className="location-card">
                            {locationError ? (
                                <div className="location-error">
                                    <span>❌</span>
                                    <p>Location Error: {locationError}</p>
                                    <small>Please enable location permissions</small>
                                </div>
                            ) : (
                                <div className="location-info">
                                    <div className="location-coordinates">
                                        <span className="coord-label">Coordinates:</span>
                                        <span className="coord-value">{formatLocation(location)}</span>
                                    </div>
                                    {location && (
                                        <div className="location-details">
                                            <p><strong>Accuracy:</strong> ±{Math.round(location.accuracy)}m</p>
                                            <p><strong>Last Update:</strong> {new Date(location.timestamp).toLocaleTimeString()}</p>
                                            <p><strong>Status:</strong> <span className="tracking-status">{isTracking ? '🟢 Active' : '🔴 Inactive'}</span></p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Digital ID Card */}
                    <section className="digital-id-card">
                        <h3>🆔 Your Digital Tourist ID</h3>
                        <div className="id-card">
                            <div className="id-card-header">
                                <span className="card-title">TOURIST SAFETY ID</span>
                                <span className="card-number">#{touristData.tourist_id}</span>
                            </div>
                            <div className="id-card-body">
                                <div className="id-info">
                                    <p><strong>Name:</strong> {touristData.full_name}</p>
                                    <p><strong>Nationality:</strong> {touristData.nationality}</p>
                                    <p><strong>Destination:</strong> {touristData.destination}</p>
                                    <p><strong>Valid Until:</strong> {formatDate(touristData.valid_until)}</p>
                                </div>
                                {touristData.qr_code_data && (
                                    <div className="id-qr">
                                        <img 
                                            src={touristData.qr_code_data} 
                                            alt="Tourist QR Code"
                                            style={{ width: '80px', height: '80px' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="quick-actions">
                        <h3>Quick Actions</h3>
                        <div className="actions-grid">
                            <button 
                                className="action-card location"
                                onClick={() => navigate('/tourist/profile')}
                            >
                                <span className="action-icon">📍</span>
                                <span className="action-text">My Profile</span>
                            </button>
                            
                            <button 
                                className="action-card itinerary"
                                onClick={() => navigate('/tourist/itinerary')}
                            >
                                <span className="action-icon">🗺️</span>
                                <span className="action-text">Itinerary</span>
                            </button>
                            
                            <button 
                                className="action-card emergency"
                                onClick={() => navigate('/tourist/emergency')}
                            >
                                <span className="action-icon">🚨</span>
                                <span className="action-text">Emergency</span>
                            </button>
                            
                            <button className="action-card contacts">
                                <span className="action-icon">📞</span>
                                <span className="action-text">Contacts</span>
                            </button>
                        </div>
                    </section>

                    {/* Trip Information */}
                    <section className="trip-info">
                        <h3>📅 Trip Information</h3>
                        <div className="trip-card">
                            <div className="trip-dates">
                                <div className="date-item">
                                    <span className="date-label">Check-in</span>
                                    <span className="date-value">{formatDate(touristData.checkin_date)}</span>
                                </div>
                                <div className="date-separator">→</div>
                                <div className="date-item">
                                    <span className="date-label">Check-out</span>
                                    <span className="date-value">{formatDate(touristData.checkout_date)}</span>
                                </div>
                            </div>
                            
                            <div className="trip-details">
                                <p><strong>🏨 Accommodation:</strong> {touristData.accommodation || 'Not specified'}</p>
                                <p><strong>🏃‍♂️ Emergency Contact:</strong> {touristData.emergency_contact_name} ({touristData.emergency_contact_phone})</p>
                            </div>
                        </div>
                    </section>

                    {/* Status Bar */}
                    <section className="status-bar">
                        <div className="status-item">
                            <span className="status-label">Current Time</span>
                            <span className="status-value">{currentTime.toLocaleTimeString()}</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Location Status</span>
                            <span className="status-value">{isTracking ? '📍 Tracking' : '❌ Inactive'}</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Safety Level</span>
                            <span className="status-value">🟢 Safe</span>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default TouristDashboard;
