// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Cookies from 'js-cookie'; // <-- Impor js-cookie

// Komponen untuk melindungi route
function ProtectedRoute({ children }) {
  // Cek apakah cookie 'nf_auth' (Netlify Auth) ada
  const isAuthenticated = !!Cookies.get('nf_auth');

  // Jika sudah login, tampilkan halaman (children)
  // Jika belum, lempar ke halaman login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Redirect halaman utama ke dashboard jika sudah login, jika belum ke login */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;