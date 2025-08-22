import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  Building2, 
  Users, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Upload,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface SocietyDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface CommitteeDetails {
  chairmanName: string;
  secretaryName: string;
  treasurerName: string;
  chairmanPhone: string;
  secretaryPhone: string;
  treasurerPhone: string;
}

interface Document {
  type: 'PAN' | 'REGISTRATION_CERT' | 'ADDRESS_PROOF';
  file: File | null;
  uploaded: boolean;
  s3Key?: string;
  url?: string;
}

interface RegistrationData {
  societyDetails: SocietyDetails;
  committeeDetails: CommitteeDetails;
  documents: Document[];
  registrationId?: string;
  paymentOrderId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  funnelStage: 'INITIATED' | 'DOCUMENTS_UPLOADED' | 'PAYMENT_PENDING' | 'PAYMENT_COMPLETED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
}

const RegisterSociety: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    societyDetails: {
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    committeeDetails: {
      chairmanName: '',
      secretaryName: '',
      treasurerName: '',
      chairmanPhone: '',
      secretaryPhone: '',
      treasurerPhone: ''
    },
    documents: [
      { type: 'PAN', file: null, uploaded: false },
      { type: 'REGISTRATION_CERT', file: null, uploaded: false },
      { type: 'ADDRESS_PROOF', file: null, uploaded: false }
    ],
    registrationId: undefined,
    paymentOrderId: undefined,
    paymentStatus: 'pending',
    funnelStage: 'INITIATED'
  });

  const steps = [
    { id: 1, title: 'Society Details', icon: Building2, description: 'Basic society information' },
    { id: 2, title: 'Committee Details', icon: Users, description: 'Committee member information' },
    { id: 3, title: 'Documents Upload', icon: FileText, description: 'Upload required documents' },
    { id: 4, title: 'Payment', icon: CreditCard, description: 'Complete payment' },
    { id: 5, title: 'Review', icon: CheckCircle, description: 'Review and submit' }
  ];

  // Auto-save progress when data changes
  useEffect(() => {
    if (currentStep > 1) {
      autoSaveProgress();
    }
  }, [registrationData, currentStep]);

  const autoSaveProgress = async () => {
    try {
      // Get a fresh token for auto-save
      const testResponse = await fetch('http://localhost:3001/api/v1/auth/test-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+1234567892' })
      });

      if (!testResponse.ok) {
        console.error('Failed to get token for auto-save');
        return;
      }

      const testData = await testResponse.json();
      const freshToken = testData.accessToken;

      // For auto-save, check for existing registrations or create new one
      if (!registrationData.registrationId) {
        try {
          // Check for existing registrations
          const existingResponse = await fetch('http://localhost:3001/api/v1/registrations', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${freshToken}`
            }
          });

          if (existingResponse.ok) {
            const existingRegistrations = await existingResponse.json();
            
            if (existingRegistrations.length > 0) {
              // Use existing registration
              const existingRegistration = existingRegistrations[0];
              setRegistrationData(prev => ({
                ...prev,
                registrationId: existingRegistration.id
              }));
            } else {
              // Create new registration
              const response = await fetch('http://localhost:3001/api/v1/registrations', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${freshToken}`
                },
                body: JSON.stringify({
                  funnelStage: 'INITIATED'
                })
              });

              if (response.ok) {
                const result = await response.json();
                setRegistrationData(prev => ({
                  ...prev,
                  registrationId: result.id
                }));
              }
            }
          }
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleSocietyDetailsChange = (field: keyof SocietyDetails, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      societyDetails: {
        ...prev.societyDetails,
        [field]: value
      }
    }));
  };

  const handleCommitteeDetailsChange = (field: keyof CommitteeDetails, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      committeeDetails: {
        ...prev.committeeDetails,
        [field]: value
      }
    }));
  };

  const handleDocumentUpload = async (type: string, file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get authentication token
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('devToken') || 'dev-token-' + Date.now();
      
      console.log('🔍 Debug: Starting document upload for type:', type);
      console.log('🔍 Debug: File details:', { name: file.name, type: file.type, size: file.size });
      console.log('🔍 Debug: Auth token:', authToken ? 'Present' : 'Missing');
      console.log('🔍 Debug: Token value:', authToken);
      
      // Test backend connectivity first
      try {
        const testResponse = await fetch('http://localhost:3001/api/v1/auth/test-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '+1234567892' })
        });
        console.log('🔍 Debug: Backend connectivity test:', testResponse.status);
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('🔍 Debug: Test token response:', testData);
          
          // Use this fresh token instead of the stored one
          const freshToken = testData.accessToken;
          console.log('🔍 Debug: Using fresh token:', freshToken ? 'Present' : 'Missing');
          
          // Update the auth token for this request
          const requestBody = {
            fileName: file.name,
            fileType: file.type,
            documentType: type
          };
          
          console.log('🔍 Debug: Request body:', requestBody);
          console.log('🔍 Debug: Making request to:', 'http://localhost:3001/api/v1/uploads/presign');

          // Get pre-signed URL from backend with fresh token
          let response;
          try {
            response = await fetch('http://localhost:3001/api/v1/uploads/presign', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${freshToken}`
              },
              body: JSON.stringify(requestBody)
            });

            console.log('🔍 Debug: Response received:', response.status, response.statusText);

            if (!response.ok) {
              const errorData = await response.text();
              console.log('🔍 Debug: Error response:', errorData);
              throw new Error(`Failed to get upload URL: ${errorData}`);
            }
          } catch (fetchError) {
            console.log('🔍 Debug: Fetch error:', fetchError);
            if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
              throw new Error('Network error - please check if the backend is running and accessible');
            }
            throw fetchError;
          }

          const { presignedUrl, s3Key } = await response.json();

          // Upload file to S3/MinIO
          const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
          }

          // Update local state
          setRegistrationData(prev => ({
            ...prev,
            documents: prev.documents.map(doc => 
              doc.type === type 
                ? { ...doc, file, uploaded: true, s3Key, url: presignedUrl }
                : doc
            ),
                         funnelStage: 'DOCUMENTS_UPLOADED'
          }));

          setSuccess(`${type} document uploaded successfully!`);
          setTimeout(() => setSuccess(null), 3000);
          return; // Exit early since we handled the upload
        }
      } catch (testError) {
        console.log('🔍 Debug: Backend connectivity failed:', testError);
        throw new Error('Cannot connect to backend - please ensure it is running on port 3001');
      }

      

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get a fresh token for payment
      const testResponse = await fetch('http://localhost:3001/api/v1/auth/test-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+1234567892' })
      });

      if (!testResponse.ok) {
        throw new Error('Failed to get authentication token');
      }

      const testData = await testResponse.json();
      const freshToken = testData.accessToken;

      console.log('🔍 Debug: Payment - Using fresh token:', freshToken ? 'Present' : 'Missing');

      // First, check if user has an existing registration
      let registrationId: string;
      
      try {
        // Try to get existing registrations
        const existingRegistrationsResponse = await fetch('http://localhost:3001/api/v1/registrations', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${freshToken}`
          }
        });

        if (existingRegistrationsResponse.ok) {
          const existingRegistrations = await existingRegistrationsResponse.json();
          
          if (existingRegistrations.length > 0) {
            // User has existing registrations, use the first one
            const existingRegistration = existingRegistrations[0];
            registrationId = existingRegistration.id;
            
            console.log('🔍 Debug: Using existing registration:', registrationId);
            
            // If registration is in early stage, we can continue with it
            if (existingRegistration.funnelStage === 'INITIATED' || 
                existingRegistration.funnelStage === 'DOCUMENTS_UPLOADED') {
              console.log('🔍 Debug: Existing registration is in early stage, continuing...');
            } else {
              console.log('🔍 Debug: Existing registration is in advanced stage, cannot continue');
              throw new Error('You already have a registration in progress. Please complete or cancel it first.');
            }
          } else {
            // No existing registrations, create a new one
            console.log('🔍 Debug: No existing registrations, creating new one');
            const registrationResponse = await fetch('http://localhost:3001/api/v1/registrations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${freshToken}`
              },
              body: JSON.stringify({
                funnelStage: 'INITIATED'
              })
            });

            if (!registrationResponse.ok) {
              const errorData = await registrationResponse.text();
              console.log('🔍 Debug: Registration creation error response:', errorData);
              throw new Error(`Failed to create registration: ${errorData}`);
            }

            const registrationResult = await registrationResponse.json();
            registrationId = registrationResult.id;
            console.log('🔍 Debug: Created new registration with ID:', registrationId);
          }
        } else {
          // If GET fails, try to create a new registration
          console.log('🔍 Debug: GET registrations failed, trying to create new one');
          const registrationResponse = await fetch('http://localhost:3001/api/v1/registrations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${freshToken}`
            },
            body: JSON.stringify({
              funnelStage: 'INITIATED'
            })
          });

          if (!registrationResponse.ok) {
            const errorData = await registrationResponse.text();
            console.log('🔍 Debug: Registration creation error response:', errorData);
            throw new Error(`Failed to create registration: ${errorData}`);
          }

          const registrationResult = await registrationResponse.json();
          registrationId = registrationResult.id;
          console.log('🔍 Debug: Created new registration with ID:', registrationId);
        }
      } catch (error) {
        console.error('🔍 Debug: Error handling registration:', error);
        throw error;
      }

      // Now we have a registrationId, either from existing or newly created

      console.log('🔍 Debug: Using registration ID:', registrationId);

      // Now update the registration with society and committee details
      // The backend will automatically create the society when we provide societyDetails
      const updateResponse = await fetch(`http://localhost:3001/api/v1/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`
        },
        body: JSON.stringify({
          societyDetails: {
            name: registrationData.societyDetails.name,
            address: registrationData.societyDetails.address,
            city: registrationData.societyDetails.city,
            state: registrationData.societyDetails.state,
            pincode: registrationData.societyDetails.pincode
          },
          committeeDetails: JSON.stringify({
            chairman: {
              name: registrationData.committeeDetails.chairmanName,
              phone: registrationData.committeeDetails.chairmanPhone
            },
            secretary: {
              name: registrationData.committeeDetails.secretaryName,
              phone: registrationData.committeeDetails.secretaryPhone
            },
            treasurer: {
              name: registrationData.committeeDetails.treasurerName,
              phone: registrationData.committeeDetails.treasurerPhone
            }
          }),
          funnelStage: 'DOCUMENTS_UPLOADED'
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.text();
        console.log('🔍 Debug: Registration update error response:', errorData);
        throw new Error(`Failed to update registration: ${errorData}`);
      }

      console.log('🔍 Debug: Updated registration with society and committee details');

      // Now create payment order with registration ID
      const response = await fetch('http://localhost:3001/api/v1/payments/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`
        },
        body: JSON.stringify({
          amount: 1000, // ₹1000 registration fee
          currency: 'INR',
          registrationId: registrationId
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.log('🔍 Debug: Payment error response:', errorData);
        throw new Error(`Failed to create payment order: ${errorData}`);
      }

      const { orderId, amount, currency } = await response.json();

      // Update local state
      setRegistrationData(prev => ({
        ...prev,
        paymentOrderId: orderId,
                 funnelStage: 'PAYMENT_PENDING',
        registrationId: registrationId
      }));

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_YOUR_KEY', // Replace with actual test key
        amount: amount,
        currency: currency,
        name: 'Society Registration',
        description: 'Society Registration Fee',
        order_id: orderId,
        handler: function (_response: any) {
          // Handle successful payment
          setRegistrationData(prev => ({
            ...prev,
            paymentStatus: 'paid',
                         funnelStage: 'PAYMENT_COMPLETED'
          }));
          setSuccess('Payment successful!');
          setTimeout(() => setSuccess(null), 3000);
        },
        prefill: {
          name: user?.phone || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get a fresh token for submission
      const testResponse = await fetch('http://localhost:3001/api/v1/auth/test-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+1234567892' })
      });

      if (!testResponse.ok) {
        throw new Error('Failed to get authentication token');
      }

      const testData = await testResponse.json();
      const freshToken = testData.accessToken;

      console.log('🔍 Debug: Submission - Using fresh token:', freshToken ? 'Present' : 'Missing');

      // Submit final registration with fresh token
      const response = await fetch('http://localhost:3001/api/v1/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`
        },
                 body: JSON.stringify({
           funnelStage: 'UNDER_REVIEW'
         })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.log('🔍 Debug: Submission error response:', errorData);
        throw new Error(`Failed to submit registration: ${errorData}`);
      }

      setSuccess('Registration submitted successfully!');
             setRegistrationData(prev => ({
         ...prev,
         funnelStage: 'UNDER_REVIEW'
       }));

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return Object.values(registrationData.societyDetails).every(value => value.trim() !== '');
      case 2:
        return Object.values(registrationData.committeeDetails).every(value => value.trim() !== '');
      case 3:
        return registrationData.documents.every(doc => doc.uploaded);
      case 4:
        return registrationData.paymentStatus === 'paid' || registrationData.funnelStage === 'PAYMENT_COMPLETED';
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Society Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Society Name</label>
                <input
                  type="text"
                  value={registrationData.societyDetails.name}
                  onChange={(e) => handleSocietyDetailsChange('name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter society name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={registrationData.societyDetails.city}
                  onChange={(e) => handleSocietyDetailsChange('city', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={registrationData.societyDetails.state}
                  onChange={(e) => handleSocietyDetailsChange('state', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  value={registrationData.societyDetails.pincode}
                  onChange={(e) => handleSocietyDetailsChange('pincode', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={registrationData.societyDetails.address}
                onChange={(e) => handleSocietyDetailsChange('address', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter complete address"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Committee Members</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chairman Name</label>
                <input
                  type="text"
                  value={registrationData.committeeDetails.chairmanName}
                  onChange={(e) => handleCommitteeDetailsChange('chairmanName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter chairman name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Chairman Phone</label>
                <input
                  type="tel"
                  value={registrationData.committeeDetails.chairmanPhone}
                  onChange={(e) => handleCommitteeDetailsChange('chairmanPhone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Secretary Name</label>
                <input
                  type="text"
                  value={registrationData.committeeDetails.secretaryName}
                  onChange={(e) => handleCommitteeDetailsChange('secretaryName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter secretary name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Secretary Phone</label>
                <input
                  type="tel"
                  value={registrationData.committeeDetails.secretaryPhone}
                  onChange={(e) => handleCommitteeDetailsChange('secretaryPhone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Treasurer Name</label>
                <input
                  type="text"
                  value={registrationData.committeeDetails.treasurerName}
                  onChange={(e) => handleCommitteeDetailsChange('treasurerName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter treasurer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Treasurer Phone</label>
                <input
                  type="tel"
                  value={registrationData.committeeDetails.treasurerPhone}
                  onChange={(e) => handleCommitteeDetailsChange('treasurerPhone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
            
            <div className="space-y-4">
              {registrationData.documents.map((doc) => (
                <div key={doc.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{doc.type.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-500">Upload {doc.type.toLowerCase().replace('_', ' ')}</p>
                    </div>
                    
                    {doc.uploaded ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">Uploaded</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleDocumentUpload(doc.type, file);
                            }
                          }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          id={`file-${doc.type}`}
                        />
                        <label
                          htmlFor={`file-${doc.type}`}
                          className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Payment</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Registration Fee</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Amount: ₹1,000</p>
                    <p>Payment Method: Razorpay</p>
                  </div>
                </div>
              </div>
            </div>

            {registrationData.paymentStatus === 'paid' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Payment Successful!</h3>
                    <p className="mt-2 text-sm text-green-700">You can now proceed to the next step.</p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  'Pay ₹1,000'
                )}
              </button>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review & Submit</h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Registration Summary</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700">Society Details</h5>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {registrationData.societyDetails.name}</p>
                    <p><strong>Address:</strong> {registrationData.societyDetails.address}</p>
                    <p><strong>City:</strong> {registrationData.societyDetails.city}</p>
                    <p><strong>State:</strong> {registrationData.societyDetails.state}</p>
                    <p><strong>Pincode:</strong> {registrationData.societyDetails.pincode}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700">Committee Details</h5>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Chairman:</strong> {registrationData.committeeDetails.chairmanName}</p>
                    <p><strong>Secretary:</strong> {registrationData.committeeDetails.secretaryName}</p>
                    <p><strong>Treasurer:</strong> {registrationData.committeeDetails.treasurerName}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700">Documents</h5>
                  <div className="mt-2 text-sm text-gray-600">
                    {registrationData.documents.map((doc) => (
                      <p key={doc.type} className="flex items-center">
                        {doc.uploaded ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        {doc.type.replace('_', ' ')}: {doc.uploaded ? 'Uploaded' : 'Pending'}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700">Payment Status</h5>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Status:</strong> {registrationData.paymentStatus.toUpperCase()}</p>
                    <p><strong>Amount:</strong> ₹1,000</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !canProceedToNext()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Submitting...
                </>
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Society Registration</h1>
          <p className="mt-2 text-gray-600">Complete your society registration in a few simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${step.id <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  </div>
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                    step.id < currentStep ? 'bg-blue-600' : 
                    step.id === currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <step.icon className={`h-5 w-5 ${step.id === currentStep ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 hidden sm:block">
                    <span className={`text-xs font-medium ${
                      step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterSociety;
