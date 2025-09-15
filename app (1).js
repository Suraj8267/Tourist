// Tourist Safety App - JavaScript
class TouristSafetyApp {
    constructor() {
        this.currentScreen = 'dashboard';
        this.touristData = null;
        this.websocket = null;
        this.locationWatchId = null;
        this.currentPosition = null;
        this.emergencyCountdown = null;
        this.isAuthenticated = false;
        this.isInitialized = false;
        
        // API Base URL
        this.API_BASE = 'http://localhost:8000';
        this.WS_URL = 'ws://localhost:8000/ws/police_dashboard';
        
        // Sample tourist data for testing
        this.sampleTouristData = {
            tourist_id: "TOURIST_ABC12345",
            full_name: "John Doe",
            nationality: "Canada",
            id_type: "Passport",
            id_number: "AB1234567",
            phone: "+1234567890",
            emergency_contact_name: "Jane Doe",
            emergency_contact_phone: "+1234567891",
            destination: "Tokyo, Japan",
            checkin_date: "2024-09-15",
            checkout_date: "2024-09-22",
            accommodation: "Tokyo Grand Hotel",
            itinerary: [
                {
                    date: "2024-09-15",
                    location: "Tokyo",
                    activities: "Arrival and hotel check-in",
                    accommodation: "Tokyo Grand Hotel"
                },
                {
                    date: "2024-09-16",
                    location: "Shibuya",
                    activities: "Shibuya Crossing, shopping",
                    accommodation: "Tokyo Grand Hotel"
                },
                {
                    date: "2024-09-17",
                    location: "Asakusa",
                    activities: "Senso-ji Temple visit",
                    accommodation: "Tokyo Grand Hotel"
                }
            ]
        };
        
        // Sample data from backend
        this.emergencyContacts = [
            { name: "Local Police", number: "110", type: "police" },
            { name: "Medical Emergency", number: "119", type: "medical" },
            { name: "Tourist Hotline", number: "050-3816-2787", type: "tourist" },
            { name: "Canadian Embassy", number: "+81-3-5412-6200", type: "embassy" }
        ];
        
        this.alerts = [
            {
                id: 1,
                type: 'info',
                title: 'Weather Update',
                message: 'Clear skies expected for the next 3 days. Perfect for outdoor activities!',
                time: '2 hours ago'
            },
            {
                id: 2,
                type: 'warning',
                title: 'Area Advisory',
                message: 'Construction work near Shibuya Station. Consider alternative routes.',
                time: '5 hours ago'
            }
        ];
    }
    
    async init() {
        try {
            console.log('Initializing Tourist Safety App...');
            
            // Setup event listeners first
            this.setupEventListeners();
            
            // Check for QR authentication
            await this.checkQRAuthentication();
            
            // Initialize geolocation
            this.initGeolocation();
            
            // Setup WebSocket connection (simulated)
            this.initWebSocket();
            
            // Update status bar
            this.updateStatusBar();
            
            this.isInitialized = true;
            console.log('App initialization complete');
            
            // Transition to appropriate screen
            setTimeout(() => {
                this.hideLoadingScreen();
                if (this.isAuthenticated) {
                    this.showApp();
                } else {
                    this.showLoginScreen();
                }
            }, 1500); // Give a moment for loading animation
            
        } catch (error) {
            console.error('Initialization error:', error);
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showLoginScreen();
            }, 1500);
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            console.log('Loading screen hidden');
        }
    }
    
    async checkQRAuthentication() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const touristId = urlParams.get('tourist_id');
            const authHash = urlParams.get('auth_hash');
            
            if (touristId && authHash) {
                console.log('QR Authentication detected:', touristId);
                await this.authenticateWithQR(touristId, authHash);
            }
        } catch (error) {
            console.error('QR Authentication failed:', error);
        }
    }
    
    async authenticateWithQR(touristId, authHash) {
        try {
            // Simulate successful authentication with sample data
            this.touristData = this.sampleTouristData;
            this.isAuthenticated = true;
            this.populateAppData();
            console.log('QR Authentication successful');
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    }
    
    async manualLogin(touristId) {
        if (!touristId) {
            this.showToast('Please enter a valid Tourist ID', 'error');
            return;
        }
        
        try {
            // For demo purposes, accept the sample tourist ID
            if (touristId === 'TOURIST_ABC12345' || touristId === this.sampleTouristData.tourist_id) {
                this.touristData = this.sampleTouristData;
                this.isAuthenticated = true;
                this.showToast('Login successful!', 'success');
                this.populateAppData();
                this.showApp();
            } else {
                throw new Error('Invalid Tourist ID');
            }
        } catch (error) {
            this.showToast('Login failed. Use TOURIST_ABC12345 for demo.', 'error');
        }
    }
    
    populateAppData() {
        if (!this.touristData) return;
        
        try {
            // Update header
            const touristNameEl = document.getElementById('tourist-name');
            if (touristNameEl) {
                touristNameEl.textContent = this.touristData.full_name || 'Tourist';
            }
            
            // Update profile details
            this.updateProfileScreen();
            
            // Update itinerary
            this.updateItineraryScreen();
            
            // Update emergency contacts
            this.updateEmergencyContacts();
            
            // Update alerts
            this.updateAlerts();
            
            console.log('App data populated successfully');
        } catch (error) {
            console.error('Error populating app data:', error);
        }
    }
    
    updateProfileScreen() {
        const profileDetails = document.getElementById('profile-details');
        if (!this.touristData || !profileDetails) return;
        
        const fields = [
            { label: 'Tourist ID', value: this.touristData.tourist_id },
            { label: 'Full Name', value: this.touristData.full_name },
            { label: 'Nationality', value: this.touristData.nationality },
            { label: 'ID Type', value: this.touristData.id_type },
            { label: 'ID Number', value: this.touristData.id_number },
            { label: 'Phone', value: this.touristData.phone },
            { label: 'Destination', value: this.touristData.destination },
            { label: 'Check-in', value: this.formatDate(this.touristData.checkin_date) },
            { label: 'Check-out', value: this.formatDate(this.touristData.checkout_date) },
            { label: 'Accommodation', value: this.touristData.accommodation }
        ];
        
        profileDetails.innerHTML = fields.map(field => `
            <div class="profile-field">
                <span class="profile-field-label">${field.label}</span>
                <span class="profile-field-value">${field.value || 'N/A'}</span>
            </div>
        `).join('');
    }
    
    updateItineraryScreen() {
        const itineraryList = document.getElementById('itinerary-list');
        if (!this.touristData || !this.touristData.itinerary || !itineraryList) return;
        
        itineraryList.innerHTML = this.touristData.itinerary.map(item => `
            <div class="itinerary-item">
                <div class="itinerary-date">${this.formatDate(item.date)}</div>
                <div class="itinerary-location">📍 ${item.location}</div>
                <div class="itinerary-activities">🎯 ${item.activities}</div>
                <div class="itinerary-accommodation">🏨 ${item.accommodation}</div>
            </div>
        `).join('');
    }
    
    updateEmergencyContacts() {
        const contactList = document.getElementById('emergency-contact-list');
        if (!contactList) return;
        
        contactList.innerHTML = this.emergencyContacts.map(contact => `
            <div class="contact-item" onclick="app.callEmergencyNumber('${contact.number}')">
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <div class="contact-number">${contact.number}</div>
                </div>
                <div class="contact-type">${contact.type}</div>
            </div>
        `).join('');
    }
    
    updateAlerts() {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;
        
        if (this.alerts.length === 0) {
            alertsList.innerHTML = `
                <div class="alert-item info">
                    <div class="alert-header">
                        <h3 class="alert-title">No new alerts</h3>
                    </div>
                    <p class="alert-message">You're all caught up! Check back later for updates.</p>
                </div>
            `;
        } else {
            alertsList.innerHTML = this.alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                    <div class="alert-header">
                        <h3 class="alert-title">${alert.title}</h3>
                        <span class="alert-time">${alert.time}</span>
                    </div>
                    <p class="alert-message">${alert.message}</p>
                </div>
            `).join('');
        }
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Use a more reliable way to attach listeners
        setTimeout(() => {
            this.attachEventListeners();
        }, 100);
    }
    
    attachEventListeners() {
        try {
            console.log('Attaching event listeners...');
            
            // Bottom navigation
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                const screen = item.getAttribute('data-screen');
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.navigateToScreen(screen);
                });
            });
            
            // Quick actions
            this.attachClickHandler('emergency-action', () => this.showEmergencyModal());
            this.attachClickHandler('location-action', () => this.navigateToScreen('map'));
            this.attachClickHandler('itinerary-action', () => this.navigateToScreen('profile'));
            this.attachClickHandler('contacts-action', () => this.navigateToScreen('emergency'));
            
            // Emergency buttons
            this.attachClickHandler('emergency-header-btn', () => this.showEmergencyModal());
            this.attachClickHandler('sos-btn', () => this.showEmergencyModal());
            
            // Modal controls - Critical fix
            this.attachClickHandler('close-emergency-modal', () => this.hideEmergencyModal());
            this.attachClickHandler('cancel-emergency', () => this.hideEmergencyModal());
            this.attachClickHandler('confirm-emergency', () => this.sendEmergencyAlert());
            
            // Login controls
            this.attachClickHandler('manual-toggle', () => this.toggleManualLogin());
            this.attachClickHandler('login-btn', () => this.handleManualLogin());
            
            // Settings toggles
            const locationTrackingToggle = document.getElementById('location-tracking-toggle');
            if (locationTrackingToggle) {
                locationTrackingToggle.addEventListener('change', (e) => {
                    this.updateLocationSharing(e.target.checked);
                });
            }
            
            const locationSharingToggle = document.getElementById('location-sharing-toggle');
            if (locationSharingToggle) {
                locationSharingToggle.addEventListener('change', (e) => {
                    this.updateLocationSharing(e.target.checked);
                });
            }
            
            // Other controls
            this.attachClickHandler('center-location', () => this.centerMapOnLocation());
            this.attachClickHandler('clear-alerts', () => this.clearAllAlerts());
            
            // Modal background click
            const emergencyModal = document.getElementById('emergency-modal');
            if (emergencyModal) {
                emergencyModal.addEventListener('click', (e) => {
                    if (e.target === emergencyModal) {
                        this.hideEmergencyModal();
                    }
                });
            }
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideEmergencyModal();
                }
            });
            
            console.log('Event listeners attached successfully');
        } catch (error) {
            console.error('Error attaching event listeners:', error);
        }
    }
    
    attachClickHandler(elementId, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handler();
            });
        }
    }
    
    navigateToScreen(screenName) {
        console.log('Navigating to screen:', screenName);
        
        try {
            // Update active navigation item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-screen') === screenName) {
                    item.classList.add('active');
                }
            });
            
            // Show/hide screen content
            document.querySelectorAll('.screen-content').forEach(screen => {
                screen.classList.remove('active');
            });
            
            const targetScreen = document.getElementById(`${screenName}-screen`);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.currentScreen = screenName;
            }
        } catch (error) {
            console.error('Error navigating to screen:', error);
        }
    }
    
    showLoginScreen() {
        console.log('Showing login screen');
        const loginScreen = document.getElementById('login-screen');
        const appContainer = document.getElementById('app-container');
        
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (appContainer) appContainer.classList.add('hidden');
    }
    
    showApp() {
        console.log('Showing main app');
        const loginScreen = document.getElementById('login-screen');
        const appContainer = document.getElementById('app-container');
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
    }
    
    toggleManualLogin() {
        const manualLogin = document.getElementById('manual-login');
        const manualToggle = document.getElementById('manual-toggle');
        
        if (manualLogin && manualToggle) {
            if (manualLogin.classList.contains('hidden')) {
                manualLogin.classList.remove('hidden');
                manualToggle.textContent = 'Use QR Code';
            } else {
                manualLogin.classList.add('hidden');
                manualToggle.textContent = 'Enter Tourist ID Manually';
            }
        }
    }
    
    handleManualLogin() {
        const touristIdEl = document.getElementById('tourist-id');
        const touristId = touristIdEl ? touristIdEl.value.trim() : '';
        this.manualLogin(touristId);
    }
    
    initGeolocation() {
        if ('geolocation' in navigator) {
            // Simulate location for demo
            this.currentPosition = {
                lat: 35.6762,
                lng: 139.6503,
                accuracy: 10,
                timestamp: new Date()
            };
            this.updateLocationDisplay();
        }
    }
    
    updateLocationDisplay() {
        const coordinatesEl = document.getElementById('coordinates');
        if (coordinatesEl && this.currentPosition) {
            coordinatesEl.textContent = `${this.currentPosition.lat.toFixed(6)}, ${this.currentPosition.lng.toFixed(6)}`;
        }
    }
    
    initWebSocket() {
        // Simulate WebSocket connection for demo
        console.log('WebSocket connection simulated');
        this.updateConnectionStatus(true);
    }
    
    updateConnectionStatus(isOnline) {
        const connectionDot = document.querySelector('.connection-dot');
        const networkIndicator = document.getElementById('network-indicator');
        
        if (connectionDot) {
            connectionDot.classList.toggle('online', isOnline);
        }
        
        if (networkIndicator) {
            networkIndicator.textContent = isOnline ? '📶 Online' : '📶 Offline';
        }
    }
    
    showEmergencyModal() {
        console.log('Showing emergency modal');
        const modal = document.getElementById('emergency-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Start countdown
            let countdown = 5;
            const countdownEl = document.getElementById('countdown-timer');
            
            if (this.emergencyCountdown) {
                clearInterval(this.emergencyCountdown);
            }
            
            this.emergencyCountdown = setInterval(() => {
                countdown--;
                if (countdownEl) {
                    countdownEl.textContent = countdown;
                }
                
                if (countdown <= 0) {
                    this.sendEmergencyAlert();
                }
            }, 1000);
        }
    }
    
    hideEmergencyModal() {
        console.log('Hiding emergency modal');
        const modal = document.getElementById('emergency-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        if (this.emergencyCountdown) {
            clearInterval(this.emergencyCountdown);
            this.emergencyCountdown = null;
        }
        
        // Reset countdown
        const countdownEl = document.getElementById('countdown-timer');
        if (countdownEl) {
            countdownEl.textContent = '5';
        }
    }
    
    async sendEmergencyAlert() {
        console.log('Sending emergency alert');
        this.hideEmergencyModal();
        
        try {
            this.showToast('Emergency alert sent successfully!', 'success');
            this.updateSafetyStatus('danger');
            
            // Add to local alerts
            this.addAlert({
                type: 'danger',
                title: 'Emergency Alert Sent',
                message: 'Your emergency alert has been sent to local authorities.',
                time: 'Just now'
            });
        } catch (error) {
            console.error('Error sending emergency alert:', error);
            this.showToast('Failed to send emergency alert', 'error');
        }
    }
    
    updateSafetyStatus(status) {
        const statusDot = document.getElementById('status-dot');
        const statusLabel = document.getElementById('status-label');
        
        if (statusDot) {
            statusDot.classList.remove('safe', 'warning', 'danger');
            statusDot.classList.add(status);
        }
        
        const statusLabels = {
            safe: 'Safe',
            warning: 'Warning',
            danger: 'Emergency'
        };
        
        if (statusLabel) {
            statusLabel.textContent = statusLabels[status] || 'Unknown';
        }
    }
    
    callEmergencyNumber(number) {
        window.location.href = `tel:${number}`;
        this.showToast(`Calling ${number}...`, 'info');
    }
    
    centerMapOnLocation() {
        this.showToast('Map centered on your location', 'info');
    }
    
    addAlert(alert) {
        alert.id = Date.now();
        this.alerts.unshift(alert);
        this.updateAlerts();
    }
    
    clearAllAlerts() {
        this.alerts = [];
        this.updateAlerts();
        this.showToast('All alerts cleared', 'info');
    }
    
    updateLocationSharing(enabled) {
        const message = enabled ? 'Location sharing enabled' : 'Location sharing disabled';
        this.showToast(message, enabled ? 'success' : 'info');
    }
    
    updateStatusBar() {
        const batteryEl = document.getElementById('battery-indicator');
        if (batteryEl) {
            batteryEl.textContent = '🔋 95%';
        }
        
        // Update timestamp periodically
        setInterval(() => {
            const lastUpdateEl = document.getElementById('last-update');
            if (lastUpdateEl) {
                lastUpdateEl.textContent = 'Just now';
            }
        }, 30000);
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.app = new TouristSafetyApp();
    window.app.init();
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.app) {
            console.log('Fallback app initialization...');
            window.app = new TouristSafetyApp();
            window.app.init();
        }
    });
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing app immediately...');
    window.app = new TouristSafetyApp();
    window.app.init();
}

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.app) {
        window.app.updateConnectionStatus(true);
        window.app.showToast('Back online', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.app) {
        window.app.updateConnectionStatus(false);
        window.app.showToast('You are offline', 'warning');
    }
});