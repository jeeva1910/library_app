import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Borrowing } from '../../types';

interface BorrowingsState {
  borrowings: Borrowing[];
  loading: boolean;
  error: string | null;
  actionSuccessMessage: string | null;
}

const initialState: BorrowingsState = {
  borrowings: [],
  loading: false,
  error: null,
  actionSuccessMessage: null,
};

export const fetchBorrowings = createAsyncThunk('borrowings/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/borrowings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch borrowings');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const borrowBook = createAsyncThunk(
  'borrowings/borrowBook',
  async ({ bookId, targetUserId }: { bookId: string; targetUserId?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const res = await fetch('/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to borrow book');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

export const returnBook = createAsyncThunk('borrowings/returnBook', async (borrowingId: string, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch(`/api/borrowings/${borrowingId}/return`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to return book');
    return { borrowingId, ...data };
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const renewBook = createAsyncThunk('borrowings/renewBook', async (borrowingId: string, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch(`/api/borrowings/${borrowingId}/renew`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to renew book');
    return { borrowingId, ...data };
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

const borrowingsSlice = createSlice({
  name: 'borrowings',
  initialState,
  reducers: {
    clearBorrowingMessages: (state) => {
      state.error = null;
      state.actionSuccessMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBorrowings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowings.fulfilled, (state, action) => {
        state.loading = false;
        state.borrowings = action.payload;
      })
      .addCase(fetchBorrowings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(borrowBook.fulfilled, (state, action) => {
        state.borrowings.unshift(action.payload);
        state.actionSuccessMessage = 'Book borrowed successfully!';
      })
      .addCase(borrowBook.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        const item = state.borrowings.find((b) => b._id === action.payload.borrowingId);
        if (item) {
          item.status = 'returned';
          item.returnDate = new Date().toISOString();
        }
        state.actionSuccessMessage = action.payload.message || 'Book returned successfully';
      })
      .addCase(renewBook.fulfilled, (state, action) => {
        const item = state.borrowings.find((b) => b._id === action.payload.borrowingId);
        if (item) {
          item.dueDate = action.payload.newDueDate;
          item.status = 'renewed';
          item.renewCount = (item.renewCount || 0) + 1;
        }
        state.actionSuccessMessage = 'Book renewed successfully!';
      });
  },
});

export const { clearBorrowingMessages } = borrowingsSlice.actions;
export default borrowingsSlice.reducer;
