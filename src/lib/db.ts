import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';

const rawMongoUri = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'digital_library';

// Helper to determine if MONGODB_URI is a dummy or unconfigured placeholder
function isPlaceholderUri(uri: string): boolean {
  if (!uri || !uri.trim()) return true;
  const lower = uri.toLowerCase();
  return (
    lower.includes('username:password') ||
    lower.includes('cluster.mongodb.net') ||
    lower.includes('your_mongodb') ||
    lower.includes('my_mongodb') ||
    lower.includes('user:pass')
  );
}

const MONGODB_URI = isPlaceholderUri(rawMongoUri) ? '' : rawMongoUri;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionFailed = false;

// In-Memory store for preview environment when Atlas URI is not configured
interface MemoryDb {
  users: any[];
  books: any[];
  borrowings: any[];
  reservations: any[];
  digitalResources: any[];
  notifications: any[];
  fines: any[];
}

const memoryStore: MemoryDb = {
  users: [],
  books: [],
  borrowings: [],
  reservations: [],
  digitalResources: [],
  notifications: [],
  fines: [],
};

let isStoreSeeded = false;

export async function connectToDatabase(): Promise<{ client: MongoClient | null; db: Db | null; isMemory: boolean }> {
  if (MONGODB_URI && !connectionFailed) {
    try {
      if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb, isMemory: false };
      }
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      await client.connect();
      const db = client.db(MONGODB_DB);
      cachedClient = client;
      cachedDb = db;
      return { client, db, isMemory: false };
    } catch (err: any) {
      console.warn('MongoDB Atlas connection failed. Falling back to in-memory database store.');
      connectionFailed = true;
    }
  }

  // Ensure in-memory database is initialized with seed data
  if (!isStoreSeeded) {
    await seedMemoryStore();
  }

  return { client: null, db: null, isMemory: true };
}

// Memory database helper for local preview mode
export class MemoryCollection {
  constructor(private name: keyof MemoryDb) {}

  async find(query: any = {}): Promise<any[]> {
    let items = memoryStore[this.name] || [];
    return items.filter((item) => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query: any): Promise<any | null> {
    const items = await this.find(query);
    return items[0] || null;
  }

  async insertOne(doc: any): Promise<{ insertedId: string }> {
    const _id = doc._id || 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const newDoc = { ...doc, _id };
    memoryStore[this.name].push(newDoc);
    return { insertedId: _id };
  }

  async updateOne(query: any, update: any): Promise<{ modifiedCount: number }> {
    const item = await this.findOne(query);
    if (!item) return { modifiedCount: 0 };

    if (update.$set) {
      Object.assign(item, update.$set);
    }
    if (update.$inc) {
      for (const k in update.$inc) {
        item[k] = (item[k] || 0) + update.$inc[k];
      }
    }
    return { modifiedCount: 1 };
  }

  async deleteOne(query: any): Promise<{ deletedCount: number }> {
    const index = memoryStore[this.name].findIndex((item) => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index !== -1) {
      memoryStore[this.name].splice(index, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async countDocuments(query: any = {}): Promise<number> {
    const items = await this.find(query);
    return items.length;
  }
}

// Unified Database Provider
export async function getCollection(collectionName: keyof MemoryDb) {
  const { db, isMemory } = await connectToDatabase();
  if (isMemory || !db) {
    return new MemoryCollection(collectionName);
  }
  return {
    find: async (query: any = {}) => db.collection(collectionName).find(query).toArray(),
    findOne: async (query: any) => db.collection(collectionName).findOne(query),
    insertOne: async (doc: any) => db.collection(collectionName).insertOne(doc),
    updateOne: async (query: any, update: any) => db.collection(collectionName).updateOne(query, update),
    deleteOne: async (query: any) => db.collection(collectionName).deleteOne(query),
    countDocuments: async (query: any = {}) => db.collection(collectionName).countDocuments(query),
  };
}

// Seed Demo Data
export async function seedMemoryStore(forceReset = false) {
  if (isStoreSeeded && !forceReset) return;

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  const now = new Date().toISOString();

  // Users
  memoryStore.users = [
    {
      _id: 'usr_admin_1',
      name: 'Dr. Robert Vance (Head Librarian)',
      email: 'admin@library.edu',
      password: adminPasswordHash,
      role: 'admin',
      createdAt: now,
    },
    {
      _id: 'usr_student_1',
      name: 'Alex Johnson',
      email: 'alex.student@library.edu',
      password: studentPasswordHash,
      role: 'student',
      createdAt: now,
    },
    {
      _id: 'usr_student_2',
      name: 'Priya Sharma',
      email: 'priya.sharma@library.edu',
      password: studentPasswordHash,
      role: 'student',
      createdAt: now,
    },
    {
      _id: 'usr_student_3',
      name: 'David Chen',
      email: 'david.chen@library.edu',
      password: studentPasswordHash,
      role: 'student',
      createdAt: now,
    },
  ];

  // Books (12 books across 5 categories)
  memoryStore.books = [
    {
      _id: 'bk_1',
      title: 'Introduction to Algorithms (4th Edition)',
      author: 'Thomas H. Cormen, Charles E. Leiserson',
      isbn: '9780262046305',
      category: 'Computer Science',
      publisher: 'MIT Press',
      publicationYear: 2022,
      totalCopies: 5,
      availableCopies: 3,
      description: 'Comprehensive reference text on modern computer algorithms, data structures, dynamic programming, and complexity analysis.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_2',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      category: 'Computer Science',
      publisher: 'Prentice Hall',
      publicationYear: 2008,
      totalCopies: 4,
      availableCopies: 2,
      description: 'Essential software engineering practices for writing readable, maintainable, and refactored code.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_3',
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz, Peter B. Galvin',
      isbn: '9781119800361',
      category: 'Computer Science',
      publisher: 'Wiley',
      publicationYear: 2021,
      totalCopies: 3,
      availableCopies: 1,
      description: 'Core principles of process scheduling, virtual memory management, concurrency, and distributed file systems.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_4',
      title: 'Microelectronic Circuits',
      author: 'Adel S. Sedra, Kenneth C. Smith',
      isbn: '9780190853464',
      category: 'Electronics',
      publisher: 'Oxford University Press',
      publicationYear: 2019,
      totalCopies: 4,
      availableCopies: 0,
      description: 'Fundamental semiconductor electronics, operational amplifiers, MOSFET design, and integrated circuit engineering.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_5',
      title: 'Digital Signal Processing: Principles, Algorithms & Applications',
      author: 'John G. Proakis, Dimitris G. Manolakis',
      isbn: '9780131873742',
      category: 'Electronics',
      publisher: 'Pearson',
      publicationYear: 2007,
      totalCopies: 3,
      availableCopies: 2,
      description: 'Fourier transforms, z-transforms, digital filter design, and spectrum estimation techniques.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_6',
      title: 'Fluid Mechanics & Thermodynamics of Turbomachinery',
      author: 'S.L. Dixon, C.A. Hall',
      isbn: '9780124159549',
      category: 'Mechanical Engineering',
      publisher: 'Butterworth-Heinemann',
      publicationYear: 2014,
      totalCopies: 3,
      availableCopies: 3,
      description: 'Theoretical and applied principles governing axial turbines, centrifugal compressors, and fluid dynamics.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_7',
      title: 'Shigleys Mechanical Engineering Design',
      author: 'Richard G. Budynas, Keith J. Nisbett',
      isbn: '9780073398204',
      category: 'Mechanical Engineering',
      publisher: 'McGraw-Hill',
      publicationYear: 2020,
      totalCopies: 4,
      availableCopies: 3,
      description: 'Standard handbook for machine element design, stress analysis, failure prevention, and structural integrity.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_8',
      title: 'Quantum Physics: Berkeley Physics Course Vol 4',
      author: 'Eyvind H. Wichmann',
      isbn: '9780070048614',
      category: 'Physics',
      publisher: 'McGraw-Hill',
      publicationYear: 1971,
      totalCopies: 2,
      availableCopies: 2,
      description: 'Foundations of quantum phenomena, wave mechanics, atomic spectra, and photon interactions.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_9',
      title: 'Classical Mechanics (3rd Edition)',
      author: 'Herbert Goldstein, Charles P. Poole',
      isbn: '9780201657029',
      category: 'Physics',
      publisher: 'Pearson',
      publicationYear: 2001,
      totalCopies: 3,
      availableCopies: 1,
      description: 'Advanced Lagrangian and Hamiltonian formulations, rigid body kinematics, and canonical transformations.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_10',
      title: 'Linear Algebra and Its Applications',
      author: 'David C. Lay, Steven R. Lay',
      isbn: '9780321982384',
      category: 'Mathematics',
      publisher: 'Pearson',
      publicationYear: 2015,
      totalCopies: 5,
      availableCopies: 4,
      description: 'Vector spaces, matrix operations, eigenvalues, eigenvectors, and singular value decomposition.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_11',
      title: 'Probability and Statistics for Engineers and Scientists',
      author: 'Ronald E. Walpole, Raymond H. Myers',
      isbn: '9780321629111',
      category: 'Mathematics',
      publisher: 'Pearson',
      publicationYear: 2016,
      totalCopies: 4,
      availableCopies: 3,
      description: 'Random variables, probability distributions, hypothesis testing, regression analysis, and ANOVA.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'bk_12',
      title: 'Database System Concepts (7th Edition)',
      author: 'Abraham Silberschatz, Henry F. Korth',
      isbn: '9780078022159',
      category: 'Computer Science',
      publisher: 'McGraw-Hill',
      publicationYear: 2019,
      totalCopies: 4,
      availableCopies: 3,
      description: 'Relational database architecture, SQL queries, transaction processing, normalization, and distributed storage.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Dates helper
  const pastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  const futureDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString();
  };

  // Sample Borrowings
  memoryStore.borrowings = [
    {
      _id: 'bor_1',
      userId: 'usr_student_1',
      bookId: 'bk_1',
      userName: 'Alex Johnson',
      bookTitle: 'Introduction to Algorithms (4th Edition)',
      issueDate: pastDate(10),
      dueDate: futureDate(4),
      status: 'borrowed',
      fineAmount: 0,
      renewCount: 0,
    },
    {
      _id: 'bor_2',
      userId: 'usr_student_1',
      bookId: 'bk_2',
      userName: 'Alex Johnson',
      bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      issueDate: pastDate(20),
      dueDate: pastDate(6),
      status: 'overdue',
      fineAmount: 12.0,
      renewCount: 0,
    },
    {
      _id: 'bor_3',
      userId: 'usr_student_2',
      bookId: 'bk_3',
      userName: 'Priya Sharma',
      bookTitle: 'Operating System Concepts',
      issueDate: pastDate(5),
      dueDate: futureDate(9),
      status: 'borrowed',
      fineAmount: 0,
      renewCount: 0,
    },
    {
      _id: 'bor_4',
      userId: 'usr_student_2',
      bookId: 'bk_4',
      userName: 'Priya Sharma',
      bookTitle: 'Microelectronic Circuits',
      issueDate: pastDate(18),
      dueDate: pastDate(4),
      status: 'overdue',
      fineAmount: 8.0,
      renewCount: 0,
    },
    {
      _id: 'bor_5',
      userId: 'usr_student_3',
      bookId: 'bk_9',
      userName: 'David Chen',
      bookTitle: 'Classical Mechanics (3rd Edition)',
      issueDate: pastDate(25),
      dueDate: pastDate(11),
      returnDate: pastDate(2),
      status: 'returned',
      fineAmount: 18.0,
      renewCount: 0,
    },
  ];

  // Sample Reservations
  memoryStore.reservations = [
    {
      _id: 'res_1',
      userId: 'usr_student_1',
      bookId: 'bk_4',
      userName: 'Alex Johnson',
      userEmail: 'alex.student@library.edu',
      bookTitle: 'Microelectronic Circuits',
      reservationDate: pastDate(2),
      status: 'active',
    },
  ];

  // Digital Resources
  memoryStore.digitalResources = [
    {
      _id: 'res_d1',
      title: 'ACM Digital Library Journal Archive',
      description: 'Access to full-text research papers in computing, networking, and software engineering.',
      category: 'Computer Science',
      resourceUrl: 'https://dl.acm.org',
      accessType: 'Institutional',
      createdAt: now,
    },
    {
      _id: 'res_d2',
      title: 'IEEE Xplore Electronics & VLSI Papers',
      description: 'Peer-reviewed articles, conference proceedings, and standards in electrical engineering.',
      category: 'Electronics',
      resourceUrl: 'https://ieeexplore.ieee.org',
      accessType: 'Institutional',
      createdAt: now,
    },
    {
      _id: 'res_d3',
      title: 'MIT OpenCourseWare Physics Lecture Series',
      description: 'Complete video lectures, downloadable problem sets, and syllabus for Quantum Mechanics.',
      category: 'Physics',
      resourceUrl: 'https://ocw.mit.edu',
      accessType: 'Open Access',
      createdAt: now,
    },
    {
      _id: 'res_d4',
      title: 'Springer Math E-Book Collection',
      description: 'Downloadable PDF textbooks covering linear algebra, calculus, and differential equations.',
      category: 'Mathematics',
      resourceUrl: 'https://link.springer.com',
      accessType: 'PDF Download',
      createdAt: now,
    },
  ];

  // Notifications
  memoryStore.notifications = [
    {
      _id: 'notif_1',
      userId: 'usr_student_1',
      title: 'Overdue Notice: Clean Code',
      message: 'Your borrowing for "Clean Code" was due 6 days ago. A fine of $12.00 has accumulated ($2.00/day). Please return it to the library desk.',
      type: 'alert',
      isRead: false,
      createdAt: pastDate(1),
    },
    {
      _id: 'notif_2',
      userId: 'usr_student_1',
      title: 'Reservation Status Active',
      message: 'Your reservation for "Microelectronic Circuits" is active. You will be notified when a copy is returned.',
      type: 'info',
      isRead: true,
      createdAt: pastDate(2),
    },
    {
      _id: 'notif_3',
      userId: 'usr_student_2',
      title: 'Book Issued Successfully',
      message: 'You have borrowed "Operating System Concepts". Due date is ' + futureDate(9).split('T')[0],
      type: 'success',
      isRead: false,
      createdAt: pastDate(5),
    },
  ];

  // Fines
  memoryStore.fines = [
    {
      _id: 'fn_1',
      userId: 'usr_student_1',
      borrowingId: 'bor_2',
      userName: 'Alex Johnson',
      bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      amount: 12.0,
      status: 'pending',
      createdAt: pastDate(6),
    },
    {
      _id: 'fn_2',
      userId: 'usr_student_2',
      borrowingId: 'bor_4',
      userName: 'Priya Sharma',
      bookTitle: 'Microelectronic Circuits',
      amount: 8.0,
      status: 'pending',
      createdAt: pastDate(4),
    },
    {
      _id: 'fn_3',
      userId: 'usr_student_3',
      borrowingId: 'bor_5',
      userName: 'David Chen',
      bookTitle: 'Classical Mechanics (3rd Edition)',
      amount: 18.0,
      status: 'paid',
      createdAt: pastDate(11),
      paidAt: pastDate(2),
    },
  ];

  isStoreSeeded = true;
  console.log('Database initialized with seed data.');
}
