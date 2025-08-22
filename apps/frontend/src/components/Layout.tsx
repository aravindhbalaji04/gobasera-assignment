import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Home, Users, Building2, LogOut, Eye, BarChart3 } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Societies', href: '/societies', icon: Building2 },
    // Support-specific navigation
    ...(user?.role === 'SUPPORT' ? [
      { name: 'Review Registrations', href: '/support/review', icon: Eye },
      { name: 'Analytics', href: '/support/analytics', icon: BarChart3 },
    ] : []),
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Building2 className="h-8 w-8 text-white" />
              <h1 className="ml-2 text-xl font-semibold text-white">
                Society App
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.phone?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.phone}</p>
                <p className="text-xs text-gray-300">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto flex-shrink-0 bg-gray-600 p-1 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
