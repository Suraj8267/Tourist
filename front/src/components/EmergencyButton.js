// src/components/EmergencyButton.js - Quick emergency access component
import React, { useState } from 'react';

const EmergencyButton = ({ touristId, currentLocation }) => {
    const [isEmergencyActive, setIsEmergencyActive] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const triggerEmergency = () => {
        if (isEmergencyActive) return;

        // Start 5-second countdown
        setCountdown(5);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    activateEmergency();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const cancelEmergency = () => {
        setCountdown(0);
    };

    const activateEmergency = async () => {
        setIsEmergencyActive(true);
        
        try {
            // Send emergency alert to backend
            const response = await fetch('http://localhost:8000/emergency-alert/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tourist_id: touristId,
                    location: currentLocation,
                    alert_type: 'emergency',
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                // Show success message
                alert('🚨 Emergency alert sent! Help is on the way.');
                
                // Try to call emergency services
                if ('navigator' in window && 'vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
                
                // Auto-deactivate after 2 minutes
                setTimeout(() => {
                    setIsEmergencyActive(false);
                }, 120000);
            }
        } catch (error) {
            console.error('Emergency alert failed:', error);
            alert('⚠️ Emergency alert failed. Please call 112 directly.');
        }
    };

    if (countdown > 0) {
        return (
            <div className="emergency-countdown">
                <div className="countdown-circle">
                    <span className="countdown-number">{countdown}</span>
                </div>
                <p>Emergency alert in {countdown} seconds</p>
                <button 
                    className="cancel-emergency"
                    onClick={cancelEmergency}
                >
                    Cancel
                </button>
            </div>
        );
    }

    if (isEmergencyActive) {
        return (
            <div className="emergency-active">
                <div className="emergency-status">
                    <span className="emergency-icon pulsing">🚨</span>
                    <p>Emergency Alert Active</p>
                    <small>Help has been notified</small>
                </div>
                <div className="emergency-contacts">
                    <a href="tel:112" className="emergency-call">
                        📞 Call 112
                    </a>
                    <a href="tel:1363" className="emergency-call">
                        📞 Tourist Helpline
                    </a>
                </div>
            </div>
        );
    }

    return (
        <button 
            className="emergency-button"
            onClick={triggerEmergency}
            title="Hold for emergency alert"
        >
            <span className="emergency-icon">🚨</span>
            <span className="emergency-text">Emergency</span>
        </button>
    );
};

export default EmergencyButton;
