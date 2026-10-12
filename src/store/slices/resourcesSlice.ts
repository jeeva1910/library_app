import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DigitalResource } from '../../types';

interface ResourcesState {
  resources: DigitalResource[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  resources: [],
  loading: false,
  error: null,
};

export const fetchResources = createAsyncThunk('resources/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch('/api/resources');
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch resources');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const addResource = createAsyncThunk('resources/add', async (resourceData: Partial<DigitalResource>, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(resourceData),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to add resource');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const updateResource = createAsyncThunk(
  'resources/update',
  async ({ id, resourceData }: { id: string; resourceData: Partial<DigitalResource> }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resourceData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to update resource');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

export const deleteResource = createAsyncThunk('resources/delete', async (id: string, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch(`/api/resources/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to delete resource');
    return id;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(addResource.fulfilled, (state, action) => {
        state.resources.unshift(action.payload);
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        const index = state.resources.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.resources[index] = action.payload;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.resources = state.resources.filter((r) => r._id !== action.payload);
      });
  },
});

export default resourcesSlice.reducer;
