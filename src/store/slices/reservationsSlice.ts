import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Reservation } from '../../types';

interface ReservationsState {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ReservationsState = {
  reservations: [],
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchReservations = createAsyncThunk('reservations/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/reservations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch reservations');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const reserveBook = createAsyncThunk('reservations/reserve', async (bookId: string, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to place reservation');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const updateReservationStatus = createAsyncThunk(
  'reservations/updateStatus',
  async ({ reservationId, status }: { reservationId: string; status: 'fulfilled' | 'cancelled' }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to update reservation');
      return { reservationId, status };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearReservationMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(reserveBook.fulfilled, (state, action) => {
        state.reservations.unshift(action.payload);
        state.successMessage = 'Reservation placed successfully!';
      })
      .addCase(reserveBook.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        const item = state.reservations.find((r) => r._id === action.payload.reservationId);
        if (item) {
          item.status = action.payload.status;
        }
        state.successMessage = `Reservation marked as ${action.payload.status}`;
      });
  },
});

export const { clearReservationMessages } = reservationsSlice.actions;
export default reservationsSlice.reducer;
