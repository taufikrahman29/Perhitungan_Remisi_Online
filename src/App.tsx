import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DB } from './lib/db';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataWargaBinaan from './pages/DataWargaBinaan';
import Perhitungan from './pages/Perhitungan';
import TelramDigital from './pages/TelramDigital';
import Riwayat from './pages/Riwayat';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('auth_token') === 'logged_in';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    DB.init();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="warga-binaan" element={<DataWargaBinaan />} />
          <Route path="perhitungan" element={<Perhitungan />} />
          <Route path="telram" element={<TelramDigital />} />
          <Route path="riwayat" element={<Riwayat />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
