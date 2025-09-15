// src/tourist/hooks/useLocation.js - Enhanced with better error handling
import { useState, useEffect } from 'react';

export const useLocation = (touristId, trackingEnabled = true) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState('prompt');

    useEffect(() => {
        if (!trackingEnabled || !touristId) return;

        let watchId = null;
        
        const startTracking = () => {
            if ('geolocation' in navigator) {
                setIsTracking(true);
                
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const newLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            timestamp: new Date().toISOString()
                        };
                        
                        setLocation(newLocation);
                        setError(null);
                        
                        // Send to backend immediately for real-time tracking
                        sendLocationToBackend(touristId, newLocation);
                    },
                    (error) => {
                        console.error('Location error:', error);
                        setError(error.message);
                        setIsTracking(false);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 5000, // 5 seconds for more frequent updates
                        distanceFilter: 1 // Update when moved 1 meter
                    }
                );
            } else {
                setError('Geolocation not supported');
            }
        };

        // Send location to backend with WebSocket for real-time updates
        const sendLocationToBackend = async (tourist_id, locationData) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
                
                const response = await fetch('http://localhost:8000/update-location/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tourist_id: tourist_id,
                        lat: locationData.lat,
                        lng: locationData.lng,
                        accuracy: locationData.accuracy,
                        timestamp: locationData.timestamp
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('Location updated successfully:', result);
                
                // Also send via WebSocket for real-time updates
                if (window.ws && window.ws.readyState === WebSocket.OPEN) {
                    window.ws.send(JSON.stringify({
                        type: 'location_update',
                        tourist_id: tourist_id,
                        lat: locationData.lat,
                        lng: locationData.lng,
                        accuracy: locationData.accuracy,
                        timestamp: locationData.timestamp
                    }));
                }
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error('Location update timeout');
                } else {
                    console.error('Location update error:', error);
                }
            }
        };

        startTracking();

        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                setIsTracking(false);
            }
        };
    }, [touristId, trackingEnabled]);

    return { location, error, isTracking };
};
