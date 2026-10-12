import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Fine } from '../../types';

interface FinesState {
  fines: Fine[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: FinesState = {
  fines: [],
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchFines = createAsyncThunk('fines/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/fines', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch fines');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const payFine = createAsyncThunk('fines/pay', async (fineId: string, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch(`/api/fines/${fineId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to process payment');
    return fineId;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

const finesSlice = createSlice({
  name: 'fines',
  initialState,
  reducers: {
    clearFineMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFines.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFines.fulfilled, (state, action) => {
        state.loading = false;
        state.fines = action.payload;
      })
      .addCase(payFine.fulfilled, (state, action) => {
        const item = state.fines.find((f) => f._id === action.payload);
        if (item) {
          item.status = 'paid';
          item.paidAt = new Date().toISOString();
        }
        state.successMessage = 'Fine paid successfully!';
      });
  },
});

export const { clearFineMessages } = finesSlice.actions;
export default finesSlice.reducer;
