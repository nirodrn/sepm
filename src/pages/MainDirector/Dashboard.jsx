import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CheckCircle, Clock, BarChart3, TrendingUp, Eye, CheckSquare, X } from 'lucide-react';
import { requestService } from '../../services/requestService';

const MainDirectorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [hoApprovedRequests, allRequests] = await Promise.all([
        requestService.getMaterialRequests({ status: 'ho_approved' }),
        requestService.getMaterialRequests()
      ]);

      const pendingMDApproval = hoApprovedRequests.length;
      const totalRequests = allRequests.length;
      const approvedToday = allRequests.filter(req => 
        req.status === 'md_approved' && 
        new Date(req.mdApprovedAt).toDateString() === new Date().toDateString()
      ).length;

      setStats([
        {
          name: 'Pending MD Approval',
          value: pendingMDApproval.toString(),
          change: 'Final approval required',
          changeType: 'neutral',
          icon: Clock,
          color: 'yellow'
        },
        {
          name: 'Approved Today',
          value: approvedToday.toString(),
          change: 'Decisions made',
          changeType: 'positive',
          icon: CheckCircle,
          color: 'green'
        },
        {
          name: 'Total Requests',
          value: totalRequests.toString(),
          change: 'This month',
          changeType: 'neutral',
          icon: BarChart3,
          color: 'blue'
        },
        {
          name: 'System Health',
          value: 'Excellent',
          change: 'All operations normal',
          changeType: 'positive',
          icon: TrendingUp,
          color: 'purple'
        }
      ]);

      setPendingApprovals(hoApprovedRequests);

      setRecentDecisions([
        { action: 'Approved material request', details: 'Chemical B - 200L', decision: 'approved', time: '1 hour ago' },
        { action: 'Rejected material request', details: 'Additive X - 50kg', decision: 'rejected', time: '3 hours ago' },
        { action: 'Approved product request', details: 'Product A - 1000 units', decision: 'approved', time: '5 hours ago' }
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMDApprove = async (requestId) => {
    const notes = prompt('Add approval notes (optional):');
    try {
      await requestService.mdApproveRequest(requestId, { notes: notes || 'Approved by MD' });
      await loadDashboardData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleMDReject = async (requestId) => {
    const reason = prompt('Please provide rejection reason:');
    if (reason) {
      try {
        await requestService.rejectRequest(requestId, { reason });
        await loadDashboardData();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <Crown className="h-8 w-8 mr-3 text-purple-600" />
          Main Director Dashboard
        </h1>
        <p className="text-gray-600">Strategic oversight and final approval authority.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Approvals Required</h3>
          <div className="space-y-4">
            {pendingApprovals.slice(0, 5).map((request, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.requestType === 'rawMaterial' ? 'Raw Material' : 'Product'} Request
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.items?.[0]?.materialName} - {request.items?.[0]?.quantity} {request.items?.[0]?.unit}
                    </p>
                    <p className="text-xs text-gray-400">
                      HO Approved: {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMDApprove(request.id)}
                      className="text-green-600 hover:text-green-800 p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                      title="MD Approve"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMDReject(request.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                      title="MD Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/approvals/requests/${request.id}`)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Decisions</h3>
          <div className="space-y-4">
            {recentDecisions.map((decision, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  decision.decision === 'approved' ? 'bg-green-100' :
                  decision.decision === 'rejected' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {decision.decision === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {decision.decision === 'rejected' && <X className="h-4 w-4 text-red-600" />}
                  {decision.decision === 'pending' && <Clock className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{decision.action}</p>
                  <p className="text-xs text-gray-500">{decision.details} • {decision.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => navigate('/approvals')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <CheckCircle className="h-5 w-5" />
          <span>View All Approvals</span>
        </button>
        <button 
          onClick={() => navigate('/reports')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <BarChart3 className="h-5 w-5" />
          <span>Strategic Reports</span>
        </button>
        <button 
          onClick={() => navigate('/reports/supplier-performance')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          <span>Supplier Analysis</span>
        </button>
      </div>
    </div>
  );
};

export default MainDirectorDashboard;