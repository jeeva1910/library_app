import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Book } from '../../types';

interface BooksState {
  books: Book[];
  currentBook: Book | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
}

const initialState: BooksState = {
  books: [],
  currentBook: null,
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'All',
};

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params: { search?: string; category?: string; availableOnly?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.availableOnly) queryParams.append('availableOnly', 'true');

      const res = await fetch(`/api/books?${queryParams.toString()}`);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch books');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

export const fetchBookById = createAsyncThunk('books/fetchBookById', async (id: string, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/books/${id}`);
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Book not found');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const addBook = createAsyncThunk('books/addBook', async (bookData: Partial<Book>, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookData),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to add book');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, bookData }: { id: string; bookData: Partial<Book> }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const res = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to update book');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Server error');
    }
  }
);

export const deleteBook = createAsyncThunk('books/deleteBook', async (id: string, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state.auth.token;

    const res = await fetch(`/api/books/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error || 'Failed to delete book');
    return id;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Server error');
  }
});

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearBooksError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.currentBook = action.payload;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.unshift(action.payload);
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.books.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
        if (state.currentBook?._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter((b) => b._id !== action.payload);
      });
  },
});

export const { setSearchQuery, setSelectedCategory, clearBooksError } = booksSlice.actions;
export default booksSlice.reducer;
