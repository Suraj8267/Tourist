// src/tourist/TouristProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TouristNavbar from './navbar';

function TouristProfile() {
    const [touristData, setTouristData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedData = localStorage.getItem('touristData');
        if (!storedData) {
            navigate('/tourist-login');
            return;
        }
        setTouristData(JSON.parse(storedData));
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!touristData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="tourist-app">
            <TouristNavbar touristName={touristData.full_name?.split(' ')[0]} />
            
            <div className="dashboard-container">
                <main className="dashboard-main">
                    <section className="profile-section">
                        <h2>👤 Tourist Profile</h2>
                        
                        <div className="profile-card">
                            <div className="profile-header">
                                <div className="profile-avatar large">
                                    <span>{touristData.full_name?.charAt(0) || '👤'}</span>
                                </div>
                                <div className="profile-header-info">
                                    <h3>{touristData.full_name}</h3>
                                    <p className="profile-id">ID: {touristData.tourist_id}</p>
                                </div>
                            </div>
                            
                            <div className="profile-details">
                                <div className="profile-field">
                                    <span className="profile-field-label">Full Name</span>
                                    <span className="profile-field-value">{touristData.full_name}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">Nationality</span>
                                    <span className="profile-field-value">{touristData.nationality}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">ID Type</span>
                                    <span className="profile-field-value">{touristData.id_type}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">ID Number</span>
                                    <span className="profile-field-value">{touristData.id_number}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">Phone</span>
                                    <span className="profile-field-value">{touristData.phone}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">Destination</span>
                                    <span className="profile-field-value">{touristData.destination}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">Accommodation</span>
                                    <span className="profile-field-value">{touristData.accommodation}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">Check-in Date</span>
                                    <span className="profile-field-value">{formatDate(touristData.checkin_date)}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">Check-out Date</span>
                                    <span className="profile-field-value">{formatDate(touristData.checkout_date)}</span>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-label">Valid Until</span>
                                    <span className="profile-field-value">{formatDate(touristData.valid_until)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="emergency-contact-card">
                            <h3>🚨 Emergency Contact</h3>
                            <div className="contact-info">
                                <p><strong>Name:</strong> {touristData.emergency_contact_name}</p>
                                <p><strong>Phone:</strong> {touristData.emergency_contact_phone}</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default TouristProfile;
