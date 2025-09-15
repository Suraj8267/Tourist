// src/tourist/TouristLogin.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './tourist.css';

function TouristLogin() {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [touristData, setTouristData] = useState(null);
    const [manualId, setManualId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check for QR parameters on component mount
        const touristId = searchParams.get('tourist_id');
        const authHash = searchParams.get('auth_hash');
        const timestamp = searchParams.get('timestamp');

        if (touristId && authHash && timestamp) {
            authenticateWithQR(touristId, authHash, timestamp);
        }
    }, [searchParams]);

    const authenticateWithQR = async (touristId, authHash, timestamp) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/authenticate-qr/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tourist_id: touristId,
                    auth_hash: authHash,
                    timestamp: timestamp
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Authentication failed');
            }

            // Store tourist data
            localStorage.setItem('touristData', JSON.stringify(data));
            localStorage.setItem('touristId', data.tourist_id);
            
            setTouristData(data);
            
            // Redirect to tourist dashboard
            navigate('/tourist/dashboard');

        } catch (error) {
            console.error('QR Authentication error:', error);
            setError(error.message || 'QR Authentication failed. Please try manual login.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualLogin = async (e) => {
        e.preventDefault();
        if (!manualId.trim()) {
            setError('Please enter your Tourist ID');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:8000/tourist/${manualId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Tourist not found');
            }

            // Store tourist data
            localStorage.setItem('touristData', JSON.stringify(data));
            localStorage.setItem('touristId', data.tourist_id);
            
            navigate('/tourist/dashboard');

        } catch (error) {
            console.error('Manual login error:', error);
            setError(error.message || 'Login failed. Please check your Tourist ID.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="tourist-login-container">
            <div className="tourist-login-card">
                <div className="login-header">
                    <h1>🛡️ Tourist Safety Portal</h1>
                    <p>Secure Access to Your Digital Tourist ID</p>
                </div>

                {isLoading && (
                    <div className="loading-section">
                        <div className="loading-spinner"></div>
                        <p>Authenticating...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && (
                    <>
                        <div className="qr-status">
                            <div className="status-indicator">
                                <span className={searchParams.get('tourist_id') ? 'success' : 'warning'}></span>
                                {searchParams.get('tourist_id') ? 'QR Code Detected' : 'Manual Login Required'}
                            </div>
                        </div>

                        <div className="manual-login">
                            <h3>Manual Login</h3>
                            <form onSubmit={handleManualLogin}>
                                <div className="form-group">
                                    <label htmlFor="touristId">Tourist ID</label>
                                    <input
                                        type="text"
                                        id="touristId"
                                        placeholder="Enter your Tourist ID"
                                        value={manualId}
                                        onChange={(e) => setManualId(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="login-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                        </div>

                        <div className="help-section">
                            <p>📱 <strong>Using QR Code?</strong> Simply scan your QR code with any camera app</p>
                            <p>🆔 <strong>Don't have your QR?</strong> Enter your Tourist ID above</p>
                            <p>🆘 <strong>Need help?</strong> Contact tourist helpline: <a href="tel:1363">1363</a></p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default TouristLogin;
