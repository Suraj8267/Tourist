// Google Maps Component for Police Dashboard
import React, { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const GooglePoliceMap = ({ 
    center, 
    zoom = 12, 
    tourists = {},
    alerts = [],
    emergencyFocus = null,
    className = "police-map-container"
}) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const markersRef = useRef({});
    const alertMarkersRef = useRef([]);

    // Initialize map
    useEffect(() => {
        if (mapRef.current && !map) {
            const googleMap = new window.google.maps.Map(mapRef.current, {
                center: center || { lat: 28.6139, lng: 77.2090 },
                zoom: zoom,
                mapTypeId: 'roadmap',
                zoomControl: true,
                streetViewControl: false,
                fullscreenControl: true,
                mapTypeControl: true,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'on' }]
                    }
                ]
            });
            setMap(googleMap);
        }
    }, [center, zoom, map]);

    // Create marker icons
    const createTouristIcon = (status) => {
        let color = '#34A853'; // Green for safe
        if (status === 'warning') color = '#FBBC04'; // Yellow for warning
        if (status === 'danger') color = '#EA4335'; // Red for danger

        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="12" fill="${color}" stroke="#fff" stroke-width="2"/>
                    <circle cx="14" cy="14" r="6" fill="#fff"/>
                </svg>
            `)}`,
            scaledSize: { width: 28, height: 28 }
        };
    };

    const createEmergencyIcon = () => ({
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="16" fill="#EA4335" stroke="#fff" stroke-width="3"/>
                <path d="M18 8v8l6 6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
                <circle cx="18" cy="18" r="3" fill="#fff"/>
            </svg>
        `)}`,
        scaledSize: { width: 36, height: 36 }
    });

    // Update tourist markers
    useEffect(() => {
        if (map && Object.keys(tourists).length > 0) {
            // Clear existing tourist markers
            Object.values(markersRef.current).forEach(marker => marker.setMap(null));
            markersRef.current = {};

            // Add tourist markers
            Object.values(tourists).forEach(tourist => {
                if (tourist.lat && tourist.lng) {
                    const isEmergency = emergencyFocus && emergencyFocus.touristId === tourist.id;
                    const icon = isEmergency ? createEmergencyIcon() : createTouristIcon(tourist.status);
                    
                    const marker = new window.google.maps.Marker({
                        position: { lat: tourist.lat, lng: tourist.lng },
                        map: map,
                        title: tourist.name,
                        icon: icon,
                        animation: isEmergency ? window.google.maps.Animation.BOUNCE : null
                    });

                    const infoContent = `
                        <div style="padding: 10px; min-width: 200px;">
                            <h3 style="margin: 0 0 10px 0; color: #333;">${tourist.name}</h3>
                            <p style="margin: 5px 0;"><strong>ID:</strong> ${tourist.id}</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> 
                                <span style="color: ${tourist.status === 'safe' ? '#34A853' : tourist.status === 'warning' ? '#FBBC04' : '#EA4335'};">
                                    ${tourist.status.toUpperCase()}
                                </span>
                            </p>
                            <p style="margin: 5px 0;"><strong>Safety Score:</strong> ${tourist.safetyScore || 'N/A'}/100</p>
                            <p style="margin: 5px 0;"><strong>Last Update:</strong> ${tourist.lastUpdate ? new Date(tourist.lastUpdate).toLocaleTimeString() : 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Location:</strong> ${tourist.lat.toFixed(4)}, ${tourist.lng.toFixed(4)}</p>
                            ${isEmergency ? '<p style="color: #EA4335; font-weight: bold; margin-top: 10px;">🚨 EMERGENCY ALERT ACTIVE</p>' : ''}
                        </div>
                    `;

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: infoContent
                    });

                    marker.addListener('click', () => {
                        // Close other info windows
                        Object.values(markersRef.current).forEach(m => {
                            if (m.infoWindow) m.infoWindow.close();
                        });
                        infoWindow.open(map, marker);
                    });

                    marker.infoWindow = infoWindow;
                    markersRef.current[tourist.id] = marker;

                    // Auto-open info window for emergency
                    if (isEmergency) {
                        infoWindow.open(map, marker);
                        map.panTo({ lat: tourist.lat, lng: tourist.lng });
                        map.setZoom(16);
                    }
                }
            });
        }
    }, [map, tourists, emergencyFocus]);

    // Update alert markers
    useEffect(() => {
        if (map && alerts.length > 0) {
            // Clear existing alert markers
            alertMarkersRef.current.forEach(marker => marker.setMap(null));
            alertMarkersRef.current = [];

            // Add alert markers
            alerts.forEach(alert => {
                if (alert.coordinates && alert.coordinates.lat && alert.coordinates.lng) {
                    const alertIcon = {
                        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#FF6B6B" stroke="#fff" stroke-width="1"/>
                                <path d="M12 8v4M12 16h.01" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        `)}`,
                        scaledSize: { width: 24, height: 24 }
                    };

                    const marker = new window.google.maps.Marker({
                        position: { lat: alert.coordinates.lat, lng: alert.coordinates.lng },
                        map: map,
                        title: `Alert: ${alert.type}`,
                        icon: alertIcon
                    });

                    const alertInfo = `
                        <div style="padding: 10px; min-width: 200px;">
                            <h3 style="margin: 0 0 10px 0; color: #FF6B6B;">🚨 ${alert.type.toUpperCase()}</h3>
                            <p style="margin: 5px 0;"><strong>Tourist:</strong> ${alert.tourist}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
                            <p style="margin: 5px 0;"><strong>Priority:</strong> 
                                <span style="color: ${alert.priority === 'high' ? '#EA4335' : alert.priority === 'medium' ? '#FBBC04' : '#34A853'};">
                                    ${alert.priority.toUpperCase()}
                                </span>
                            </p>
                            <p style="margin: 5px 0;"><strong>Description:</strong> ${alert.description}</p>
                            <p style="margin: 5px 0;"><strong>Location:</strong> ${alert.coordinates.lat.toFixed(4)}, ${alert.coordinates.lng.toFixed(4)}</p>
                        </div>
                    `;

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: alertInfo
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(map, marker);
                    });

                    alertMarkersRef.current.push(marker);
                }
            });
        }
    }, [map, alerts]);

    return <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />;
};

const GooglePoliceMapWrapper = (props) => {
    const render = (status) => {
        switch (status) {
            case Status.LOADING:
                return <div className="map-loading">Loading Google Maps...</div>;
            case Status.FAILURE:
                return <div className="map-error">Error loading Google Maps</div>;
            case Status.SUCCESS:
                return <GooglePoliceMap {...props} />;
            default:
                return <div className="map-loading">Loading...</div>;
        }
    };

    return (
        <Wrapper 
            apiKey="AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw" // Replace with your actual API key
            render={render}
            libraries={['places']}
        />
    );
};

export default GooglePoliceMapWrapper;
