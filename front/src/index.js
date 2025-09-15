import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Login from './login';
import Dashboard from './Dashboard';
import PoliceDashboard from './police/police';
import Reports from './Reports';
import TouristLogin from './tourist/login';
import TouristDashboard from './tourist/dashboard';
import TouristProfile from './tourist/profile';
import TouristItinerary from './tourist/itinerary';
import TouristEmergency from './tourist/emergency';
import TouristMap from './tourist/TouristMap';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<App />} />
        <Route path="/police" element={<PoliceDashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/tourist-login" element={<TouristLogin />} />
        <Route path="/tourist/dashboard" element={<TouristDashboard />} />
        <Route path="/tourist/profile" element={<TouristProfile />} />
        <Route path="/tourist/itinerary" element={<TouristItinerary />} />
        <Route path="/tourist/emergency" element={<TouristEmergency />} />
        <Route path="/tourist/map" element={<TouristMap />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
