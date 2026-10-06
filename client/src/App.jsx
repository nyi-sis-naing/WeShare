import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import OverviewPage from './pages/OverviewPage';
import RoommatesPage from './pages/RoommatesPage';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#011627] text-[#d6deeb] font-sans selection:bg-[#7fdbca] selection:text-[#011627]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/overview"
                element={
                  <ProtectedRoute>
                    <OverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roommates"
                element={
                  <ProtectedRoute>
                    <RoommatesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}