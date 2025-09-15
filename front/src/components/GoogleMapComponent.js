// Google Maps Component for accurate location tracking
import React, { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const GoogleMapComponent = ({ 
    center, 
    zoom = 15, 
    markers = [], 
    onLocationUpdate,
    showCurrentLocation = true,
    className = "map-container"
}) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const markersRef = useRef([]);

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

    // Get current location with high accuracy
    useEffect(() => {
        if (showCurrentLocation && map) {
            if (navigator.geolocation) {
                const watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            accuracy: position.coords.accuracy
                        };
                        
                        setCurrentPosition(pos);
                        
                        // Add current location marker
                        if (currentPosition) {
                            new window.google.maps.Marker({
                                position: pos,
                                map: map,
                                title: 'Your Current Location',
                                icon: {
                                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#fff" stroke-width="2"/>
                                            <circle cx="12" cy="12" r="3" fill="#fff"/>
                                        </svg>
                                    `),
                                    scaledSize: new window.google.maps.Size(24, 24)
                                }
                            });
                        }
                        
                        if (onLocationUpdate) {
                            onLocationUpdate(pos);
                        }
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 5000
                    }
                );

                return () => navigator.geolocation.clearWatch(watchId);
            }
        }
    }, [map, showCurrentLocation, onLocationUpdate]);

    // Add markers
    useEffect(() => {
        if (map && markers.length > 0) {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            // Add new markers
            markers.forEach(markerData => {
                const marker = new window.google.maps.Marker({
                    position: { lat: markerData.lat, lng: markerData.lng },
                    map: map,
                    title: markerData.title || 'Location',
                    icon: markerData.icon || undefined
                });

                if (markerData.info) {
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: markerData.info
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(map, marker);
                    });
                }

                markersRef.current.push(marker);
            });
        }
    }, [map, markers]);

    return <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />;
};

const MapWrapper = (props) => {
    const render = (status) => {
        switch (status) {
            case Status.LOADING:
                return <div className="map-loading">Loading Google Maps...</div>;
            case Status.FAILURE:
                return <div className="map-error">Error loading Google Maps</div>;
            case Status.SUCCESS:
                return <GoogleMapComponent {...props} />;
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

export default MapWrapper;
