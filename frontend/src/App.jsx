import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Login from './pages/Login';
import RegisterHospital from './pages/RegisterHospital';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Staff from './pages/Staff';

// Import Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// --- Admin Only Route Wrapper ---
// Sirf Admins ko access dega, baaki ko Dashboard par bhej dega
const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);
  
  if (user?.role === 'HOSPITAL_ADMIN' || user?.role === 'SUPER_ADMIN') {
    return <Outlet />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register-hospital" element={<RegisterHospital />} />
        
        {/* --- Protected Routes (Login Required) --- */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            
            {/* Common Routes for Staff/Doctors */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/patients" element={<Patients />} />
            <Route path="/dashboard/appointments" element={<Appointments />} />
            <Route path="/dashboard/prescriptions" element={<Prescriptions />} />
            
            {/* --- Admin Only Routes --- */}
            <Route element={<AdminRoute />}>
               <Route path="/dashboard/staff" element={<Staff />} />
            </Route>
          
          </Route>
        </Route>
        
        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;