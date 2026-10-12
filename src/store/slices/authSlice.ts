import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const savedToken = typeof window !== 'undefined' ? localStorage.getItem('library_token') : null;
const savedUser = typeof window !== 'undefined' && localStorage.getItem('library_user')
  ? JSON.parse(localStorage.getItem('library_user')!)
  : null;

const initialState: AuthState = {
  user: savedUser,
  token: savedToken,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: { name: string; email: string; password: string; role?: string }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Registration failed');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Login failed');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token found');

    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch profile');
    return data.user;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: { name?: string; email?: string; currentPassword?: string; newPassword?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to update profile');
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('library_token');
      localStorage.removeItem('library_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('library_token', action.payload.token);
      localStorage.setItem('library_user', JSON.stringify(action.payload.user));
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('library_token', action.payload.token);
      localStorage.setItem('library_user', JSON.stringify(action.payload.user));
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Profile
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.user = action.payload;
      localStorage.setItem('library_user', JSON.stringify(action.payload));
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
      localStorage.setItem('library_user', JSON.stringify(action.payload));
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
