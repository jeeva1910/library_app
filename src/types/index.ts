export type UserRole = 'student' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type BorrowingStatus = 'borrowed' | 'returned' | 'overdue' | 'renewed';

export interface Borrowing {
  _id: string;
  userId: string;
  bookId: string;
  userName?: string;
  userEmail?: string;
  bookTitle?: string;
  bookIsbn?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowingStatus;
  fineAmount: number;
  renewCount?: number;
}

export type ReservationStatus = 'active' | 'fulfilled' | 'cancelled';

export interface Reservation {
  _id: string;
  userId: string;
  bookId: string;
  userName?: string;
  userEmail?: string;
  bookTitle?: string;
  reservationDate: string;
  status: ReservationStatus;
}

export interface DigitalResource {
  _id: string;
  title: string;
  description: string;
  category: string;
  resourceUrl: string;
  accessType: 'Open Access' | 'Institutional' | 'PDF Download' | 'Video Lecture';
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isRead: boolean;
  createdAt: string;
}

export type FineStatus = 'pending' | 'paid';

export interface Fine {
  _id: string;
  userId: string;
  borrowingId: string;
  userName?: string;
  bookTitle?: string;
  amount: number;
  status: FineStatus;
  createdAt: string;
  paidAt?: string;
}

export interface AdminStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  totalStudents: number;
  overdueBooks: number;
  activeReservations: number;
  pendingFinesAmount: number;
  mostBorrowedBooks: Array<{ title: string; author: string; borrowCount: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  borrowingActivity: Array<{ date: string; count: number }>;
}
