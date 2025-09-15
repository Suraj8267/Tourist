# 🛡️ Saathi - Tourist Safety System

## Smart India Hackathon (SIH) Project

A comprehensive tourist safety and monitoring system built with FastAPI backend and React frontend, featuring real-time location tracking, geofencing, and emergency response capabilities.

## 🌟 Features

### 🎯 Core Features
- **Digital Tourist ID Generation** with QR codes
- **Real-time Location Tracking** with geofencing
- **Safety Zone Monitoring** (Safe/Warning/Danger zones)
- **Emergency Response System** with instant alerts
- **Police Dashboard** for monitoring tourists
- **Route Optimization** with safety recommendations
- **Multi-language Support** (EN/Hindi)

### 🔐 Security Features
- **Blockchain-based ID verification**
- **Encrypted data storage**
- **Secure QR authentication**
- **Real-time WebSocket connections**

### 📱 Tourist Mobile App
- **Dashboard** with safety status
- **Interactive Maps** with multiple view options
- **Itinerary Management** with safety scores
- **Emergency Contacts** and SOS features
- **Profile Management**

### 👮 Police/Admin Dashboard
- **Real-time Tourist Monitoring**
- **Geofence Violation Alerts**
- **Emergency Response Management**
- **Analytics and Reports**

## 🏗️ Project Structure

```
SIH (Tourist App)/
├── 🐍 Backend (Python FastAPI)
│   ├── main.py                 # Main API server
│   ├── requirement.txt         # Python dependencies
│   └── tourist_safety.log      # Application logs
│
├── ⚛️ Frontend (React)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── App.js             # Tourist registration
│   │   ├── index.js           # Main routing
│   │   ├── login.js           # Admin login
│   │   ├── Dashboard.js       # Admin dashboard
│   │   ├── Reports.js         # Admin reports
│   │   ├── police/
│   │   │   └── police.js      # Police monitoring
│   │   └── tourist/
│   │       ├── login.js       # Tourist authentication
│   │       ├── dashboard.js   # Tourist main dashboard
│   │       ├── profile.js     # Tourist profile
│   │       ├── itinerary.js   # Trip itinerary
│   │       ├── emergency.js   # Emergency features
│   │       ├── TouristMap.js  # Leaflet map integration
│   │       ├── EnhancedMap.js # Alternative map views
│   │       ├── navbar.js      # Navigation component
│   │       ├── tourist.css    # Tourist app styles
│   │       └── hooks/
│   │           └── uselocation.js # Location tracking hook
│   └── package.json           # React dependencies
│
└── venv/                      # Python virtual environment
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL database
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd "SIH (Tourist App)"
```

2. **Create virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirement.txt
```

4. **Set up environment variables**
Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost/tourist_db
SECRET_KEY=your-secret-key-here
```

5. **Run the backend**
```bash
python main.py
```
Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd front
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```
Frontend will be available at `http://localhost:3000`

## 🗺️ Map Implementation Options

The project includes multiple map implementations:

### 1. **Leaflet Map (TouristMap.js)**
- Interactive map with markers and zones
- Real-time location tracking
- Geofencing visualization
- Route planning

### 2. **Enhanced Map (EnhancedMap.js)**
- Google Maps integration
- Static route overview
- Navigation assistance
- Multiple view options

### 3. **Alternative Options**
- **Standard View**: OpenStreetMap tiles
- **Satellite View**: Esri World Imagery
- **Dark Theme**: CartoDB dark tiles

## 🔧 API Endpoints

### Tourist Management
- `POST /register-tourist/` - Register new tourist
- `GET /tourist/{tourist_id}` - Get tourist details
- `POST /authenticate-qr/` - QR code authentication

### Location & Safety
- `POST /update-location/` - Update tourist location
- `POST /geofence/check/` - Check geofence violations
- `GET /geofence/zones/` - Get safety zones
- `POST /check-route-deviation/` - Check route deviation

### Admin & Police
- `POST /login` - Admin login
- `GET /tourists/` - Get all tourists
- `WebSocket /ws/police_dashboard` - Real-time updates

## 🛡️ Safety Features

### Geofencing System
- **Safe Zones**: Tourist-friendly areas with good infrastructure
- **Warning Zones**: Areas requiring extra caution
- **Danger Zones**: High-risk areas to avoid

### Real-time Monitoring
- Continuous location tracking
- Automatic safety score calculation
- Instant alerts for zone violations
- Emergency response coordination

### Emergency System
- One-tap SOS functionality
- Automatic emergency contact notification
- Police dashboard integration
- Real-time location sharing

## 🎨 UI/UX Features

### Modern Design
- Clean, intuitive interface
- Mobile-responsive design
- Dark/Light theme support
- Accessibility features

### User Experience
- Progressive web app capabilities
- Offline functionality
- Fast loading times
- Smooth animations

## 🔒 Security & Privacy

### Data Protection
- End-to-end encryption
- Secure data storage
- GDPR compliance
- Privacy controls

### Authentication
- Multi-factor authentication
- Secure session management
- Token-based authorization
- Audit logging

## 📊 Analytics & Reporting

### Tourist Analytics
- Travel pattern analysis
- Safety score trends
- Popular destinations
- Route optimization

### Police Dashboard
- Real-time monitoring
- Incident reporting
- Response time tracking
- Statistical analysis

## 🌐 Deployment

### Production Setup
1. **Backend Deployment**
   - Use production WSGI server (Gunicorn)
   - Configure PostgreSQL database
   - Set up SSL certificates
   - Configure environment variables

2. **Frontend Deployment**
   - Build production bundle: `npm run build`
   - Deploy to CDN or static hosting
   - Configure API endpoints
   - Set up domain and SSL

### Docker Support
```dockerfile
# Backend Dockerfile
FROM python:3.9
WORKDIR /app
COPY requirement.txt .
RUN pip install -r requirement.txt
COPY . .
CMD ["python", "main.py"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 License

This project is developed for Smart India Hackathon and is open source under MIT License.

## 🆘 Support

For support and queries:
- **Email**: support@saathi-tourist.gov.in
- **Helpline**: 1363 (Tourist Helpline)
- **Emergency**: 112

## 🏆 Team

Developed by Team Saathi for Smart India Hackathon 2024
- Focus: Tourist Safety and Security
- Technology: Full-stack web application
- Impact: Enhanced tourist experience and safety

---

**Made with ❤️ for Safe Tourism in India** 🇮🇳
