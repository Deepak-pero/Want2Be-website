import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../Api/authApi';

// Async thunks for API calls
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ userId, otp }, { rejectWithValue }) => {
        try {
            const response = await authAPI.verifyOTP({ userId, otp });
            return response.data; // ✅ Add .data here
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.getCurrentUser();
            return response.data; // ✅ Add .data here
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get user');
        }
    }
);

export const requestOTP = createAsyncThunk(
    'auth/requestOTP',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authAPI.requestOTP(userData);
            return response.data; // ✅ Add .data here
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token'),
        isLoading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem('token'),
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login User
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get Current User
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
            })
            // Request OTP
            .addCase(requestOTP.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(requestOTP.fulfilled, (state) => {
                state.isLoading = false;
                // Don't set user here, just store userId if needed
            })
            .addCase(requestOTP.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;