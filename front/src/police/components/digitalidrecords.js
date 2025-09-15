// src/tourist/components/DigitalIDRecords.js
import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Eye, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const DigitalIDRecords = () => {
    const [tourists, setTourists] = useState([]);
    const [filteredTourists, setFilteredTourists] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTourist, setSelectedTourist] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTouristRecords();
    }, []);

    useEffect(() => {
        filterTourists();
    }, [tourists, searchTerm, statusFilter]);

    const fetchTouristRecords = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/tourists/');
            const data = await response.json();
            setTourists(data);
        } catch (error) {
            console.error('Failed to fetch tourist records:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTourists = () => {
        let filtered = tourists;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(tourist =>
                tourist.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tourist.tourist_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tourist.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(tourist => {
                const status = getVerificationStatus(tourist);
                return status === statusFilter;
            });
        }

        setFilteredTourists(filtered);
    };

    const getVerificationStatus = (tourist) => {
        // Check document verification status
        if (!tourist.documents || tourist.documents.length === 0) return 'pending';
        if (tourist.valid_until && new Date(tourist.valid_until) < new Date()) return 'expired';
        return 'verified';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'pending':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'expired':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleExportData = () => {
        const csvData = filteredTourists.map(tourist => ({
            'Tourist ID': tourist.tourist_id,
            'Name': tourist.full_name,
            'Nationality': tourist.nationality,
            'ID Type': tourist.id_type,
            'ID Number': tourist.id_number,
            'Phone': tourist.phone,
            'Destination': tourist.destination,
            'Check-in': tourist.checkin_date,
            'Check-out': tourist.checkout_date,
            'Status': getVerificationStatus(tourist),
            'Created': new Date(tourist.created_at).toLocaleDateString()
        }));

        const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(field => 
                typeof field === 'string' && field.includes(',') ? `"${field}"` : field
            ).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tourist_records_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Users className="h-6 w-6 mr-2 text-blue-500" />
                        Digital ID Records ({filteredTourists.length})
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tourists..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                        <button
                            onClick={handleExportData}
                            disabled={filteredTourists.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Verified</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {tourists.filter(t => getVerificationStatus(t) === 'verified').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {tourists.filter(t => getVerificationStatus(t) === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <XCircle className="h-8 w-8 text-red-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Expired</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {tourists.filter(t => getVerificationStatus(t) === 'expired').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Total Records</p>
                                <p className="text-2xl font-bold text-blue-600">{tourists.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading records...</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tourist</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTourists.map((tourist) => {
                                const status = getVerificationStatus(tourist);
                                return (
                                    <tr key={tourist.tourist_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{tourist.full_name}</div>
                                                <div className="text-sm text-gray-500">{tourist.tourist_id}</div>
                                                <div className="text-sm text-gray-500">{tourist.nationality}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{tourist.id_type}</div>
                                            <div className="text-sm text-gray-500">{tourist.id_number}</div>
                                            <div className="text-sm text-gray-500">{tourist.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{tourist.destination}</div>
                                            <div className="text-sm text-gray-500">
                                                {tourist.checkin_date} to {tourist.checkout_date}
                                            </div>
                                            <div className="text-sm text-gray-500">{tourist.accommodation}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                                {getStatusIcon(status)}
                                                <span className="ml-1">{status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tourist.valid_until ? 
                                                new Date(tourist.valid_until).toLocaleDateString() : 
                                                'N/A'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setSelectedTourist(tourist)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>View</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Tourist Detail Modal */}
            {selectedTourist && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full m-4 max-h-screen overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Digital ID Verification</h2>
                                <button
                                    onClick={() => setSelectedTourist(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                                            <p className="text-gray-900">{selectedTourist.full_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Tourist ID</label>
                                            <p className="font-mono text-gray-900">{selectedTourist.tourist_id}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nationality</label>
                                            <p className="text-gray-900">{selectedTourist.nationality}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">ID Type & Number</label>
                                            <p className="text-gray-900">{selectedTourist.id_type}: {selectedTourist.id_number}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Phone</label>
                                            <p className="text-gray-900">{selectedTourist.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Travel Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Destination</label>
                                            <p className="text-gray-900">{selectedTourist.destination}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Travel Period</label>
                                            <p className="text-gray-900">{selectedTourist.checkin_date} to {selectedTourist.checkout_date}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Accommodation</label>
                                            <p className="text-gray-900">{selectedTourist.accommodation}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                                            <p className="text-gray-900">{selectedTourist.emergency_contact_name}</p>
                                            <p className="text-gray-500">{selectedTourist.emergency_contact_phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            {selectedTourist.documents && selectedTourist.documents.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {selectedTourist.documents.map((doc, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                                        📄
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {doc.filename}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {doc.content_type} • {(doc.size / 1024).toFixed(1)}KB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* QR Code */}
                            {selectedTourist.qr_code_data && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital QR Code</h3>
                                    <div className="flex items-center space-x-4">
                                        <img 
                                            src={selectedTourist.qr_code_data} 
                                            alt="Tourist QR Code" 
                                            className="w-32 h-32 border border-gray-200 rounded"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                This QR code contains encrypted tourist information for secure verification.
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getVerificationStatus(selectedTourist))}`}>
                                                    {getStatusIcon(getVerificationStatus(selectedTourist))}
                                                    <span className="ml-1">{getVerificationStatus(selectedTourist)}</span>
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Valid until: {selectedTourist.valid_until ? 
                                                        new Date(selectedTourist.valid_until).toLocaleDateString() : 
                                                        'N/A'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalIDRecords;
