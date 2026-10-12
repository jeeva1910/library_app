# Digital Library Management System

A production-grade, full-stack **Digital Library Management System** web application built for academic colleges and university faculties.

## 🚀 Key Features

### For Students
- **Account Registration & Authentication**: Secure sign up and login with JWT and bcrypt hashing.
- **Search & Catalog Exploration**: Filter textbooks by title, author, category, ISBN, and stock availability.
- **Book Borrowing**: Self-service borrowing with 14-day lending duration and automatic available copies tracking.
- **Book Renewals**: Extend due dates by 7 days (up to 2 renewals per checked-out book).
- **Reservations**: Reserve out-of-stock books and receive notification when copies are returned.
- **Digital E-Learning Resources**: Access ACM Digital Library, IEEE Xplore, Springer math PDFs, and video lectures.
- **Overdue Fines Tracking**: Automatic daily fee calculation ($2.00 / day rate) with inline payment clearance.
- **System Notifications**: Real-time alerts for overdue books, reservation fulfillment, and borrow confirmations.

### For Librarians & Administrators
- **Executive Analytics Dashboard**: Overview of total books, active borrowings, overdue books, total students, pending fine balances, top circulation titles, and category distribution.
- **Full Book Inventory CRUD**: Create, edit, update, or remove physical book records. Automatically maintains `availableCopies`.
- **Desk Issue & Return**: Manual book issue desk and return processing.
- **Student Directory**: Inspect student profiles, total borrow history, and active borrowings count.
- **Reservation Desk**: Fulfill or cancel student reservations.
- **Digital Resource Management**: Add, update, or remove e-journals and academic media.
- **Fine Ledger Management**: Inspect student fines and mark overdue fees as paid.
- **Broadcast System Alerts**: Compose and send announcements to individual students or all enrolled students.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Redux Toolkit, Redux Thunk, React Router, Tailwind CSS, Lucide Icons.
- **Backend / API**: Express RESTful API routes with JWT authentication and bcrypt password encryption.
- **Database**: MongoDB & MongoDB Atlas (with automatic fallback to in-memory seeded store for preview/demo mode).
- **Tooling**: Vite, TypeScript, Node.js (`tsx`).

---

## 🔑 Demo Login Credentials

You can test the application using the following preset accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Head Librarian (Admin)** | `admin@library.edu` | `admin123` |
| **Student (Alex Johnson)** | `alex.student@library.edu` | `student123` |
| **Student (Priya Sharma)** | `priya.sharma@library.edu` | `student123` |
| **Student (David Chen)** | `david.chen@library.edu` | `student123` |

---

## ⚙️ MongoDB Atlas Configuration

1. Log into your [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (or use an existing cluster).
3. Create a Database User under **Database Access** with `readWrite` permissions.
4. Under **Network Access**, add IP address `0.0.0.0/0` (Allow Access from Anywhere).
5. Obtain your MongoDB Atlas connection URI string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/digital_library?retryWrites=true&w=majority
   MONGODB_DB=digital_library
   ```
6. Paste your `MONGODB_URI` inside `.env.local` or environment variables in your deployment dashboard.

---

## ☁️ Vercel Deployment Instructions

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Digital Library Management System"
   git remote add origin https://github.com/your-username/digital-library-system.git
   git push -u origin main
   ```
2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import your GitHub repository.
   - Select **Vite** or **Node.js Server** framework preset.
3. **Configure Environment Variables in Vercel**:
   Add the following under **Project Settings -> Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `MONGODB_DB`: `digital_library`
   - `JWT_SECRET`: A strong secret string for session signing.
   - `FINE_PER_DAY`: `2.00`
4. **Deploy**: Click **Deploy**. Vercel will build and host your production applet.

---

## 💻 Local Development Commands

```bash
# Install dependencies
npm install

# Start development server (Express REST API + Vite Frontend on http://localhost:3000)
npm run dev

# Build for production
npm run build
```
