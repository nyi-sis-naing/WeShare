# WeShare 💸

WeShare is a modern, full-stack group expense sharing and budget tracking web application designed to make splitting bills, managing balances, and tracking shared costs seamless and transparent.

---

## ✨ Features

- **User Authentication**: Secure registration and login using JWT and bcrypt.
- **Group Management**: Create groups, invite members, and track shared balances.
- **Expense Tracking & Splitting**:
  - Add expenses with categories, receipts/notes, and dates.
  - Split equally or with custom amounts among members.
  - Interactive activity calendar and visual breakdowns.
- **Real-Time Balances & Settlements**:
  - Automatically calculate who owes whom.
  - Settle debts with one click.
- **Responsive & Modern UI**: Built with React, Vite, and Lucide icons for a clean, intuitive experience.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**
- **Vite**
- **Lucide React** (Modern Icons)
- **Vanilla CSS** (Custom responsive design system)

### Backend
- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **JWT** (JSON Web Tokens) & **bcryptjs**
- **CORS** & **dotenv**

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB database (local or MongoDB Atlas)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/WeShare.git
cd WeShare
```

### 3. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (refer to `.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

Start the backend server:
```bash
npm run dev
# or: node server.js
```

### 4. Frontend Setup
In a new terminal window:
```bash
cd ../client
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 📂 Project Structure

```
WeShare/
├── client/              # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/  # Modals, expense cards, calendar view, etc.
│   │   ├── context/     # Auth and state management
│   │   ├── pages/       # Dashboard, Group, Login, Register, etc.
│   │   └── services/    # API calls to backend
│   └── package.json
├── server/              # Express backend & MongoDB models
│   ├── controllers/     # Route handlers (auth, expenses, groups)
│   ├── middleware/      # JWT auth middleware
│   ├── models/         # Mongoose schemas (User, Group, Expense)
│   ├── routes/         # Express routes
│   ├── .env.example    # Environment variables template
│   └── server.js       # Entry point
├── .gitignore          # Git ignore configuration
└── README.md           # Documentation
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
