import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import { Bell, UserCircle, Menu, X } from 'lucide-react';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="md:ml-64 flex flex-col min-h-screen transition-all duration-300">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <h1 className="text-lg font-semibold text-gray-700 hidden sm:block">
              Hospital Management Portal
            </h1>
            <h1 className="text-base font-semibold text-gray-700 sm:hidden">
              Portal
            </h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notification Icon */}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Section */}
            <div className="flex items-center space-x-2 md:space-x-3 border-l pl-2 md:pl-4 border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName || 'User'} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <div className="h-8 w-8 md:h-9 md:w-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold shadow-sm">
                {user?.firstName?.charAt(0) || <UserCircle className="h-5 w-5 md:h-6 md:w-6" />}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content renders here */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;