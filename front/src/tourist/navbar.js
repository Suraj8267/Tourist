// src/tourist/TouristNavbar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function TouristNavbar({ touristName }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('touristData');
        localStorage.removeItem('touristId');
        navigate('/tourist-login');
    };

    const navItems = [
        { path: '/tourist/dashboard', icon: '🏠', label: 'Dashboard' },
        { path: '/tourist/profile', icon: '👤', label: 'Profile' },
        { path: '/tourist/itinerary', icon: '📍', label: 'Itinerary' },
        { path: '/tourist/emergency', icon: '🚨', label: 'Emergency' }
    ];

    return (
        <nav className="tourist-navbar">
            <div className="nav-brand">
                <span className="nav-logo">🛡️</span>
                <span className="nav-title">Tourist Safety</span>
                {touristName && <span className="nav-user">Welcome, {touristName}</span>}
            </div>

            <div className="nav-menu">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
                
                <button className="nav-item logout" onClick={handleLogout}>
                    <span className="nav-icon">🚪</span>
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </nav>
    );
}

export default TouristNavbar;
