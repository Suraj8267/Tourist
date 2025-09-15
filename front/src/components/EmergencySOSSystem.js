// Enhanced Emergency SOS System with Real-time Location
import React, { useState, useEffect } from 'react';
import { useLocation } from '../tourist/hooks/uselocation';

const EmergencySOSSystem = ({ touristId }) => {
    const [isEmergency, setIsEmergency] = useState(false);
    const [emergencyId, setEmergencyId] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const { location, error, isTracking } = useLocation(touristId, true);

    // Initialize WebSocket connection for emergency alerts
    useEffect(() => {
        if (!window.emergencyWS) {
            window.emergencyWS = new WebSocket('ws://localhost:8000/ws/emergency');
            
            window.emergencyWS.onopen = () => {
                console.log('Emergency WebSocket connected');
            };
            
            window.emergencyWS.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Emergency response:', data);
            };
            
            window.emergencyWS.onerror = (error) => {
                console.error('Emergency WebSocket error:', error);
            };
        }

        return () => {
            if (window.emergencyWS) {
                window.emergencyWS.close();
                window.emergencyWS = null;
            }
        };
    }, []);

    const triggerEmergency = async () => {
        if (!location) {
            alert('Location not available. Please enable GPS and try again.');
            return;
        }

        setIsEmergency(true);
        setCountdown(5);

        // Start countdown
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    sendEmergencyAlert();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Allow cancellation during countdown
        setTimeout(() => {
            if (countdown > 0) {
                clearInterval(countdownInterval);
            }
        }, 5000);
    };

    const sendEmergencyAlert = async () => {
        try {
            const emergencyData = {
                tourist_id: touristId,
                lat: location.lat,
                lng: location.lng,
                accuracy: location.accuracy,
                timestamp: new Date().toISOString(),
                emergency_type: 'SOS',
                status: 'active'
            };

            // Send to backend
            const response = await fetch('http://localhost:8000/emergency-alert/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emergencyData)
            });

            if (response.ok) {
                const result = await response.json();
                setEmergencyId(result.emergency_id);

                // Send via WebSocket for real-time alerts
                if (window.emergencyWS && window.emergencyWS.readyState === WebSocket.OPEN) {
                    window.emergencyWS.send(JSON.stringify({
                        type: 'emergency_alert',
                        ...emergencyData,
                        emergency_id: result.emergency_id
                    }));
                }

                alert('Emergency alert sent! Help is on the way.');
            }
        } catch (error) {
            console.error('Emergency alert failed:', error);
            alert('Failed to send emergency alert. Please call emergency services directly.');
        }
    };

    const cancelEmergency = () => {
        setIsEmergency(false);
        setCountdown(0);
    };

    return (
        <div className="emergency-sos-system">
            {!isEmergency ? (
                <button 
                    className="sos-button"
                    onClick={triggerEmergency}
                    disabled={!location}
                >
                    <div className="sos-icon">●</div>
                    <span>EMERGENCY SOS</span>
                    {!location && <small>Waiting for GPS...</small>}
                </button>
            ) : (
                <div className="emergency-active">
                    <div className="countdown-display">
                        <h3>Emergency Alert in {countdown}s</h3>
                        <p>Location: {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}</p>
                        <p>Accuracy: ±{location?.accuracy}m</p>
                    </div>
                    {countdown > 0 && (
                        <button onClick={cancelEmergency} className="cancel-button">
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmergencySOSSystem;
