import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const navigateToTouristRegistration = () => {
    navigate('/register');
  };

  const navigateToPoliceDashboard = () => {
    navigate('/police');
  };

  const navigateToReports = () => {
    navigate('/reports');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Ministry of Tourism - Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, Administrator</h2>
          <p>Manage tourist registrations and monitor safety alerts</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={navigateToTouristRegistration}>
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h3>Tourist Registration</h3>
            <p>Register new tourists and generate ID cards</p>
          </div>

          <div className="dashboard-card" onClick={navigateToPoliceDashboard}>
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <h3>Police Dashboard</h3>
            <p>Monitor tourist locations and safety alerts</p>
          </div>

          <div className="dashboard-card" onClick={navigateToReports}>
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h3>Reports & Analytics</h3>
            <p>View tourist statistics and reports</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </div>
            <h3>System Settings</h3>
            <p>Configure system parameters and users</p>
          </div>
        </div>

        <div className="quick-stats">
          <h3>Quick Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Registered Tourists</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1</span>
              <span className="stat-label">Active Alerts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">System Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;