import React from 'react';
import { Users as UsersIcon, Phone, Shield } from 'lucide-react';

const Users: React.FC = () => {
  const users = [
    { id: 1, phone: '+91 98765 43210', role: 'SUPPORT', status: 'Active' },
    { id: 2, phone: '+91 98765 43211', role: 'COMMITTEE', status: 'Active' },
    { id: 3, phone: '+91 98765 43212', role: 'OWNER', status: 'Active' },
    { id: 4, phone: '+91 98765 43213', role: 'OWNER', status: 'Active' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPPORT':
        return 'bg-red-100 text-red-800';
      case 'COMMITTEE':
        return 'bg-blue-100 text-blue-800';
      case 'OWNER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage all users in the system
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                        <UsersIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-gray-900">
                          {user.phone}
                        </p>
                      </div>
                      <div className="flex items-center mt-1">
                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Users;
