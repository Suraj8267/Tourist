// src/utils/api.js - Centralized API utilities
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Tourist API methods
    async registerTourist(formData) {
        return this.request('/register-tourist/', {
            method: 'POST',
            body: formData,
            headers: {}, // Remove Content-Type for FormData
        });
    }

    async authenticateQR(authData) {
        return this.request('/authenticate-qr/', {
            method: 'POST',
            body: JSON.stringify(authData),
        });
    }

    async getTourist(touristId) {
        return this.request(`/tourist/${touristId}`);
    }

    async updateLocation(locationData) {
        return this.request('/update-location/', {
            method: 'POST',
            body: JSON.stringify(locationData),
        });
    }

    async checkGeofence(checkData) {
        return this.request('/geofence/check/', {
            method: 'POST',
            body: JSON.stringify(checkData),
        });
    }

    async getGeofenceZones() {
        return this.request('/geofence/zones/');
    }

    async checkRouteDeviation(locationData) {
        return this.request('/check-route-deviation/', {
            method: 'POST',
            body: JSON.stringify(locationData),
        });
    }

    // Admin API methods
    async adminLogin(credentials) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getAllTourists() {
        return this.request('/tourists/');
    }

    async getSafetyScore(location) {
        return this.request(`/safety-scores/${location}`);
    }
}

export default new ApiService();
