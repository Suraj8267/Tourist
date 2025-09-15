// src/police/PoliceDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GooglePoliceMapWrapper from '../components/GooglePoliceMap';
import { Shield, AlertTriangle, Users, MapPin, Clock, Phone, Search, Filter, Eye, Navigation, Zap, TrendingUp, ArrowLeft } from 'lucide-react';
import TouristHeatMap from './components/TouristHeatMap';
import DigitalIDRecords from './components/digitalidrecords';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './police.css';

// Import Leaflet CSS properly
import 'leaflet/dist/leaflet.css';

// Fix leaflet default markers issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for Map with better URLs
const createCustomIcon = (color, size = [25, 41]) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: size,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const greenIcon = createCustomIcon('green');
const yellowIcon = createCustomIcon('yellow');  
const redIcon = createCustomIcon('red');
const emergencyIcon = createCustomIcon('red', [35, 51]);

const statusIconMap = {
    safe: '●',
    warning: '●',
    danger: '●'
};

// Default coordinates (Delhi, India)
const DEFAULT_CENTER = [28.6139, 77.2090];
const DEFAULT_ZOOM = 6;

// Custom Map Component that handles resizing
const ResizableMap = ({ center, zoom, children, className, isEmergency = false }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        // Force map to resize when component mounts or changes
        const timer = setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [isEmergency]);

    useEffect(() => {
        // Handle window resize
        const handleResize = () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className={className}
            ref={mapRef}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            attributionControl={true}
            zoomControl={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            dragging={true}
            animate={true}
            easeLinearity={0.35}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
                minZoom={2}
                subdomains={['a', 'b', 'c']}
                errorTileUrl="https://tile.openstreetmap.org/0/0/0.png"
                noWrap={false}
            />
            {children}
        </MapContainer>
    );
};

function PoliceDashboard() {
    const navigate = useNavigate();
    const [tourists, setTourists] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [selectedTourist, setSelectedTourist] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFullscreenMap, setIsFullscreenMap] = useState(false);
    const [emergencyFocus, setEmergencyFocus] = useState(null);
    const [geofenceZones, setGeofenceZones] = useState([]);
    const [stats, setStats] = useState({
        activeAlerts: 0,
        totalTourists: 0,
        highRiskTourists: 0,
        avgSafetyScore: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapKey, setMapKey] = useState(0); // Force map re-render

    const wsRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
        setupWebSocket();
        fetchGeofenceZones();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // Force map refresh when switching to full screen
    useEffect(() => {
        if (isFullscreenMap) {
            setMapKey(prev => prev + 1);
            // Force a small delay to ensure DOM is ready
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 150);
        }
    }, [isFullscreenMap]);

    // Helper function to validate coordinates
    const isValidCoordinate = (lat, lng) => {
        return lat !== undefined && lng !== undefined && 
               lat !== null && lng !== null && 
               !isNaN(lat) && !isNaN(lng) &&
               lat >= -90 && lat <= 90 && 
               lng >= -180 && lng <= 180;
    };

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/police/locations/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const touristData = {};
            data.forEach(tourist => {
                if (isValidCoordinate(tourist.lat, tourist.lng)) {
                    touristData[tourist.tourist_id] = {
                        id: tourist.tourist_id,
                        name: tourist.full_name || 'Unknown Tourist',
                        lat: parseFloat(tourist.lat),
                        lng: parseFloat(tourist.lng),
                        status: tourist.status || "safe",
                        safetyScore: getSafetyScoreFromStatus(tourist.status),
                        lastUpdate: new Date(),
                        zone: getZoneFromStatus(tourist.status),
                        nationality: "Unknown",
                    };
                }
            });

            setTourists(touristData);
            updateStats(touristData);
            console.log('Loaded tourist locations:', Object.keys(touristData).length);
        } catch (error) {
            console.error('Failed to fetch tourist locations:', error);
            setError('Failed to load tourist data. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGeofenceZones = async () => {
        try {
            const response = await fetch('http://localhost:8000/geofence/zones/');
            if (response.ok) {
                const data = await response.json();
                setGeofenceZones(data.zones || []);
            }
        } catch (error) {
            console.error('Failed to fetch geofence zones:', error);
        }
    };

    const setupWebSocket = () => {
        const connectWebSocket = () => {
            try {
                wsRef.current = new WebSocket("ws://localhost:8000/ws/police_dashboard");

                wsRef.current.onopen = () => {
                    console.log("Police WebSocket connected");
                    setError(null);
                };

                wsRef.current.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log('Real-time update received:', data);

                    if (data.type === 'location_update') {
                        handleRealTimeLocationUpdate(data);
                    } else if (data.type === 'emergency_alert') {
                        handleEmergencyAlert(data);
                    } else if (data.type === 'geofence_alert') {
                        handleGeofenceAlert(data);
                    }
                };

                wsRef.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setError('Real-time connection lost. Retrying...');
                    setTimeout(() => {
                        fetch('http://localhost:8000/')
                            .then(() => connectWebSocket())
                            .catch(() => console.log('Backend not available, skipping WebSocket reconnection'));
                    }, 5000);
                };

                wsRef.current.onclose = () => {
                    console.log('WebSocket connection closed. Attempting to reconnect...');
                    setTimeout(setupWebSocket, 3000);
                };
            } catch (error) {
                console.error("❌ Failed to create WebSocket connection:", error);
                setTimeout(setupWebSocket, 5000);
            }
        };

        connectWebSocket();
    };

    const handleWebSocketMessage = (data) => {
        switch (data.type) {
            case 'location_update':
                handleLocationUpdate(data);
                break;
            case 'alert':
            case 'geofence_alert':
            case 'route_deviation':
                handleNewAlert(data);
                break;
            case 'connection_status':
            case 'echo':
                console.log('🔗 Connection message:', data.message);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    };

    const handleLocationUpdate = (data) => {
        const { tourist_id, lat, lng, status, timestamp } = data;
        
        if (!isValidCoordinate(lat, lng)) {
            console.warn(`Invalid coordinates received for tourist ${tourist_id}:`, { lat, lng });
            return;
        }
        
        setTourists(prevTourists => {
            const updatedTourists = {
                ...prevTourists,
                [tourist_id]: {
                    ...prevTourists[tourist_id],
                    id: tourist_id,
                    name: prevTourists[tourist_id]?.name || 'Unknown Tourist',
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    status,
                    safetyScore: getSafetyScoreFromStatus(status),
                    lastUpdate: new Date(timestamp),
                    zone: getZoneFromStatus(status)
                }
            };
            updateStats(updatedTourists);
            return updatedTourists;
        });

        console.log(`📍 Updated location for ${tourist_id} - Status: ${status}`);
    };

    const handleNewAlert = (data) => {
        const alertId = `ALT-${Date.now()}`;
        const tourist = tourists[data.tourist_id];
        
        const alertLat = data.lat || tourist?.lat;
        const alertLng = data.lng || tourist?.lng;
        
        const newAlert = {
            id: alertId,
            type: data.type,
            tourist: tourist?.name || data.tourist_name || 'Unknown Tourist',
            touristId: data.tourist_id,
            location: data.location || `${alertLat?.toFixed(4)}, ${alertLng?.toFixed(4)}` || 'Unknown Location',
            coordinates: isValidCoordinate(alertLat, alertLng) ? 
                { lat: parseFloat(alertLat), lng: parseFloat(alertLng) } : 
                { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] },
            timestamp: new Date(data.timestamp || Date.now()),
            status: 'active',
            priority: getPriorityFromType(data.type),
            description: data.message || 'Alert received',
            violations: data.violations || [],
            alert_level: data.alert_level || 'medium'
        };

        setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
        
        if (data.type === 'alert' && data.message && data.message.includes('SOS')) {
            handleEmergencyAlert(newAlert);
        }

        console.log("🚨 New Alert received:", newAlert);
    };

    const handleEmergencyAlert = (alert) => {
        setEmergencyFocus(alert);
        setIsFullscreenMap(true);
        setActiveTab('map');
        
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showEmergencyNotification(alert);
                }
            });
        } else if (Notification.permission === 'granted') {
            showEmergencyNotification(alert);
        }
        
        playEmergencyAlert();
        startEmergencyMode();
    };

    const showEmergencyNotification = (alert) => {
        new Notification('🚨 EMERGENCY ALERT', {
            body: `${alert.tourist} has triggered SOS at ${alert.location}`,
            icon: '/emergency-icon.png',
            tag: `emergency-${alert.id}`,
            requireInteraction: true
        });
    };

    const playEmergencyAlert = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.5);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 2);
        } catch (error) {
            console.log('Could not play emergency alert sound:', error);
        }
    };

    const startEmergencyMode = () => {
        document.body.classList.add('emergency-mode');
        
        setTimeout(() => {
            document.body.classList.remove('emergency-mode');
            setEmergencyFocus(null);
        }, 300000);
    };

    const updateStats = (touristData) => {
        const touristArray = Object.values(touristData);
        const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
        const highRiskCount = touristArray.filter(t => t.status === 'danger').length;
        const avgSafety = touristArray.length > 0 
            ? Math.round(touristArray.reduce((sum, t) => sum + (t.safetyScore || 0), 0) / touristArray.length)
            : 0;

        setStats({
            activeAlerts: activeAlertsCount,
            totalTourists: touristArray.length,
            highRiskTourists: highRiskCount,
            avgSafetyScore: avgSafety
        });
    };

    const getSafetyScoreFromStatus = (status) => {
        switch (status) {
            case 'safe': return Math.floor(Math.random() * 20) + 80;
            case 'warning': return Math.floor(Math.random() * 20) + 60;
            case 'danger': return Math.floor(Math.random() * 30) + 30;
            default: return 75;
        }
    };

    const getZoneFromStatus = (status) => {
        switch (status) {
            case 'safe': return 'safe';
            case 'warning': return 'medium-risk';
            case 'danger': return 'high-risk';
            default: return 'unknown';
        }
    };

    const getPriorityFromType = (type) => {
        switch (type) {
            case 'alert':
            case 'geofence_alert': 
                return 'high';
            case 'route_deviation': 
                return 'medium';
            default: 
                return 'low';
        }
    };

    const getIconByStatus = (status) => {
        if (emergencyFocus && emergencyFocus.touristId === status) return emergencyIcon;
        if (status === 'safe') return greenIcon;
        if (status === 'warning') return yellowIcon;
        if (status === 'danger') return redIcon;
        return greenIcon;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-red-100 text-red-800 border-red-200';
            case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
            case 'danger': return 'bg-red-100 text-red-800 border-red-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'safe': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-l-red-500 bg-red-50 shadow-red-100';
            case 'medium': return 'border-l-yellow-500 bg-yellow-50 shadow-yellow-100';
            case 'low': return 'border-l-green-500 bg-green-50 shadow-green-100';
            default: return 'border-l-gray-300 bg-white shadow-gray-100';
        }
    };

    const handleGenerateEFIR = (alert) => {
        const efirData = {
            firNo: `${alert.id}/2025`,
            tourist: alert.tourist,
            touristId: alert.touristId,
            incident: alert.description,
            location: alert.location,
            time: alert.timestamp.toLocaleString(),
            coordinates: alert.coordinates,
            priority: alert.priority,
            status: 'Filed with local police station'
        };

        alert(`🚨 E-FIR Generated Successfully\n\nFIR No: ${efirData.firNo}\nTourist: ${efirData.tourist}\nIncident: ${efirData.incident}\nLocation: ${efirData.location}\nTime: ${efirData.time}\n\nStatus: ${efirData.status}`);
        
        setAlerts(prev => prev.map(a => 
            a.id === alert.id ? {...a, status: 'investigating'} : a
        ));
    };

    const handleDispatchUnit = (alert) => {
        alert(`🚔 Emergency Unit Dispatched\n\nUnit ID: EU-${Math.floor(Math.random() * 1000)}\nDestination: ${alert.location}\nETA: 8-12 minutes\n\nUnit has been notified and is en route.`);
        
        setAlerts(prev => prev.map(a => 
            a.id === alert.id ? {...a, status: 'investigating'} : a
        ));
    };

    const handleEmergencyCall = (alert) => {
        const tourist = tourists[alert.touristId];
        if (tourist) {
            alert(`📞 Emergency Call Initiated\n\nCalling: ${tourist.name}\nLocation: ${alert.location}\n\nEmergency services have been notified.`);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Command Center', icon: Shield },
        { id: 'map', label: 'Live Tracking', icon: MapPin },
        { id: 'heatmap', label: 'Heat Map', icon: TrendingUp },
        { id: 'tourists', label: 'Tourist Registry', icon: Users },
        { id: 'records', label: 'Digital IDs', icon: Eye },
        { id: 'zones', label: 'Safety Zones', icon: Navigation }
    ];

    const getMapCenter = () => {
        if (emergencyFocus && isValidCoordinate(emergencyFocus.coordinates?.lat, emergencyFocus.coordinates?.lng)) {
            return [emergencyFocus.coordinates.lat, emergencyFocus.coordinates.lng];
        }
        
        const touristArray = Object.values(tourists);
        if (touristArray.length > 0) {
            const validTourists = touristArray.filter(t => isValidCoordinate(t.lat, t.lng));
            if (validTourists.length > 0) {
                const avgLat = validTourists.reduce((sum, t) => sum + t.lat, 0) / validTourists.length;
                const avgLng = validTourists.reduce((sum, t) => sum + t.lng, 0) / validTourists.length;
                return [avgLat, avgLng];
            }
        }
        
        return DEFAULT_CENTER;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white">Loading Police Command Center...</h2>
                    <p className="text-blue-300 mt-2">Establishing secure connections</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
                    <p className="text-red-300 mb-4">{error}</p>
                    <button 
                        onClick={fetchInitialData}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            {/* Emergency Full Screen Map */}
            {isFullscreenMap && (
                <div className="fixed inset-0 z-50 bg-black" style={{ zIndex: 9999 }}>
                    <div className="h-full flex flex-col">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between shadow-lg">
                            <div className="flex items-center space-x-4">
                                <div className="animate-pulse">
                                    <AlertTriangle className="h-8 w-8 text-yellow-300" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-wide">🚨 EMERGENCY MODE ACTIVE</h2>
                                    {emergencyFocus && (
                                        <p className="text-red-100 text-sm">Tracking: {emergencyFocus.tourist} at {emergencyFocus.location}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsFullscreenMap(false);
                                    setEmergencyFocus(null);
                                    setMapKey(prev => prev + 1); // Force refresh
                                }}
                                className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                            >
                                Exit Emergency Mode
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute inset-0">
                                <ResizableMap
                                    key={`emergency-${mapKey}`}
                                    center={getMapCenter()}
                                    zoom={emergencyFocus ? 15 : DEFAULT_ZOOM}
                                    className="h-full w-full"
                                    isEmergency={true}
                                >
                                    {Object.values(tourists).map(tourist => {
                                        if (!isValidCoordinate(tourist.lat, tourist.lng)) return null;
                                        
                                        return (
                                            <Marker
                                                key={`emergency-${tourist.id}`}
                                                position={[tourist.lat, tourist.lng]}
                                                icon={getIconByStatus(tourist.status)}
                                            >
                                                <Popup>
                                                    <div className="text-center p-2">
                                                        <strong className="text-lg">{tourist.name}</strong><br />
                                                        <span className="text-sm text-gray-600">ID: {tourist.id}</span><br />
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(tourist.status)}`}>
                                                            {tourist.status.toUpperCase()} {statusIconMap[tourist.status]}
                                                        </span><br />
                                                        <span className="text-sm">Safety Score: <strong>{tourist.safetyScore}/100</strong></span><br />
                                                        <small className="text-gray-500">Last update: {tourist.lastUpdate.toLocaleTimeString()}</small>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    })}
                                </ResizableMap>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Normal Dashboard */}
            <div className="p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Professional Header */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
                        <div className="border-b border-white/10">
                            <div className="px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors duration-200 group"
                                            title="Back to Main Dashboard"
                                        >
                                            <ArrowLeft className="h-6 w-6 text-white group-hover:text-blue-300" />
                                        </button>
                                        <div className="bg-blue-500 p-3 rounded-xl">
                                            <Shield className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-white tracking-wide">
                                                Saathi Police Command Center
                                            </h1>
                                            <p className="text-blue-200 mt-1">Real-time Tourist Safety Monitoring System</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className={`flex items-center space-x-3 px-4 py-2 rounded-full ${
                                            Object.keys(tourists).length > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                        }`}>
                                            <div className={`w-3 h-3 rounded-full animate-pulse ${
                                                Object.keys(tourists).length > 0 ? 'bg-green-400' : 'bg-red-400'
                                            }`}></div>
                                            <span className="text-sm font-semibold">
                                                {Object.keys(tourists).length > 0 ? 'System Online' : 'System Offline'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsFullscreenMap(true);
                                                setActiveTab('map');
                                            }}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            <Eye className="h-5 w-5" />
                                            <span>Emergency Map</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Tab Navigation */}
                            <nav className="flex space-x-1 px-8 pb-0">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-4 px-6 border-b-3 font-semibold text-sm flex items-center space-x-3 transition-all duration-200 ${
                                                activeTab === tab.id
                                                    ? 'border-blue-400 text-blue-300 bg-blue-500/10'
                                                    : 'border-transparent text-blue-200 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Professional Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Active Alerts', value: stats.activeAlerts, color: 'red', icon: AlertTriangle, desc: 'Requiring immediate attention' },
                            { label: 'Total Tourists', value: stats.totalTourists, color: 'blue', icon: Users, desc: 'Currently being monitored' },
                            { label: 'High Risk', value: stats.highRiskTourists, color: 'orange', icon: Zap, desc: 'Tourists in danger zones' },
                            { label: 'Avg Safety Score', value: stats.avgSafetyScore, color: 'green', icon: Shield, desc: 'Overall safety rating' }
                        ].map((stat, index) => (
                            <div key={index} className={`bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-2xl shadow-xl p-6 text-white`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-${stat.color}-100 text-sm font-medium`}>{stat.label}</p>
                                        <p className="text-4xl font-bold mt-2">{stat.value}</p>
                                        <p className={`text-${stat.color}-100 text-xs mt-1`}>{stat.desc}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <stat.icon className="h-8 w-8" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'map' && (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/10">
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <div className="bg-blue-500 p-2 rounded-lg mr-3">
                                        <MapPin className="h-5 w-5 text-white" />
                                    </div>
                                    Live Tourist Tracking Map
                                </h2>
                            </div>
                            <div style={{ height: '600px', position: 'relative' }}>
                                <GooglePoliceMapWrapper
                                    center={emergencyFocus ? 
                                        { lat: emergencyFocus.coordinates.lat, lng: emergencyFocus.coordinates.lng } : 
                                        { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
                                    }
                                    zoom={emergencyFocus ? 16 : DEFAULT_ZOOM}
                                    tourists={tourists}
                                    alerts={alerts}
                                    emergencyFocus={emergencyFocus}
                                    className="police-map-view"
                                />
                            </div>

                            <div className="p-4 border-t border-white/10">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center text-white">
                                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                            <span>Safe ({Object.values(tourists).filter(t => t.status === 'safe').length})</span>
                                        </div>
                                        <div className="flex items-center text-white">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                            <span>Warning ({Object.values(tourists).filter(t => t.status === 'warning').length})</span>
                                        </div>
                                        <div className="flex items-center text-white">
                                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                            <span>Danger ({Object.values(tourists).filter(t => t.status === 'danger').length})</span>
                                        </div>
                                    </div>
                                    <span className="text-blue-200">Last updated: {new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other tab content remains the same... */}
                    {activeTab === 'overview' && (
                        <div className="text-center py-12">
                            <div className="text-white text-2xl">Overview content goes here...</div>
                        </div>
                    )}
                    
                    {activeTab === 'heatmap' && <TouristHeatMap />}
                    {activeTab === 'records' && <DigitalIDRecords />}

                </div>
            </div>
        </div>
    );
}

export default PoliceDashboard;
