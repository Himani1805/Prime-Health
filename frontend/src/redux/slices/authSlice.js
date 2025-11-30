import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosConfig';

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      // API Call to your backend
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data; // Returns { success: true, token: '...', user: {...} }
    } catch (error) {
      // Return custom error message from backend if available
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null, // Hydrate token from storage on load
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem('token'); // Clear token from storage
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Pending
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Login Success
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // Save token to localStorage immediately
        localStorage.setItem('token', action.payload.token);
      })
      // Login Failure
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Contains the error message
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;




















