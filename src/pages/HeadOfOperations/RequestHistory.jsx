import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, Filter, Calendar, Eye, CheckCircle, X, Package, FileText } from 'lucide-react';
import { requestService } from '../../services/requestService';

const RequestHistory = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    loadRequestHistory();
  }, [dateRange]);

  const loadRequestHistory = async () => {
    try {
      setLoading(true);
      const [materialRequests, productRequests] = await Promise.all([
        requestService.getMaterialRequests(),
        requestService.getProductRequests()
      ]);

      // Combine and sort by date
      const allRequests = [
        ...materialRequests.map(req => ({ ...req, type: 'material' })),
        ...productRequests.map(req => ({ ...req, type: 'product' }))
      ].sort((a, b) => b.createdAt - a.createdAt);

      setRequests(allRequests);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ho_approved':
        return 'bg-blue-100 text-blue-800';
      case 'md_approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ho_approved':
      case 'md_approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.items?.[0]?.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || request.status === filterStatus;
    const matchesType = !filterType || request.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getRequestSummary = () => {
    const total = filteredRequests.length;
    const approved = filteredRequests.filter(r => ['ho_approved', 'md_approved', 'completed'].includes(r.status)).length;
    const rejected = filteredRequests.filter(r => r.status === 'rejected').length;
    const pending = filteredRequests.filter(r => r.status === 'pending').length;

    return { total, approved, rejected, pending };
  };

  const summary = getRequestSummary();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Clock className="h-8 w-8 mr-3 text-blue-600" />
          Request History
        </h1>
        <p className="text-gray-600">Track all material and product requests with approval timeline</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900">{summary.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{summary.rejected}</p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{summary.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="ho_approved">HO Approved</option>
                <option value="md_approved">MD Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="material">Material Requests</option>
                <option value="product">Product Requests</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Request List */}
        <div className="divide-y divide-gray-200">
          {filteredRequests.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    request.type === 'material' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {request.type === 'material' ? (
                      <Package className={`h-5 w-5 ${
                        request.type === 'material' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    ) : (
                      <FileText className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">
                        {request.type === 'material' 
                          ? request.items?.[0]?.materialName 
                          : request.productName || 'Product Request'}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status?.replace('_', ' ').toUpperCase()}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-1 text-sm text-gray-500">
                      <span>ID: {request.id}</span>
                      <span>
                        {request.type === 'material' 
                          ? `${request.items?.[0]?.quantity} ${request.items?.[0]?.unit}`
                          : `${request.quantity || 'N/A'} units`}
                      </span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.approvedAt && (
                        <span>HO Approved: {new Date(request.approvedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/approvals/${request.type}-requests/${request.id}`)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title="View Details"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus || filterType ? 'Try adjusting your search criteria.' : 'No requests in the selected time period.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestHistory;