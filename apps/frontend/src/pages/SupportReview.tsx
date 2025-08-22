import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  FileText,
  CreditCard,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Registration {
  id: string;
  userId: string;
  societyId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  funnelStage: 'INITIATED' | 'DOCUMENTS_UPLOADED' | 'PAYMENT_PENDING' | 'PAYMENT_COMPLETED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt?: string;
  createdAt: string;
  user: {
    id: string;
    phone: string;
    role: string;
  };
  society?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  documents: Array<{
    id: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  payments: Array<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    paidAt?: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const SupportReview: React.FC = () => {
  const { } = useAuthStore();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch registrations
  const fetchRegistrations = async (page: number = 1) => {
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

      const response = await fetch(`http://localhost:3001/api/v1/support/registrations?status=pending&page=${page}&limit=${pagination.limit}`, {
        headers: {
          'Authorization': `Bearer ${freshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.registrations || []);
      setPagination(prev => ({
        ...prev,
        page,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0
      }));
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchRegistrations(newPage);
    }
  };

  // Handle row click to show details
  const handleRowClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  // Handle approve/reject action
  const handleAction = (type: 'approve' | 'reject') => {
    setActionType(type);
    setActionReason('');
    setShowActionModal(true);
  };

  // Submit approve/reject action
  const submitAction = async () => {
    if (!selectedRegistration || !actionType || !actionReason.trim()) return;

    try {
      setIsSubmitting(true);
      
      // Get fresh token
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

      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      const response = await fetch(`http://localhost:3001/api/v1/support/registrations/${selectedRegistration.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`
        },
        body: JSON.stringify({
          reason: actionReason,
          notes: actionReason
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${actionType} registration`);
      }

      // Refresh registrations and close modals
      fetchRegistrations(pagination.page);
      setShowDetailModal(false);
      setShowActionModal(false);
      setSelectedRegistration(null);
      setActionType(null);
      setActionReason('');
    } catch (error) {
      console.error(`Error ${actionType}ing registration:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get funnel stage badge color
  const getFunnelBadgeColor = (stage: string) => {
    switch (stage) {
      case 'INITIATED':
        return 'bg-blue-100 text-blue-800';
      case 'DOCUMENTS_UPLOADED':
        return 'bg-purple-100 text-purple-800';
      case 'PAYMENT_PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'PAYMENT_COMPLETED':
        return 'bg-indigo-100 text-indigo-800';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
          <p className="mt-2 text-gray-600">Review and manage pending society registrations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Documents Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {registrations.filter(r => r.funnelStage === 'INITIATED').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Payment Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {registrations.filter(r => r.funnelStage === 'PAYMENT_PENDING').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Under Review</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {registrations.filter(r => r.funnelStage === 'UNDER_REVIEW').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Registrations</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Society
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Loading registrations...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No pending registrations found
                    </td>
                  </tr>
                ) : (
                  registrations.map((registration) => (
                    <tr 
                      key={registration.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(registration)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {registration.society?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {registration.society?.city}, {registration.society?.state}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {registration.user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(registration.status)}`}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFunnelBadgeColor(registration.funnelStage)}`}>
                          {registration.funnelStage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {registration.submittedAt ? formatDate(registration.submittedAt) : 'Not submitted'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRegistration(registration);
                              handleAction('approve');
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRegistration(registration);
                              handleAction('reject');
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Registration Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Society Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Society Information</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  {selectedRegistration.society ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {selectedRegistration.society.name}
                      </div>
                      <div>
                        <span className="font-medium">Address:</span> {selectedRegistration.society.address}
                      </div>
                      <div>
                        <span className="font-medium">City:</span> {selectedRegistration.society.city}
                      </div>
                      <div>
                        <span className="font-medium">State:</span> {selectedRegistration.society.state}
                      </div>
                      <div>
                        <span className="font-medium">Pincode:</span> {selectedRegistration.society.pincode}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Society information not available</p>
                  )}
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Owner Information</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm">
                    <span className="font-medium">Phone:</span> {selectedRegistration.user.phone}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Documents</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  {selectedRegistration.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRegistration.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between text-sm">
                          <span>{doc.type}</span>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No documents uploaded</p>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Payment Status</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  {selectedRegistration.payments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRegistration.payments.map((payment) => (
                        <div key={payment.id} className="text-sm">
                          <span className="font-medium">Status:</span> {payment.status} | 
                          <span className="font-medium ml-2">Amount:</span> ₹{payment.amount} {payment.currency}
                          {payment.paidAt && (
                            <span className="ml-2 text-gray-500">
                              (Paid: {formatDate(payment.paidAt)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No payment information available</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleAction('approve')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedRegistration && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Registration
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {actionType === 'approve' 
                  ? 'This will approve the society registration and move it to the next stage.'
                  : 'Please provide a reason for rejecting this registration.'
                }
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'approve' ? 'Notes (Optional)' : 'Reason *'}
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={actionType === 'approve' ? 'Add any notes...' : 'Enter rejection reason...'}
                required={actionType === 'reject'}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={isSubmitting || (actionType === 'reject' && !actionReason.trim())}
                className={`flex-1 px-4 py-2 rounded-md text-white ${
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportReview;
