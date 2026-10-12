import React from 'react';
import { Book } from '../types';
import { StatusBadge } from './StatusBadge';
import { BookOpen, User as UserIcon, Hash, Layers } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onViewDetails: (book: Book) => void;
  onBorrow?: (book: Book) => void;
  onReserve?: (book: Book) => void;
  isStudent?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onViewDetails,
  onBorrow,
  onReserve,
  isStudent = false,
}) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            {book.category}
          </span>
          <StatusBadge status={isAvailable ? 'available' : 'unavailable'} />
        </div>

        <h3
          onClick={() => onViewDetails(book)}
          className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 mb-1"
        >
          {book.title}
        </h3>

        <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mb-3">
          <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{book.author}</span>
        </p>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {book.description || 'No description provided.'}
        </p>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-slate-400" />
            <span className="font-mono truncate">{book.isbn}</span>
          </div>
          <div className="flex items-center gap-1 justify-end font-medium text-slate-700">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>
              {book.availableCopies} / {book.totalCopies} Copies
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onViewDetails(book)}
          className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Details
        </button>

        {isStudent && (
          <>
            {isAvailable ? (
              <button
                onClick={() => onBorrow && onBorrow(book)}
                className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-2xs"
              >
                Borrow
              </button>
            ) : (
              <button
                onClick={() => onReserve && onReserve(book)}
                className="flex-1 py-1.5 px-3 text-xs font-semibold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Reserve
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
