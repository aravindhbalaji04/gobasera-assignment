import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { 
  TrendingUp, 
  Building2, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Target
} from 'lucide-react';

interface FunnelAnalytics {
  started: number;
  docsUploaded: number;
  paymentInitiated: number;
  paid: number;
  submitted: number;
  approved: number;
  rejected: number;
  total: number;
}

interface StageData {
  name: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ComponentType<any>;
}

const SupportAnalytics: React.FC = () => {
  const { } = useAuthStore();
  const [analytics, setAnalytics] = useState<FunnelAnalytics>({
    started: 0,
    docsUploaded: 0,
    paymentInitiated: 0,
    paid: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Get fresh token for support user
      const testResponse = await fetch('http://localhost:3001/api/v1/auth/test-support-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+1234567890' })
      });

      if (!testResponse.ok) {
        throw new Error('Failed to get authentication token');
      }

      const testData = await testResponse.json();
      const freshToken = testData.accessToken;

      const response = await fetch(`http://localhost:3001/api/v1/support/analytics/funnel?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${freshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);



  // Prepare stage data for visualization
  const getStageData = (): StageData[] => [
    {
      name: 'Started',
      count: analytics.started,
      percentage: analytics.total > 0 ? (analytics.started / analytics.total) * 100 : 0,
      color: 'bg-blue-500',
      icon: Target
    },
    {
      name: 'Documents Uploaded',
      count: analytics.docsUploaded,
      percentage: analytics.total > 0 ? (analytics.docsUploaded / analytics.total) * 100 : 0,
      color: 'bg-purple-500',
      icon: FileText
    },
    {
      name: 'Payment Initiated',
      count: analytics.paymentInitiated,
      percentage: analytics.total > 0 ? (analytics.paymentInitiated / analytics.total) * 100 : 0,
      color: 'bg-orange-500',
      icon: CreditCard
    },
    {
      name: 'Payment Completed',
      count: analytics.paid,
      percentage: analytics.total > 0 ? (analytics.paid / analytics.total) * 100 : 0,
      color: 'bg-indigo-500',
      icon: CheckCircle
    },
    {
      name: 'Submitted',
      count: analytics.submitted,
      percentage: analytics.total > 0 ? (analytics.submitted / analytics.total) * 100 : 0,
      color: 'bg-yellow-500',
      icon: Clock
    },
    {
      name: 'Approved',
      count: analytics.approved,
      percentage: analytics.total > 0 ? (analytics.approved / analytics.total) * 100 : 0,
      color: 'bg-green-500',
      icon: CheckCircle
    },
    {
      name: 'Rejected',
      count: analytics.rejected,
      percentage: analytics.total > 0 ? (analytics.rejected / analytics.total) * 100 : 0,
      color: 'bg-red-500',
      icon: AlertCircle
    }
  ];

  // Get max count for chart scaling
  const maxCount = Math.max(...getStageData().map(stage => stage.count));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">Track registration funnel performance and conversion rates</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  timeRange === '7d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  timeRange === '30d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  timeRange === '90d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Last 90 days
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Registrations</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.total}</p>
                <p className="text-sm text-gray-500">All time</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approval Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.total > 0 ? ((analytics.approved / analytics.total) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-gray-500">Success rate</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Payment Conversion</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.paymentInitiated > 0 ? ((analytics.paid / analytics.paymentInitiated) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-gray-500">Payment success</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Pipeline</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.started + analytics.docsUploaded + analytics.paymentInitiated + analytics.submitted}
                </p>
                <p className="text-sm text-gray-500">In progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Funnel Overview</h3>
            <div className="space-y-4">
              {getStageData().map((stage) => (
                <div key={stage.name} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-32">
                    <stage.icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{stage.count} registrations</span>
                      <span className="text-sm font-medium text-gray-900">{stage.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${stage.color}`}
                        style={{ width: `${(stage.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stage Breakdown</h3>
            <div className="space-y-4">
              {getStageData().map((stage) => (
                <div key={stage.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{stage.count}</div>
                    <div className="text-sm text-gray-500">{stage.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.started > 0 ? ((analytics.docsUploaded / analytics.started) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-blue-600 font-medium">Started → Documents</div>
              <div className="text-xs text-blue-500 mt-1">
                {analytics.docsUploaded} of {analytics.started} moved forward
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.docsUploaded > 0 ? ((analytics.paymentInitiated / analytics.docsUploaded) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-purple-600 font-medium">Documents → Payment</div>
              <div className="text-xs text-purple-500 mt-1">
                {analytics.paymentInitiated} of {analytics.docsUploaded} moved forward
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.paid > 0 ? ((analytics.approved / analytics.paid) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-green-600 font-medium">Payment → Approved</div>
              <div className="text-xs text-green-500 mt-1">
                {analytics.approved} of {analytics.paid} approved
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Bottlenecks</h4>
              <div className="space-y-2">
                {analytics.started > 0 && analytics.docsUploaded / analytics.started < 0.5 && (
                  <div className="flex items-center space-x-2 text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Low document upload rate - consider simplifying requirements</span>
                  </div>
                )}
                {analytics.docsUploaded > 0 && analytics.paymentInitiated / analytics.docsUploaded < 0.5 && (
                  <div className="flex items-center space-x-2 text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Payment initiation drop-off - review payment flow</span>
                  </div>
                )}
                {analytics.paid > 0 && analytics.approved / analytics.paid < 0.5 && (
                  <div className="flex items-center space-x-2 text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Low approval rate - review approval criteria</span>
                  </div>
                )}
                {!analytics.started || analytics.docsUploaded / analytics.started >= 0.5 && 
                 analytics.paymentInitiated / analytics.docsUploaded >= 0.5 && 
                 analytics.approved / analytics.paid >= 0.5 && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>All conversion rates are healthy</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {analytics.total > 0 && (
                  <>
                    <div>• Total registrations: {analytics.total}</div>
                    <div>• Active in pipeline: {analytics.started + analytics.docsUploaded + analytics.paymentInitiated + analytics.submitted}</div>
                    <div>• Completed: {analytics.approved + analytics.rejected}</div>
                    <div>• Success rate: {analytics.total > 0 ? ((analytics.approved / analytics.total) * 100).toFixed(1) : 0}%</div>
                  </>
                )}
                {analytics.started > 0 && (
                  <div>• Document upload conversion: {((analytics.docsUploaded / analytics.started) * 100).toFixed(1)}%</div>
                )}
                {analytics.docsUploaded > 0 && (
                  <div>• Payment conversion: {((analytics.paymentInitiated / analytics.docsUploaded) * 100).toFixed(1)}%</div>
                )}
                {analytics.paid > 0 && (
                  <div>• Approval rate: {((analytics.approved / analytics.paid) * 100).toFixed(1)}%</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Loading analytics...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportAnalytics;
