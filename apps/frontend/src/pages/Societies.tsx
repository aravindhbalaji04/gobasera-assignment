import React from 'react';
import { Building2, MapPin, User, Calendar } from 'lucide-react';

const Societies: React.FC = () => {
  const societies = [
    {
      id: 1,
      name: 'Green Valley Society',
      address: '123 Green Valley Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      createdBy: '+91 98765 43210',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Sunset Society',
      address: '456 Sunset Boulevard',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      createdBy: '+91 98765 43211',
      createdAt: '2024-01-20',
    },
    {
      id: 3,
      name: 'Ocean View Society',
      address: '789 Ocean Drive',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      createdBy: '+91 98765 43212',
      createdAt: '2024-01-25',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Societies</h1>
        <p className="mt-2 text-sm text-gray-700">
          View all registered societies in the system
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {societies.map((society) => (
          <div key={society.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {society.name}
                  </h3>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p>{society.address}</p>
                    <p>{society.city}, {society.state} {society.pincode}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Created by: {society.createdBy}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Created: {society.createdAt}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-900">Status: </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Societies;
