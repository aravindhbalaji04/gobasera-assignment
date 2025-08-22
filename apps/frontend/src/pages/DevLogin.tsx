import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Building2, User, Shield } from 'lucide-react';

const DevLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuthStore();

  const handleDevLogin = async (role: 'SUPPORT' | 'COMMITTEE' | 'OWNER') => {
    try {
      // Get a real JWT token from backend based on role
      const phoneMap = {
        'SUPPORT': '+1234567890',
        'COMMITTEE': '+1234567891', 
        'OWNER': '+1234567892'
      };

      const tokenEndpoint = role === 'SUPPORT' ? 'test-support-token' : 'test-token';
      
      const response = await fetch(`http://localhost:3001/api/v1/auth/${tokenEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phoneMap[role]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get dev token');
      }

      const { accessToken, user } = await response.json();

      // Store real token and user data
      localStorage.setItem('devUser', JSON.stringify(user));
      localStorage.setItem('authToken', accessToken);
      
      // Update auth store state immediately
      useAuthStore.setState({
        user: user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate('/register-society');
      }, 100);
    } catch (error) {
      console.error('Dev login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Development Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Bypass Firebase Phone Auth for development testing
            </p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ This is for development only. Firebase Phone Auth needs to be configured for production.
              </p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User Role for Testing
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleDevLogin('SUPPORT')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Login as SUPPORT (Super Admin)
                </button>
                
                <button
                  onClick={() => handleDevLogin('COMMITTEE')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  Login as COMMITTEE (Admin)
                </button>
                
                <button
                  onClick={() => handleDevLogin('OWNER')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <User className="h-5 w-5 mr-2" />
                  Login as OWNER (Regular User)
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Development Mode
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>• No Firebase Phone Auth required</p>
                  <p>• Test different user roles</p>
                  <p>• Access all protected routes</p>
                  <p>• Perfect for development and testing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Firebase Setup Instructions */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              To Enable Firebase Phone Auth (Production):
            </h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to Firebase Console → Authentication → Sign-in method</li>
              <li>Enable Phone provider</li>
              <li>Set up billing (Blaze plan required)</li>
              <li>Add test phone numbers for development</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevLogin;
