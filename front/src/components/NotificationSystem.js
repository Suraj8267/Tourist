// src/components/NotificationSystem.js - Real-time notification system
import React, { useState, useEffect } from 'react';

const NotificationSystem = ({ touristId }) => {
    const [notifications, setNotifications] = useState([]);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        if (!touristId) return;

        // Connect to WebSocket for real-time notifications
        const websocket = new WebSocket(`ws://localhost:8000/ws/tourist/${touristId}`);
        
        websocket.onopen = () => {
            console.log('Notification WebSocket connected');
            setWs(websocket);
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            addNotification(data);
        };

        websocket.onclose = () => {
            console.log('Notification WebSocket disconnected');
            setWs(null);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            // Graceful error handling - don't spam console
            setTimeout(() => {
                fetch('http://localhost:8000/')
                    .catch(() => console.log('Backend unavailable, WebSocket will retry when available'));
            }, 3000);
        };

        return () => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.close();
            }
        };
    }, [touristId]);

    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date(),
            ...notification
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 notifications
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            removeNotification(newNotification.id);
        }, 10000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'danger': return '🚨';
            case 'warning': return '⚠️';
            case 'safe': return '✅';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'danger': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'safe': return '#10b981';
            case 'info': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="notification-system">
            {notifications.map((notification) => (
                <div 
                    key={notification.id}
                    className={`notification notification-${notification.type}`}
                    style={{ borderLeftColor: getNotificationColor(notification.type) }}
                >
                    <div className="notification-header">
                        <span className="notification-icon">
                            {getNotificationIcon(notification.type)}
                        </span>
                        <span className="notification-title">
                            {notification.title || 'Safety Alert'}
                        </span>
                        <button 
                            className="notification-close"
                            onClick={() => removeNotification(notification.id)}
                        >
                            ×
                        </button>
                    </div>
                    <div className="notification-body">
                        <p>{notification.message}</p>
                        {notification.location && (
                            <small>
                                📍 {notification.location.lat?.toFixed(4)}, {notification.location.lng?.toFixed(4)}
                            </small>
                        )}
                    </div>
                    <div className="notification-time">
                        {notification.timestamp.toLocaleTimeString()}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;
