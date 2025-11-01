// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorManager from '../components/DoctorManager.jsx'; // Impor manager dokter
import LeaveManager from '../components/LeaveManager.jsx';  // Impor manager cuti

// Komponen Tab
const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`py-2 px-4 font-semibold rounded-t-lg ${
      isActive
        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doctors'); // State untuk tab

  const handleLogout = async () => {
    try {
      await fetch('/.netlify/functions/logout', { method: 'POST' });
    } catch (err) {
      console.error('Gagal logout dari server', err);
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </header>
      
      {/* Navigasi Tab */}
      <nav className="flex space-x-2 mb-0">
        <TabButton
          isActive={activeTab === 'doctors'}
          onClick={() => setActiveTab('doctors')}
        >
          Manajemen Dokter
        </TabButton>
        <TabButton
          isActive={activeTab === 'leaves'}
          onClick={() => setActiveTab('leaves')}
        >
          Manajemen Cuti
        </TabButton>
      </nav>

      {/* Konten Tab */}
      <main className="mt-0">
        {activeTab === 'doctors' && <DoctorManager />}
        {activeTab === 'leaves' && <LeaveManager />}
      </main>
    </div>
  );
}