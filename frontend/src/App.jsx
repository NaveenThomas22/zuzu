import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AddTransactionPage from './pages/AddTransactionPage';
import ReportsPage from './pages/ReportsPage';
import LendingPage from './pages/LendingPage';
import ProfilePage from './pages/ProfilePage';
import AccountsPage from './pages/AccountsPage';
import BillsPage from './pages/BillsPage';
import BudgetsPage from './pages/BudgetsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import TransactionsPage from './pages/TransactionsPage';
import NotificationsPage from './pages/NotificationsPage';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // or a pixel loader if you prefer, but usually it's fast
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/add" element={
            <ProtectedRoute>
              <AddTransactionPage />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/lending" element={
            <ProtectedRoute>
              <LendingPage />
            </ProtectedRoute>
          } />
          {/* Note: In instructions it was /lending/new, routing it to AddTransaction temporarily or if you have a specific page for it, but sticking to provided routes */}
          <Route path="/lending/new" element={
            <ProtectedRoute>
              <LendingPage /> 
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute>
              <AccountsPage />
            </ProtectedRoute>
          } />
          <Route path="/bills" element={
            <ProtectedRoute>
              <BillsPage />
            </ProtectedRoute>
          } />
          <Route path="/budgets" element={
            <ProtectedRoute>
              <BudgetsPage />
            </ProtectedRoute>
          } />
          <Route path="/audit-logs" element={
            <ProtectedRoute>
              <AuditLogsPage />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
