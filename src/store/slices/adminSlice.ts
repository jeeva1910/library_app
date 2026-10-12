import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AdminStats } from '../../types';

interface StudentSummary {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  activeBorrowings: number;
  totalBorrowings: number;
}

interface AdminState {
  stats: AdminStats | null;
  students: StudentSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  students: [],
  loading: false,
  error: null,
};

export const fetchAdminDashboard = createAsyncThunk('admin/fetchDashboard', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch stats');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const fetchAdminStudents = createAsyncThunk('admin/fetchStudents', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch students');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStudents.fulfilled, (state, action) => {
        state.students = action.payload;
      });
  },
});

export default adminSlice.reducer;
