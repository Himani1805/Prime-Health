import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import RegisterHospital from './pages/RegisterHospital';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Staff from './pages/Staff';

import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

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
        <Route path="/login" element={<Login />} />
        <Route path="/register-hospital" element={<RegisterHospital />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/patients" element={<Patients />} />
            <Route path="/dashboard/appointments" element={<Appointments />} />
            <Route path="/dashboard/prescriptions" element={<Prescriptions />} />

            <Route element={<AdminRoute />}>
              <Route path="/dashboard/staff" element={<Staff />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;