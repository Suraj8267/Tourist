// src/tourist/components/TouristHeatMap.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Users, MapPin, TrendingUp, AlertCircle } from 'lucide-react';

const TouristHeatMap = () => {
    const [heatMapData, setHeatMapData] = useState([]);
    const [densityZones, setDensityZones] = useState([]);
    const [timeFilter, setTimeFilter] = useState('24h');
    const [viewMode, setViewMode] = useState('density'); // 'density', 'movement', 'safety'

    useEffect(() => {
        fetchHeatMapData();
    }, [timeFilter]);

    const fetchHeatMapData = async () => {
        try {
            // Fetch tourist locations for heatmap
            const response = await fetch('http://localhost:8000/police/locations/');
            const data = await response.json();

            // Create density zones based on tourist concentration
            const zones = calculateDensityZones(data);
            setDensityZones(zones);
            setHeatMapData(data);
        } catch (error) {
            console.error('Failed to fetch heat map data:', error);
        }
    };

    const calculateDensityZones = (tourists) => {
        // Group tourists by location proximity (simplified)
        const zones = [
            {
                id: 1,
                center: [28.6139, 77.2090], // Delhi
                radius: 5000,
                density: tourists.filter(t => 
                    Math.abs(t.lat - 28.6139) < 0.1 && Math.abs(t.lng - 77.2090) < 0.1
                ).length,
                area: 'Central Delhi'
            },
            {
                id: 2,
                center: [19.0760, 72.8777], // Mumbai
                radius: 4000,
                density: tourists.filter(t => 
                    Math.abs(t.lat - 19.0760) < 0.1 && Math.abs(t.lng - 72.8777) < 0.1
                ).length,
                area: 'Mumbai Central'
            },
            {
                id: 3,
                center: [15.2993, 74.1240], // Goa
                radius: 3000,
                density: tourists.filter(t => 
                    Math.abs(t.lat - 15.2993) < 0.1 && Math.abs(t.lng - 74.1240) < 0.1
                ).length,
                area: 'North Goa'
            },
            {
                id: 4,
                center: [30.1204, 78.2706], // Baghi
                radius: 2500,
                density: tourists.filter(t => 
                    Math.abs(t.lat - 30.1204) < 0.1 && Math.abs(t.lng - 78.2706) < 0.1
                ).length,
                area: 'Baghi Area'
            },
            {
                id: 5,
                center: [30.1464, 78.4322], // THDC Dam
                radius: 2000,
                density: tourists.filter(t => 
                    Math.abs(t.lat - 30.1464) < 0.1 && Math.abs(t.lng - 78.4322) < 0.1
                ).length,
                area: 'THDC Dam Area'
            }
        ];

        return zones.filter(zone => zone.density > 0);
    };

    const getDensityColor = (density) => {
        if (density >= 10) return '#dc2626'; // High density - Red
        if (density >= 5) return '#ea580c';  // Medium-high - Orange
        if (density >= 2) return '#facc15';  // Medium - Yellow
        return '#22c55e';                    // Low - Green
    };

    const getIntensityOpacity = (density) => {
        const maxDensity = Math.max(...densityZones.map(z => z.density), 1);
        return Math.max(0.2, (density / maxDensity) * 0.8);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <TrendingUp className="h-6 w-6 mr-2 text-blue-500" />
                        Tourist Density Heat Map
                    </h2>
                    <div className="flex items-center space-x-4">
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="density">Tourist Density</option>
                            <option value="movement">Movement Patterns</option>
                            <option value="safety">Safety Zones</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                {/* Stats Cards */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Total Tourists</p>
                                <p className="text-2xl font-bold text-blue-600">{heatMapData.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <MapPin className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">High Density Zones</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {densityZones.filter(z => z.density >= 5).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-8 w-8 text-orange-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Coverage Areas</p>
                                <p className="text-2xl font-bold text-orange-600">{densityZones.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Density Legend */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Density Scale</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                                <span className="text-xs text-gray-600">High (10+ tourists)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                                <span className="text-xs text-gray-600">Medium-High (5-9)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                                <span className="text-xs text-gray-600">Medium (2-4)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-xs text-gray-600">Low (1)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heat Map */}
                <div className="lg:col-span-3">
                    <div style={{ height: '500px' }}>
                        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full rounded-lg">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                            />

                            {/* Density Circles */}
                            {densityZones.map(zone => (
                                <Circle
                                    key={zone.id}
                                    center={zone.center}
                                    radius={zone.radius}
                                    color={getDensityColor(zone.density)}
                                    fillColor={getDensityColor(zone.density)}
                                    fillOpacity={getIntensityOpacity(zone.density)}
                                    weight={2}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <strong>{zone.area}</strong><br />
                                            <span>Density: {zone.density} tourists</span><br />
                                            <span>Radius: {(zone.radius / 1000).toFixed(1)}km</span>
                                        </div>
                                    </Popup>
                                </Circle>
                            ))}

                            {/* Individual Tourist Markers */}
                            {heatMapData.map((tourist, index) => (
                                <Marker
                                    key={index}
                                    position={[tourist.lat, tourist.lng]}
                                    icon={new L.Icon({
                                        iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${
                                            tourist.status === 'danger' ? 'red' :
                                            tourist.status === 'warning' ? 'yellow' : 'green'
                                        }.png`,
                                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                        iconSize: [15, 25],
                                        iconAnchor: [7, 25],
                                        popupAnchor: [1, -24],
                                        shadowSize: [25, 25]
                                    })}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <strong>{tourist.full_name}</strong><br />
                                            <span>Status: {tourist.status}</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>

            {/* Zone Analysis */}
            <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {densityZones.map(zone => (
                        <div key={zone.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{zone.area}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    zone.density >= 10 ? 'bg-red-100 text-red-800' :
                                    zone.density >= 5 ? 'bg-orange-100 text-orange-800' :
                                    zone.density >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {zone.density} tourists
                                </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>Coverage: {(zone.radius / 1000).toFixed(1)}km radius</p>
                                <p>Density: {zone.density > 0 ? 'Active' : 'Inactive'}</p>
                                <p>Status: {zone.density >= 10 ? 'High Traffic' : 
                                           zone.density >= 5 ? 'Moderate' : 'Low Activity'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TouristHeatMap;
