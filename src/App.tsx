import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store, useAppDispatch } from './store';
import { fetchProfile } from './store/slices/authSlice';

import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SearchBooks } from './pages/student/SearchBooks';
import { MyBorrowings } from './pages/student/MyBorrowings';
import { MyReservations } from './pages/student/MyReservations';
import { DigitalResources } from './pages/student/DigitalResources';
import { StudentNotifications } from './pages/student/StudentNotifications';
import { MyFines } from './pages/student/MyFines';
import { StudentProfile } from './pages/student/StudentProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BookManagement } from './pages/admin/BookManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { IssueReturn } from './pages/admin/IssueReturn';
import { ReservationManagement } from './pages/admin/ReservationManagement';
import { ResourceManagement } from './pages/admin/ResourceManagement';
import { FineManagement } from './pages/admin/FineManagement';
import { NotificationManagement } from './pages/admin/NotificationManagement';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Protected Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/books"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <SearchBooks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/borrowings"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <MyBorrowings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/reservations"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <MyReservations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/resources"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <DigitalResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/notifications"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <StudentNotifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/fines"
                  element={
                    <ProtectedRoute allowedRole="student">
                      <MyFines />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute>
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/books"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <BookManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/issue-return"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <IssueReturn />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reservations"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <ReservationManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/resources"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <ResourceManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/fines"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <FineManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <NotificationManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  );
}
