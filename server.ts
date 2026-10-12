import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import {
  getCollection,
  seedMemoryStore,
} from './src/lib/db';
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from './src/lib/auth';
import { calculateFine } from './src/lib/utils';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize seed data
  await seedMemoryStore();

  // -----------------------------
  // AUTHENTICATION APIs
  // -----------------------------

  // POST /api/auth/register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const usersCol = await getCollection('users');
      const existingUser = await usersCol.findOne({ email: email.toLowerCase().trim() });

      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }

      const hashedPassword = await hashPassword(password);
      const userRole = role === 'admin' ? 'admin' : 'student';

      const newUser = {
        _id: 'usr_' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: userRole,
        createdAt: new Date().toISOString(),
      };

      await usersCol.insertOne(newUser);

      const token = generateToken({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role as any,
        name: newUser.name,
      });

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const usersCol = await getCollection('users');
      const user = await usersCol.findOne({ email: email.toLowerCase().trim() });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return res.json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  // GET /api/auth/me
  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const usersCol = await getCollection('users');
      const user = await usersCol.findOne({ _id: req.user?.id });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // PUT /api/auth/profile
  app.put('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, currentPassword, newPassword } = req.body;
      const usersCol = await getCollection('users');
      const user = await usersCol.findOne({ _id: req.user?.id });

      if (!user) return res.status(404).json({ error: 'User not found' });

      const updates: any = {};
      if (name) updates.name = name.trim();
      if (email && email !== user.email) {
        const existing = await usersCol.findOne({ email: email.toLowerCase().trim() });
        if (existing) return res.status(400).json({ error: 'Email already in use' });
        updates.email = email.toLowerCase().trim();
      }

      if (newPassword) {
        if (!currentPassword) return res.status(400).json({ error: 'Current password required' });
        const match = await comparePassword(currentPassword, user.password);
        if (!match) return res.status(400).json({ error: 'Current password incorrect' });
        updates.password = await hashPassword(newPassword);
      }

      await usersCol.updateOne({ _id: user._id }, { $set: updates });

      const updatedUser = await usersCol.findOne({ _id: user._id });
      return res.json({
        message: 'Profile updated successfully',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // -----------------------------
  // BOOKS APIs
  // -----------------------------

  // GET /api/books
  app.get('/api/books', async (req: Request, res: Response) => {
    try {
      const { search, category, availableOnly } = req.query;
      const booksCol = await getCollection('books');
      let books = await booksCol.find();

      if (search) {
        const q = String(search).toLowerCase();
        books = books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.isbn.toLowerCase().includes(q) ||
            b.publisher.toLowerCase().includes(q)
        );
      }

      if (category && category !== 'All') {
        books = books.filter((b) => b.category === category);
      }

      if (availableOnly === 'true') {
        books = books.filter((b) => b.availableCopies > 0);
      }

      return res.json(books);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch books' });
    }
  });

  // GET /api/books/:id
  app.get('/api/books/:id', async (req: Request, res: Response) => {
    try {
      const booksCol = await getCollection('books');
      const book = await booksCol.findOne({ _id: req.params.id });

      if (!book) return res.status(404).json({ error: 'Book not found' });
      return res.json(book);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch book' });
    }
  });

  // POST /api/books (Admin)
  app.post('/api/books', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { title, author, isbn, category, publisher, publicationYear, totalCopies, description } = req.body;

      if (!title || !author || !isbn || !category || !totalCopies) {
        return res.status(400).json({ error: 'Missing required book details.' });
      }

      const booksCol = await getCollection('books');
      const existingIsbn = await booksCol.findOne({ isbn: isbn.trim() });
      if (existingIsbn) {
        return res.status(400).json({ error: 'Book with this ISBN already exists.' });
      }

      const total = parseInt(totalCopies, 10);
      const newBook = {
        _id: 'bk_' + Date.now(),
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category: category.trim(),
        publisher: publisher ? publisher.trim() : 'Academic Press',
        publicationYear: publicationYear ? parseInt(publicationYear, 10) : new Date().getFullYear(),
        totalCopies: total,
        availableCopies: total,
        description: description ? description.trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await booksCol.insertOne(newBook);
      return res.status(201).json(newBook);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create book' });
    }
  });

  // PUT /api/books/:id (Admin)
  app.put('/api/books/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const booksCol = await getCollection('books');
      const book = await booksCol.findOne({ _id: req.params.id });
      if (!book) return res.status(404).json({ error: 'Book not found' });

      const { title, author, isbn, category, publisher, publicationYear, totalCopies, description } = req.body;

      const newTotal = totalCopies !== undefined ? parseInt(totalCopies, 10) : book.totalCopies;
      const copiesDiff = newTotal - book.totalCopies;
      const newAvailable = Math.max(0, book.availableCopies + copiesDiff);

      const updates = {
        title: title ? title.trim() : book.title,
        author: author ? author.trim() : book.author,
        isbn: isbn ? isbn.trim() : book.isbn,
        category: category ? category.trim() : book.category,
        publisher: publisher ? publisher.trim() : book.publisher,
        publicationYear: publicationYear ? parseInt(publicationYear, 10) : book.publicationYear,
        totalCopies: newTotal,
        availableCopies: newAvailable,
        description: description !== undefined ? description.trim() : book.description,
        updatedAt: new Date().toISOString(),
      };

      await booksCol.updateOne({ _id: req.params.id }, { $set: updates });
      const updatedBook = await booksCol.findOne({ _id: req.params.id });
      return res.json(updatedBook);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update book' });
    }
  });

  // DELETE /api/books/:id (Admin)
  app.delete('/api/books/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const booksCol = await getCollection('books');
      const borrowingsCol = await getCollection('borrowings');

      // Check if book has active borrowings
      const activeBorrowings = await borrowingsCol.find({ bookId: req.params.id, status: 'borrowed' });
      if (activeBorrowings.length > 0) {
        return res.status(400).json({ error: 'Cannot delete book with active borrowings.' });
      }

      await booksCol.deleteOne({ _id: req.params.id });
      return res.json({ message: 'Book deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete book' });
    }
  });

  // -----------------------------
  // BORROWINGS APIs
  // -----------------------------

  // GET /api/borrowings
  app.get('/api/borrowings', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const borrowingsCol = await getCollection('borrowings');
      let borrowings;

      if (req.user?.role === 'admin') {
        borrowings = await borrowingsCol.find();
      } else {
        borrowings = await borrowingsCol.find({ userId: req.user?.id });
      }

      // Update overdue status dynamically
      const finePerDay = parseFloat(process.env.FINE_PER_DAY || '2.00');
      const updatedList = borrowings.map((b) => {
        if (b.status === 'borrowed' || b.status === 'renewed') {
          const calc = calculateFine(b.dueDate, new Date().toISOString(), finePerDay);
          if (calc.overdueDays > 0) {
            return { ...b, status: 'overdue', fineAmount: calc.fineAmount };
          }
        }
        return b;
      });

      return res.json(updatedList);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch borrowings' });
    }
  });

  // POST /api/borrowings (Borrow Book)
  app.post('/api/borrowings', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { bookId, targetUserId } = req.body;
      const borrowerId = req.user?.role === 'admin' && targetUserId ? targetUserId : req.user?.id;

      if (!bookId || !borrowerId) {
        return res.status(400).json({ error: 'Book ID and User ID are required.' });
      }

      const booksCol = await getCollection('books');
      const usersCol = await getCollection('users');
      const borrowingsCol = await getCollection('borrowings');
      const notificationsCol = await getCollection('notifications');

      const book = await booksCol.findOne({ _id: bookId });
      if (!book) return res.status(404).json({ error: 'Book not found' });

      if (book.availableCopies <= 0) {
        return res.status(400).json({ error: 'No copies available for borrowing. You can place a reservation instead.' });
      }

      const user = await usersCol.findOne({ _id: borrowerId });
      if (!user) return res.status(404).json({ error: 'Borrower user not found' });

      // Check if user already borrowed this book
      const existing = await borrowingsCol.findOne({
        userId: borrowerId,
        bookId: book._id,
        status: { $in: ['borrowed', 'overdue', 'renewed'] },
      });

      if (existing) {
        return res.status(400).json({ error: 'You currently have an active borrowing for this book.' });
      }

      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days lending period

      const newBorrowing = {
        _id: 'bor_' + Date.now(),
        userId: user._id,
        bookId: book._id,
        userName: user.name,
        userEmail: user.email,
        bookTitle: book.title,
        bookIsbn: book.isbn,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status: 'borrowed',
        fineAmount: 0,
        renewCount: 0,
      };

      await borrowingsCol.insertOne(newBorrowing);
      await booksCol.updateOne({ _id: book._id }, { $inc: { availableCopies: -1 } });

      // Create Notification
      await notificationsCol.insertOne({
        _id: 'notif_' + Date.now(),
        userId: user._id,
        title: 'Book Borrowed Successfully',
        message: `You have borrowed "${book.title}". Due date is ${dueDate.toISOString().split('T')[0]}.`,
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json(newBorrowing);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to borrow book' });
    }
  });

  // PUT /api/borrowings/:id/return (Process Return)
  app.put('/api/borrowings/:id/return', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const borrowingsCol = await getCollection('borrowings');
      const booksCol = await getCollection('books');
      const finesCol = await getCollection('fines');
      const notificationsCol = await getCollection('notifications');
      const reservationsCol = await getCollection('reservations');

      const borrowing = await borrowingsCol.findOne({ _id: req.params.id });
      if (!borrowing) return res.status(404).json({ error: 'Borrowing record not found' });

      if (borrowing.status === 'returned') {
        return res.status(400).json({ error: 'Book has already been returned.' });
      }

      const returnDate = new Date().toISOString();
      const finePerDay = parseFloat(process.env.FINE_PER_DAY || '2.00');
      const fineCalc = calculateFine(borrowing.dueDate, returnDate, finePerDay);

      // Update Borrowing Record
      await borrowingsCol.updateOne(
        { _id: borrowing._id },
        {
          $set: {
            returnDate,
            status: 'returned',
            fineAmount: fineCalc.fineAmount,
          },
        }
      );

      // Increment Available Copies
      await booksCol.updateOne({ _id: borrowing.bookId }, { $inc: { availableCopies: 1 } });

      // If fine incurred, create fine record
      if (fineCalc.fineAmount > 0) {
        await finesCol.insertOne({
          _id: 'fn_' + Date.now(),
          userId: borrowing.userId,
          borrowingId: borrowing._id,
          userName: borrowing.userName,
          bookTitle: borrowing.bookTitle,
          amount: fineCalc.fineAmount,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }

      // Check active reservations for this book
      const activeRes = await reservationsCol.findOne({
        bookId: borrowing.bookId,
        status: 'active',
      });

      if (activeRes) {
        await notificationsCol.insertOne({
          _id: 'notif_res_' + Date.now(),
          userId: activeRes.userId,
          title: 'Reserved Book Available!',
          message: `The book "${borrowing.bookTitle}" you reserved is now available at the library library desk.`,
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Return Notification to student
      await notificationsCol.insertOne({
        _id: 'notif_' + Date.now(),
        userId: borrowing.userId,
        title: 'Book Returned',
        message: `"${borrowing.bookTitle}" has been returned.` + (fineCalc.fineAmount > 0 ? ` Overdue fine generated: $${fineCalc.fineAmount.toFixed(2)}.` : ''),
        type: fineCalc.fineAmount > 0 ? 'warning' : 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        message: 'Book returned successfully',
        fineIncurred: fineCalc.fineAmount,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to process return' });
    }
  });

  // PUT /api/borrowings/:id/renew (Renew Book)
  app.put('/api/borrowings/:id/renew', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const borrowingsCol = await getCollection('borrowings');
      const borrowing = await borrowingsCol.findOne({ _id: req.params.id });

      if (!borrowing) return res.status(404).json({ error: 'Borrowing record not found' });
      if (borrowing.status === 'returned') return res.status(400).json({ error: 'Returned books cannot be renewed.' });

      if ((borrowing.renewCount || 0) >= 2) {
        return res.status(400).json({ error: 'Maximum renewal limit reached (2 renewals allowed per book).' });
      }

      const currentDueDate = new Date(borrowing.dueDate);
      currentDueDate.setDate(currentDueDate.getDate() + 7); // Extend by 7 days

      await borrowingsCol.updateOne(
        { _id: borrowing._id },
        {
          $set: {
            dueDate: currentDueDate.toISOString(),
            status: 'renewed',
            renewCount: (borrowing.renewCount || 0) + 1,
          },
        }
      );

      return res.json({
        message: 'Borrowing renewed for 7 additional days.',
        newDueDate: currentDueDate.toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to renew book' });
    }
  });

  // -----------------------------
  // RESERVATIONS APIs
  // -----------------------------

  // GET /api/reservations
  app.get('/api/reservations', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const reservationsCol = await getCollection('reservations');
      let reservations;
      if (req.user?.role === 'admin') {
        reservations = await reservationsCol.find();
      } else {
        reservations = await reservationsCol.find({ userId: req.user?.id });
      }
      return res.json(reservations);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  });

  // POST /api/reservations
  app.post('/api/reservations', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { bookId } = req.body;
      const booksCol = await getCollection('books');
      const reservationsCol = await getCollection('reservations');

      const book = await booksCol.findOne({ _id: bookId });
      if (!book) return res.status(404).json({ error: 'Book not found' });

      // Check duplicate active reservation
      const existingRes = await reservationsCol.findOne({
        userId: req.user?.id,
        bookId: book._id,
        status: 'active',
      });

      if (existingRes) {
        return res.status(400).json({ error: 'You already have an active reservation for this book.' });
      }

      const newReservation = {
        _id: 'res_' + Date.now(),
        userId: req.user?.id,
        bookId: book._id,
        userName: req.user?.name,
        userEmail: req.user?.email,
        bookTitle: book.title,
        reservationDate: new Date().toISOString(),
        status: 'active',
      };

      await reservationsCol.insertOne(newReservation);
      return res.status(201).json(newReservation);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to place reservation' });
    }
  });

  // PUT /api/reservations/:id (Fulfill/Cancel)
  app.put('/api/reservations/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body; // 'fulfilled' | 'cancelled'
      const reservationsCol = await getCollection('reservations');
      const reservation = await reservationsCol.findOne({ _id: req.params.id });

      if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

      if (req.user?.role !== 'admin' && reservation.userId !== req.user?.id) {
        return res.status(403).json({ error: 'Not authorized to modify this reservation' });
      }

      await reservationsCol.updateOne({ _id: reservation._id }, { $set: { status } });
      return res.json({ message: `Reservation status updated to ${status}` });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update reservation' });
    }
  });

  // -----------------------------
  // DIGITAL RESOURCES APIs
  // -----------------------------

  // GET /api/resources
  app.get('/api/resources', async (req: Request, res: Response) => {
    try {
      const resourcesCol = await getCollection('digitalResources');
      const resources = await resourcesCol.find();
      return res.json(resources);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch digital resources' });
    }
  });

  // POST /api/resources (Admin)
  app.post('/api/resources', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, category, resourceUrl, accessType } = req.body;
      if (!title || !resourceUrl || !category) {
        return res.status(400).json({ error: 'Title, category, and URL are required.' });
      }

      const resourcesCol = await getCollection('digitalResources');
      const newResource = {
        _id: 'res_d_' + Date.now(),
        title: title.trim(),
        description: description ? description.trim() : '',
        category: category.trim(),
        resourceUrl: resourceUrl.trim(),
        accessType: accessType || 'Open Access',
        createdAt: new Date().toISOString(),
      };

      await resourcesCol.insertOne(newResource);
      return res.status(201).json(newResource);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create resource' });
    }
  });

  // PUT /api/resources/:id (Admin)
  app.put('/api/resources/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const resourcesCol = await getCollection('digitalResources');
      const resource = await resourcesCol.findOne({ _id: req.params.id });
      if (!resource) return res.status(404).json({ error: 'Resource not found' });

      const { title, description, category, resourceUrl, accessType } = req.body;
      const updates = {
        title: title ? title.trim() : resource.title,
        description: description !== undefined ? description.trim() : resource.description,
        category: category ? category.trim() : resource.category,
        resourceUrl: resourceUrl ? resourceUrl.trim() : resource.resourceUrl,
        accessType: accessType || resource.accessType,
      };

      await resourcesCol.updateOne({ _id: req.params.id }, { $set: updates });
      const updated = await resourcesCol.findOne({ _id: req.params.id });
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update resource' });
    }
  });

  // DELETE /api/resources/:id (Admin)
  app.delete('/api/resources/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const resourcesCol = await getCollection('digitalResources');
      await resourcesCol.deleteOne({ _id: req.params.id });
      return res.json({ message: 'Resource deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete resource' });
    }
  });

  // -----------------------------
  // NOTIFICATIONS APIs
  // -----------------------------

  // GET /api/notifications
  app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const notificationsCol = await getCollection('notifications');
      const list = await notificationsCol.find({ userId: req.user?.id });
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // POST /api/notifications (Admin broadcast/send)
  app.post('/api/notifications', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { userId, title, message, type } = req.body;
      const notificationsCol = await getCollection('notifications');
      const usersCol = await getCollection('users');

      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required.' });
      }

      if (userId === 'all') {
        const students = await usersCol.find({ role: 'student' });
        const now = new Date().toISOString();
        for (const s of students) {
          await notificationsCol.insertOne({
            _id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            userId: s._id,
            title: title.trim(),
            message: message.trim(),
            type: type || 'info',
            isRead: false,
            createdAt: now,
          });
        }
        return res.json({ message: `Notification sent to all ${students.length} students.` });
      } else {
        const notif = {
          _id: 'notif_' + Date.now(),
          userId,
          title: title.trim(),
          message: message.trim(),
          type: type || 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        await notificationsCol.insertOne(notif);
        return res.status(201).json(notif);
      }
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // PUT /api/notifications/:id/read
  app.put('/api/notifications/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const notificationsCol = await getCollection('notifications');
      await notificationsCol.updateOne(
        { _id: req.params.id, userId: req.user?.id },
        { $set: { isRead: true } }
      );
      return res.json({ message: 'Marked as read' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  // -----------------------------
  // FINES APIs
  // -----------------------------

  // GET /api/fines
  app.get('/api/fines', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const finesCol = await getCollection('fines');
      let fines;
      if (req.user?.role === 'admin') {
        fines = await finesCol.find();
      } else {
        fines = await finesCol.find({ userId: req.user?.id });
      }
      return res.json(fines);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch fines' });
    }
  });

  // PUT /api/fines/:id (Mark as Paid)
  app.put('/api/fines/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const finesCol = await getCollection('fines');
      const fine = await finesCol.findOne({ _id: req.params.id });

      if (!fine) return res.status(404).json({ error: 'Fine record not found' });

      await finesCol.updateOne(
        { _id: fine._id },
        { $set: { status: 'paid', paidAt: new Date().toISOString() } }
      );

      return res.json({ message: 'Fine marked as paid successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update fine' });
    }
  });

  // -----------------------------
  // ADMIN DASHBOARD & USER MANAGEMENT
  // -----------------------------

  // GET /api/admin/dashboard
  app.get('/api/admin/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const booksCol = await getCollection('books');
      const usersCol = await getCollection('users');
      const borrowingsCol = await getCollection('borrowings');
      const reservationsCol = await getCollection('reservations');
      const finesCol = await getCollection('fines');

      const allBooks = await booksCol.find();
      const allUsers = await usersCol.find();
      const allBorrowings = await borrowingsCol.find();
      const allReservations = await reservationsCol.find();
      const allFines = await finesCol.find();

      const totalBooks = allBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      const availableBooks = allBooks.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
      const borrowedBooks = allBorrowings.filter((b) => b.status === 'borrowed' || b.status === 'renewed').length;
      const overdueBooks = allBorrowings.filter((b) => b.status === 'overdue').length;
      const totalStudents = allUsers.filter((u) => u.role === 'student').length;
      const activeReservations = allReservations.filter((r) => r.status === 'active').length;
      const pendingFinesAmount = allFines
        .filter((f) => f.status === 'pending')
        .reduce((acc, f) => acc + (f.amount || 0), 0);

      // Most borrowed books calculation
      const bookCounts: Record<string, { title: string; author: string; count: number }> = {};
      allBorrowings.forEach((b) => {
        if (!bookCounts[b.bookId]) {
          bookCounts[b.bookId] = { title: b.bookTitle || 'Unknown Book', author: '', count: 0 };
        }
        bookCounts[b.bookId].count += 1;
      });

      const mostBorrowedBooks = Object.values(bookCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Category breakdown
      const catCounts: Record<string, number> = {};
      allBooks.forEach((b) => {
        catCounts[b.category] = (catCounts[b.category] || 0) + 1;
      });

      const categoryBreakdown = Object.entries(catCounts).map(([category, count]) => ({
        category,
        count,
      }));

      return res.json({
        totalBooks,
        availableBooks,
        borrowedBooks,
        totalStudents,
        overdueBooks,
        activeReservations,
        pendingFinesAmount,
        mostBorrowedBooks,
        categoryBreakdown,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to load dashboard statistics' });
    }
  });

  // GET /api/admin/users
  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const usersCol = await getCollection('users');
      const borrowingsCol = await getCollection('borrowings');

      const users = await usersCol.find({ role: 'student' });
      const borrowings = await borrowingsCol.find();

      const userSummaries = users.map((u) => {
        const uBorrowings = borrowings.filter((b) => b.userId === u._id);
        const active = uBorrowings.filter((b) => b.status === 'borrowed' || b.status === 'overdue' || b.status === 'renewed').length;
        const total = uBorrowings.length;
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          activeBorrowings: active,
          totalBorrowings: total,
        };
      });

      return res.json(userSummaries);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch student directory' });
    }
  });

  // POST /api/seed
  app.post('/api/seed', async (req: Request, res: Response) => {
    try {
      await seedMemoryStore(true);
      return res.json({ message: 'Database reset and successfully re-seeded with demo data.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to seed database' });
    }
  });

  // -----------------------------
  // VITE DEV MIDDLEWARE / STATIC SERVING
  // -----------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  const PORT = parseInt(process.env.PORT || '3000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digital Library Management System running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
