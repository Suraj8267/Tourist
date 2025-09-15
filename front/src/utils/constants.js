// src/utils/constants.js - Application constants
export const API_ENDPOINTS = {
    REGISTER_TOURIST: '/register-tourist/',
    AUTHENTICATE_QR: '/authenticate-qr/',
    GET_TOURIST: '/tourist/',
    UPDATE_LOCATION: '/update-location/',
    GEOFENCE_CHECK: '/geofence/check/',
    GEOFENCE_ZONES: '/geofence/zones/',
    ROUTE_DEVIATION: '/check-route-deviation/',
    ADMIN_LOGIN: '/login',
    GET_ALL_TOURISTS: '/tourists/',
    SAFETY_SCORES: '/safety-scores/',
    WEBSOCKET_POLICE: '/ws/police_dashboard'
};

export const SAFETY_LEVELS = {
    SAFE: { min: 90, color: '#10b981', label: 'Safe' },
    WARNING: { min: 70, color: '#f59e0b', label: 'Caution' },
    DANGER: { min: 0, color: '#ef4444', label: 'Danger' }
};

export const MAP_STYLES = {
    STANDARD: {
        name: 'Standard',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors'
    },
    SATELLITE: {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri'
    },
    DARK: {
        name: 'Dark',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
};

export const LOCATION_COORDS = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Goa': [15.2993, 74.1240],
    'Rajasthan': [26.9124, 75.7873],
    'Kerala': [9.9312, 76.2673],
    'Kolkata': [22.5726, 88.3639],
    'Tokyo': [35.6762, 139.6503],
    'London': [51.5074, -0.1278],
    'Paris': [48.8566, 2.3522],
    'New York': [40.7128, -74.0060],
    'Bangkok': [13.7563, 100.5018],
    'Baghi': [30.1204, 78.2706],
    'THDC-Dam': [30.1464, 78.4322]
};

export const EMERGENCY_CONTACTS = {
    TOURIST_HELPLINE: '1363',
    POLICE: '100',
    AMBULANCE: '108',
    FIRE: '101',
    WOMEN_HELPLINE: '1091',
    DISASTER_MANAGEMENT: '108'
};

export const GEOFENCE_ZONES = {
    SAFE_ZONES: [
        {
            id: 'delhi_central',
            name: 'Central Delhi - Tourist Areas',
            center: [28.6139, 77.2090],
            radius: 2000,
            type: 'safe'
        },
        {
            id: 'mumbai_central',
            name: 'Mumbai Central Business District',
            center: [19.0760, 72.8777],
            radius: 2500,
            type: 'safe'
        },
        {
            id: 'goa_beaches',
            name: 'North Goa Beaches',
            center: [15.2993, 74.1240],
            radius: 3000,
            type: 'safe'
        }
    ],
    DANGER_ZONES: [
        {
            id: 'delhi_danger_1',
            name: 'High Crime Area - East Delhi',
            center: [28.6500, 77.3000],
            radius: 1000,
            type: 'danger'
        },
        {
            id: 'mumbai_warning_1',
            name: 'Industrial Zone - Mumbai',
            center: [19.0500, 72.9000],
            radius: 800,
            type: 'warning'
        }
    ]
};

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    REGISTER: '/register',
    POLICE: '/police',
    REPORTS: '/reports',
    TOURIST_LOGIN: '/tourist-login',
    TOURIST_DASHBOARD: '/tourist/dashboard',
    TOURIST_PROFILE: '/tourist/profile',
    TOURIST_ITINERARY: '/tourist/itinerary',
    TOURIST_EMERGENCY: '/tourist/emergency',
    TOURIST_MAP: '/tourist/map'
};
