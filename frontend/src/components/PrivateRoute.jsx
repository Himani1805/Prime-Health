import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  // Redux se token check karein
  const { token } = useSelector((state) => state.auth);

  // Agar token nahi hai, to Login page par redirect karein
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Agar token hai, to protected content dikhayein
  return <Outlet />;
};

export default PrivateRoute;