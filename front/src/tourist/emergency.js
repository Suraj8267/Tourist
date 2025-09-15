// src/tourist/TouristEmergency.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TouristNavbar from './navbar';
import EmergencySOSSystem from '../components/EmergencySOSSystem';
import { useLocation } from './hooks/uselocation';
import './tourist.css';

function TouristEmergency() {
    const [touristData, setTouristData] = useState(null);
    const [isEmergencyActive, setIsEmergencyActive] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();

    const emergencyContacts = [
        { name: "Local Police", number: "100", type: "police", icon: "●" },
        { name: "Medical Emergency", number: "108", type: "medical", icon: "●" },
        { name: "Fire Department", number: "101", type: "fire", icon: "●" },
        { name: "Tourist Helpline", number: "1363", type: "tourist", icon: "●" }
    ];

    useEffect(() => {
        const storedData = localStorage.getItem('touristData');
        if (!storedData) {
            navigate('/tourist-login');
            return;
        }
        setTouristData(JSON.parse(storedData));
    }, [navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && isEmergencyActive) {
            // Trigger emergency alert
            sendEmergencyAlert();
        }
        return () => clearTimeout(timer);
    }, [countdown, isEmergencyActive]);

    const triggerSOS = () => {
        setIsEmergencyActive(true);
        setCountdown(5); // 5 second countdown
    };

    const cancelEmergency = () => {
        setIsEmergencyActive(false);
        setCountdown(0);
    };

    const sendEmergencyAlert = async () => {
        try {
            const response = await fetch('http://localhost:8000/sos-alert/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tourist_id: touristData.tourist_id,
                    message: `EMERGENCY ALERT: Tourist ${touristData.full_name} has triggered SOS`,
                    alert_type: 'sos'
                })
            });

            if (response.ok) {
                alert('Emergency alert sent to authorities!');
            }
        } catch (error) {
            console.error('Failed to send emergency alert:', error);
            alert('Failed to send alert. Please call emergency services directly.');
        } finally {
            setIsEmergencyActive(false);
            setCountdown(0);
        }
    };

    const callEmergencyNumber = (number) => {
        window.location.href = `tel:${number}`;
    };

    if (!touristData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading emergency services...</p>
            </div>
        );
    }

    return (
        <div className="tourist-app">
            <TouristNavbar touristName={touristData.full_name?.split(' ')[0]} />
            
            <div className="dashboard-container">
                <main className="dashboard-main">
                    <section className="emergency-section">
                        <div className="emergency-header">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <button
                                    onClick={() => navigate('/tourist/dashboard')}
                                    className="back-button"
                                    title="Back to Dashboard"
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
                                <h2>🚨 Emergency Services</h2>
                            </div>
                            <p>In case of emergency, use the SOS button or contact services directly</p>
                        </div>

                        {/* Enhanced SOS System with Real-time Location */}
                        <div className="sos-section">
                            <EmergencySOSSystem touristId={touristData.tourist_id} />
                        </div>

                        {/* Emergency Contacts */}
                        <div className="emergency-contacts">
                            <h3>📞 Emergency Contacts</h3>
                            <div className="contacts-grid">
                                {emergencyContacts.map((contact, index) => (
                                    <div 
                                        key={index} 
                                        className="contact-card"
                                        onClick={() => callEmergencyNumber(contact.number)}
                                    >
                                        <div className="contact-icon">{contact.icon}</div>
                                        <div className="contact-info">
                                            <h4>{contact.name}</h4>
                                            <p className="contact-number">{contact.number}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Personal Emergency Contact */}
                        <div className="personal-contact">
                            <h3>👨‍👩‍👧‍👦 Your Emergency Contact</h3>
                            <div className="contact-card personal">
                                <div className="contact-icon">●</div>
                                <div className="contact-info">
                                    <h4>{touristData.emergency_contact_name}</h4>
                                    <p className="contact-number">{touristData.emergency_contact_phone}</p>
                                    <button 
                                        className="btn-call"
                                        onClick={() => callEmergencyNumber(touristData.emergency_contact_phone)}
                                    >
                                        📞 Call Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Safety Tips */}
                        <div className="safety-tips">
                            <h3>💡 Safety Tips</h3>
                            <ul>
                                <li>Always inform someone about your whereabouts</li>
                                <li>Keep important numbers saved in your phone</li>
                                <li>Stay in well-lit, populated areas at night</li>
                                <li>Trust your instincts - if something feels wrong, leave</li>
                                <li>Keep copies of important documents</li>
                            </ul>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default TouristEmergency;
