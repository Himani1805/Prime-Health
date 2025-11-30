import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Future slices (e.g., patientSlice, appointmentSlice) will go here
  },
});

export default store;