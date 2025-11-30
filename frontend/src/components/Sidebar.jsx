import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  UserCog, 
  LogOut, 
  Activity,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Menu Items Configuration
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Patients', icon: Users, path: '/dashboard/patients' },
    { name: 'Appointments', icon: Calendar, path: '/dashboard/appointments' },
    { name: 'Prescriptions', icon: FileText, path: '/dashboard/prescriptions' },
  ];

  // Logic: Show Staff option only for Admins
  if (user?.role === 'HOSPITAL_ADMIN' || user?.role === 'SUPER_ADMIN') {
    menuItems.push({ name: 'Staff', icon: UserCog, path: '/dashboard/staff' });
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-teal-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">Prime Health</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'} // Exact match for dashboard home
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 group"
          >
            <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
            Logout
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex-col z-20">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Activity className="h-6 w-6 text-teal-600 mr-2" />
          <span className="text-xl font-bold text-gray-800">Prime Health</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'} // Exact match for dashboard home
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 group"
          >
            <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;