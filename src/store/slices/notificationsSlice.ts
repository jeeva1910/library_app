import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationItem } from '../../types';

interface NotificationsState {
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch notifications');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id: string, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return rejectWithValue('Failed to mark read');
    return id;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const sendNotification = createAsyncThunk(
  'notifications/send',
  async (notifData: { userId: string; title: string; message: string; type?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notifData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to send notification');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.notifications.find((n) => n._id === action.payload);
        if (notif) notif.isRead = true;
      });
  },
});

export default notificationsSlice.reducer;
