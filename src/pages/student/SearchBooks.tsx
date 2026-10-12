import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBooks } from '../../store/slices/booksSlice';
import { borrowBook, clearBorrowingMessages } from '../../store/slices/borrowingsSlice';
import { reserveBook, clearReservationMessages } from '../../store/slices/reservationsSlice';
import { Sidebar } from '../../components/Sidebar';
import { BookCard } from '../../components/BookCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Book } from '../../types';
import { Search, Filter, BookOpen, Layers, Hash, CheckCircle2 } from 'lucide-react';

export const SearchBooks: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { books, loading } = useAppSelector((state) => state.books);
  const borrowingsState = useAppSelector((state) => state.borrowings);
  const reservationsState = useAppSelector((state) => state.reservations);

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    dispatch(fetchBooks({ search, category: selectedCategory, availableOnly }));
  }, [dispatch, search, selectedCategory, availableOnly]);

  const categories = ['All', 'Computer Science', 'Electronics', 'Mechanical Engineering', 'Physics', 'Mathematics'];

  const handleBorrow = async (book: Book) => {
    dispatch(clearBorrowingMessages());
    const res = await dispatch(borrowBook({ bookId: book._id }));
    if (borrowBook.fulfilled.match(res)) {
      dispatch(fetchBooks({ search, category: selectedCategory, availableOnly }));
    }
  };

  const handleReserve = async (book: Book) => {
    dispatch(clearReservationMessages());
    const res = await dispatch(reserveBook(book._id));
    if (reserveBook.fulfilled.match(res)) {
      dispatch(fetchBooks({ search, category: selectedCategory, availableOnly }));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="student" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Library Book Catalog & Search</h1>
          <p className="text-xs text-slate-500 mt-0.5">Explore physical textbooks, research references, and course materials</p>
        </div>

        <ErrorMessage
          message={borrowingsState.error || reservationsState.error || ''}
          onDismiss={() => {
            dispatch(clearBorrowingMessages());
            dispatch(clearReservationMessages());
          }}
        />

        {(borrowingsState.actionSuccessMessage || reservationsState.successMessage) && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{borrowingsState.actionSuccessMessage || reservationsState.successMessage}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, ISBN..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading library collection...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No books found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                isStudent={true}
                onViewDetails={(b) => setSelectedBook(b)}
                onBorrow={handleBorrow}
                onReserve={handleReserve}
              />
            ))}
          </div>
        )}

        {/* Book Details Modal */}
        <Modal
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          title={selectedBook?.title || 'Book Details'}
        >
          {selectedBook && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                  {selectedBook.category}
                </span>
                <StatusBadge status={selectedBook.availableCopies > 0 ? 'available' : 'unavailable'} />
              </div>

              <div>
                <p className="text-slate-500 font-medium">Author</p>
                <p className="text-sm font-bold text-slate-900">{selectedBook.author}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 font-medium">Publisher</p>
                  <p className="font-semibold text-slate-800">{selectedBook.publisher} ({selectedBook.publicationYear})</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">ISBN</p>
                  <p className="font-mono text-slate-800">{selectedBook.isbn}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Description</p>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedBook.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-slate-600 font-medium">
                  Available Copies:{' '}
                  <span className="font-bold text-slate-900">{selectedBook.availableCopies}</span> / {selectedBook.totalCopies}
                </div>

                <div className="flex items-center gap-2">
                  {selectedBook.availableCopies > 0 ? (
                    <button
                      onClick={() => {
                        handleBorrow(selectedBook);
                        setSelectedBook(null);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Borrow Now
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleReserve(selectedBook);
                        setSelectedBook(null);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Reserve Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};
