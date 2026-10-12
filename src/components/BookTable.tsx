import React from 'react';
import { Book } from '../types';
import { StatusBadge } from './StatusBadge';
import { Edit2, Trash2, BookPlus } from 'lucide-react';

interface BookTableProps {
  books: Book[];
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onIssue?: (book: Book) => void;
  isAdmin?: boolean;
}

export const BookTable: React.FC<BookTableProps> = ({
  books,
  onEdit,
  onDelete,
  onIssue,
  isAdmin = false,
}) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 text-slate-500">
        <p className="text-sm font-medium">No books found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
          <tr>
            <th className="px-4 py-3">Book Details</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">ISBN</th>
            <th className="px-4 py-3 text-center">Copies (Avail/Total)</th>
            <th className="px-4 py-3">Status</th>
            {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {books.map((book) => {
            const isAvail = book.availableCopies > 0;
            return (
              <tr key={book._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5">
                  <p className="font-bold text-slate-900">{book.title}</p>
                  <p className="text-xs text-slate-500">{book.author} · {book.publisher} ({book.publicationYear})</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {book.category}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{book.isbn}</td>
                <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-800">
                  <span className={book.availableCopies === 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                    {book.availableCopies}
                  </span>{' '}
                  / {book.totalCopies}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={isAvail ? 'available' : 'unavailable'} />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isAvail && onIssue && (
                        <button
                          onClick={() => onIssue(book)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Issue Book"
                        >
                          <BookPlus className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(book)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Book"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(book)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
