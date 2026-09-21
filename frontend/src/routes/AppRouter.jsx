import { Routes, Route } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import AddTransactionPage from '../pages/AddTransactionPage';
import ReportsPage from '../pages/ReportsPage';
import LendingPage from '../pages/LendingPage';
import ProfilePage from '../pages/ProfilePage';
import AccountsPage from '../pages/AccountsPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes with app layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddTransactionPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/lending" element={<LendingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/accounts" element={<AccountsPage />} />
      </Route>
    </Routes>
  );
}
