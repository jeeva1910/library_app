import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer from './slices/authSlice';
import booksReducer from './slices/booksSlice';
import borrowingsReducer from './slices/borrowingsSlice';
import reservationsReducer from './slices/reservationsSlice';
import resourcesReducer from './slices/resourcesSlice';
import notificationsReducer from './slices/notificationsSlice';
import finesReducer from './slices/finesSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    borrowings: borrowingsReducer,
    reservations: reservationsReducer,
    resources: resourcesReducer,
    notifications: notificationsReducer,
    fines: finesReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
