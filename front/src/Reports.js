import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import './Reports.css';

function Reports() {
  const [touristsByNationality, setTouristsByNationality] = useState([]);
  const [touristsByMonth, setTouristsByMonth] = useState([]);
  const [destinationStats, setDestinationStats] = useState([]);
  const [statusOverview, setStatusOverview] = useState([]);
  const [totalTourists, setTotalTourists] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // For now, we'll use mock data since the backend endpoints might not be ready
    setTouristsByNationality([
      { nationality: 'USA', count: 5 },
      { nationality: 'UK', count: 3 },
      { nationality: 'Germany', count: 2 },
      { nationality: 'France', count: 4 },
      { nationality: 'Japan', count: 1 }
    ]);
    
    setTouristsByMonth([
      { month: 'Jan', count: 2 },
      { month: 'Feb', count: 3 },
      { month: 'Mar', count: 5 },
      { month: 'Apr', count: 4 },
      { month: 'May', count: 7 },
      { month: 'Jun', count: 6 }
    ]);
    
    setDestinationStats([
      { destination: 'Paris', count: 3 },
      { destination: 'London', count: 4 },
      { destination: 'Tokyo', count: 2 },
      { destination: 'New York', count: 5 },
      { destination: 'Rome', count: 1 }
    ]);
    
    setStatusOverview([
      { status: 'safe', count: 12 },
      { status: 'warning', count: 2 },
      { status: 'danger', count: 1 }
    ]);
    
    setTotalTourists(15);
    setLoading(false);
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Colors for charts that work well with the dashboard theme
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h1>Tourist Analytics & Reports</h1>
          <button onClick={handleBackToDashboard} className="back-btn">
            Back to Dashboard
          </button>
        </div>
        <div className="reports-content" style={{textAlign: 'center', color: 'white'}}>
          Loading analytics data...
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <header className="reports-header">
        <h1>Tourist Analytics & Reports</h1>
        <button onClick={handleBackToDashboard} className="back-btn">
          Back to Dashboard
        </button>
      </header>

      <div className="reports-content">
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Total Tourists</h3>
            <p className="stat-number">{totalTourists}</p>
          </div>
          <div className="stat-card">
            <h3>Nationalities</h3>
            <p className="stat-number">{touristsByNationality.length}</p>
          </div>
          <div className="stat-card">
            <h3>Destinations</h3>
            <p className="stat-number">{destinationStats.length}</p>
          </div>
          <div className="stat-card">
            <h3>Safe Status</h3>
            <p className="stat-number">{statusOverview.find(s => s.status === 'safe')?.count || 0}</p>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Tourists by Nationality</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={touristsByNationality}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nationality" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Monthly Registrations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={touristsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Destination Popularity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={destinationStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {destinationStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Tourist Status Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusOverview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="data-tables">
          <div className="data-table">
            <h3>Tourists by Nationality</h3>
            <table>
              <thead>
                <tr>
                  <th>Nationality</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {touristsByNationality.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nationality}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="data-table">
            <h3>Destination Statistics</h3>
            <table>
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {destinationStats.map((item, index) => (
                  <tr key={index}>
                    <td>{item.destination}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;