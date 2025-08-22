import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/register-society');
    }
  }, [isAuthenticated, navigate]);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    if (recaptchaRef.current) {
      authService.initRecaptcha('recaptcha-container')
        .catch((error) => {
          console.error('Failed to initialize reCAPTCHA:', error);
        });
    }
  }, []);

  const handleSendOTP = async () => {
    // Ensure phone number is in international format
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('91')) {
        formattedPhone = '+' + phoneNumber;
      } else if (phoneNumber.startsWith('0')) {
        formattedPhone = '+91' + phoneNumber.substring(1);
      } else {
        formattedPhone = '+91' + phoneNumber;
      }
    }
    
    if (!formattedPhone || formattedPhone.length < 12) {
      setOtpError('Please enter a valid phone number (e.g., +91 98765 43210)');
      return;
    }

    try {
      setOtpError('');
      console.log('Sending OTP to:', formattedPhone);
      await authService.sendOTP(formattedPhone);
      console.log('OTP sent successfully');
      setOtpSent(true);
      setShowOtpInput(true);
    } catch (error: any) {
      console.error('OTP error:', error);
      setOtpError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid OTP');
      return;
    }

    try {
      setOtpError('');
      await login(phoneNumber, otp);
      // Login success will trigger navigation in useEffect
    } catch (error) {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      setOtpError('');
      await authService.sendOTP(phoneNumber);
      setOtp('');
      setOtpSent(true);
    } catch (error) {
      setOtpError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account using your phone number
            </p>
          </div>

          {/* reCAPTCHA Container */}
          <div id="recaptcha-container" ref={recaptchaRef} className="mb-4"></div>

          {/* Phone Number Input */}
          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="+91 98765 43210"
                  disabled={otpSent}
                />
              </div>
            </div>

            {/* Send OTP Button */}
            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading || !phoneNumber}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            )}

            {/* OTP Input */}
            {showOtpInput && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter OTP
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      autoComplete="one-time-code"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                </div>

                {/* Verify OTP Button */}
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || !otp}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                {/* Resend OTP Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Didn't receive OTP? Resend
                  </button>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {(error || otpError) && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error || otpError}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {otpSent && !otpError && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      OTP sent successfully to {phoneNumber}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clear Error Button */}
          {(error || otpError) && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={clearError}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Error
              </button>
            </div>
          )}

          {/* Development Login Link */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500 mb-2">
              Having trouble with Firebase Phone Auth?
            </div>
            <a
              href="/dev-login"
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Use Development Login Instead →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
