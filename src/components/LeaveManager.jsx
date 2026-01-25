// src/components/LeaveManager.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from 'react-modal';
import LoadingSpinner from './LoadingSpinner';
import { getApiBaseUrl } from '../utils/apiConfig';

// --- Icons ---
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
);
const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

// Helper API
async function fetchApi(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  let cleanPath = endpoint;

  if (cleanPath.startsWith('/.netlify/functions/api')) {
    cleanPath = cleanPath.replace('/.netlify/functions/api', '');
  } else if (cleanPath.startsWith('/.netlify/functions')) {
    cleanPath = cleanPath.replace('/.netlify/functions', '');
  }

  const url = `${baseUrl}${cleanPath}`;
  const response = await fetch(url, { ...options, credentials: 'include' });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
}

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export default function LeaveManager() {
  const [leaves, setLeaves] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    doctor_id: '',
    start_date: '',
    end_date: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });

  // Fetch Data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [leavesData, doctorsData] = await Promise.all([
        fetchApi('/.netlify/functions/api/leaves'),
        fetchApi('/.netlify/functions/api/doctors/all')
      ]);
      setLeaves(leavesData);
      setAllDoctors(doctorsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date cannot be before start date.');
      return;
    }
    setError(null);
    console.log('[LeaveManager] Submitting leave:', formData);
    try {
      const result = await fetchApi('/.netlify/functions/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-onesignal-app-id': localStorage.getItem('oneSignalAppId') || '',
          'x-onesignal-api-key': localStorage.getItem('oneSignalApiKey') || ''
        },
        body: JSON.stringify(formData),
      });
      console.log('[LeaveManager] Create success:', result);
      setFormData({ doctor_id: '', start_date: '', end_date: '' });
      fetchData();
    } catch (err) {
      console.error('[LeaveManager] Create error:', err);
      setError(err.message);
      alert(`Failed to create leave: ${err.message}`);
    }
  };

  // --- Confirm Handlers ---
  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, type: 'single', id });
  };

  const confirmClearAll = () => {
    setDeleteModal({ isOpen: true, type: 'all', id: null });
  };

  const executeAction = async () => {
    const { type, id } = deleteModal;
    setDeleteModal({ ...deleteModal, isOpen: false }); // Close immediately or wait?

    try {
      if (type === 'single') {
        console.log(`[LeaveManager] Deleting leave ID: ${id}`);
        await fetchApi(`/.netlify/functions/api/leaves?id=${id}`, { method: 'DELETE' });
        console.log('[LeaveManager] Delete success');
      } else if (type === 'all') {
        console.log('[LeaveManager] Clearing history...');
        await fetchApi(`/.netlify/functions/api/leaves?cleanup=true`, { method: 'DELETE' });
        console.log('[LeaveManager] Cleanup success');
      }
      fetchData();
    } catch (err) {
      console.error('[LeaveManager] Action Error:', err);
      setError(err.message);
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleDelete = (id) => confirmDelete(id);
  const handleClearHistory = () => confirmClearAll();

  // --- Logic for Filtering & Sorting ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Split Active vs History
  const activeLeavesRaw = [];
  const historyLeavesRaw = [];

  leaves.forEach(leave => {
    const end = new Date(leave.end_date);
    if (end >= today) {
      activeLeavesRaw.push(leave);
    } else {
      historyLeavesRaw.push(leave);
    }
  });

  // 2. Filter by Search
  const filterBySearch = (list) => {
    if (!searchTerm) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter(l => l.doctor_name.toLowerCase().includes(lower));
  };

  const activeFiltered = filterBySearch(activeLeavesRaw);
  const historyFiltered = filterBySearch(historyLeavesRaw);

  // 3. Sort Active: Nearest Start Date first
  activeFiltered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Loading Check
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ... (render content) ... */}

      {/* --- CONFIRMATION MODAL --- */}
      <Modal
        isOpen={deleteModal.isOpen}
        onRequestClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        style={{
          content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: '400px', padding: '0', borderRadius: '8px',
            border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 60 }
        }}
        contentLabel="Confirm Action"
      >
        <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Confirm Action
          </h2>
        </div>
        <div className="p-6 bg-sanctum-surface">
          <p className="text-[#E6E6E3] mb-6 font-medium">
            {deleteModal.type === 'single'
              ? 'Are you sure you want to delete this leave record?'
              : 'Are you sure you want to delete ALL title history? This cannot be undone.'}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
              className="px-4 py-2 bg-sanctum-bg text-sanctum-text-curr rounded-lg hover:bg-sanctum-sidebar font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executeAction}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-2xl-md transition-colors"
              autoFocus
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Toolbar ... */}

      <div className="bg-sanctum-surface p-4 rounded shadow-2xl-sm border border-sanctum-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-xl font-light text-sanctum-text-curr flex items-center gap-2">
          Leave Management
        </h2>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sanctum-text-muted/60">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Search doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-sanctum-border rounded text-sm focus:outline-none focus:border-sanctum-accent w-full bg-sanctum-bg text-sanctum-text-curr"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LEFT: Add Form --- */}
        <div className="lg:col-span-1">
          <div className="bg-sanctum-surface rounded shadow-2xl-sm border border-sanctum-border overflow-hidden">
            <div className="bg-sanctum-sidebar px-4 py-3 border-b border-sanctum-border flex justify-between items-center">
              <h3 className="font-semibold text-sanctum-text-curr text-sm">Add New Leave</h3>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#a0a4ab] uppercase mb-1">Doctor</label>
                  <SearchableSelect
                    options={allDoctors}
                    value={formData.doctor_id}
                    onChange={(val) => setFormData(prev => ({ ...prev, doctor_id: val }))}
                    placeholder="Type to search..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-sanctum-text-muted uppercase mb-1">Start</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-sanctum-border rounded text-sm focus:outline-none focus:border-sanctum-accent bg-sanctum-bg text-sanctum-text-curr"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#a0a4ab] uppercase mb-1">End</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                {error && <div className="text-red-600 text-xs bg-red-900/20 p-2 rounded border border-red-100">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <IconPlus /> Save Leave
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* --- RIGHT: List --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Leaves */}
          <div className="bg-sanctum-surface rounded shadow-2xl-sm border border-sanctum-border overflow-hidden">
            <div className="bg-blue-900/20 px-4 py-3 border-b border-blue-100/20 flex justify-between items-center">
              <h3 className="font-semibold text-blue-400 text-sm">Active & Upcoming Leaves</h3>
              <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full">{activeFiltered.length}</span>
            </div>
            {/* Scrollable Table Container */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-sanctum-border relative">
                <thead className="bg-sanctum-sidebar text-sanctum-text-muted text-xs uppercase font-medium sticky top-0 z-10 shadow-2xl-sm">
                  <tr>
                    <th className="px-4 py-3 text-left bg-sanctum-sidebar">Doctor Name</th>
                    <th className="px-4 py-3 text-left bg-sanctum-sidebar">Period</th>
                    <th className="px-4 py-3 text-right bg-sanctum-sidebar">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sanctum-border">
                  {activeFiltered.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-[#a0a4ab]/60 text-sm italic">
                        No active leaves found.
                      </td>
                    </tr>
                  ) : (
                    activeFiltered.map((leave, index) => {
                      const isSameDoc = index > 0 && activeFiltered[index - 1].doctor_name === leave.doctor_name;
                      return (
                        <tr key={leave.id} className="hover:bg-sanctum-bg transition-colors">
                          <td className="px-4 py-3 text-sm text-sanctum-text-curr font-medium">
                            {!isSameDoc && leave.doctor_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-sanctum-text-muted">
                            <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30">
                              {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(leave.id)}
                              className="text-[#a0a4ab]/60 hover:text-red-600 p-1 rounded hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* History Leaves */}
          <div className="bg-[#1a1d21] rounded shadow-2xl-sm border border-[#8C7A3E]/20 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="bg-[#0B0B0C] px-4 py-3 border-b border-[#8C7A3E]/20 flex justify-between items-center">
              <h3 className="font-semibold text-[#a0a4ab] text-sm">Leave History (Expired)</h3>
              {historyFiltered.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded border border-red-200 flex items-center gap-1 transition-colors"
                >
                  <IconRefresh /> Clear All History
                </button>
              )}
            </div>
            {/* Scrollable Table Container */}
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-100 relative">
                <thead className="bg-[#0B0B0C] text-[#a0a4ab]/60 text-xs uppercase font-medium sticky top-0 z-10 shadow-2xl-sm">
                  <tr>
                    <th className="px-4 py-3 text-left bg-[#0B0B0C]">Doctor Name</th>
                    <th className="px-4 py-3 text-left bg-[#0B0B0C]">Period</th>
                    <th className="px-4 py-3 text-right bg-[#0B0B0C]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sanctum-border bg-sanctum-sidebar/30">
                  {historyFiltered.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-sanctum-text-muted/60 text-xs italic">
                        No history data.
                      </td>
                    </tr>
                  ) : (
                    historyFiltered.map((leave) => (
                      <tr key={leave.id} className="text-sanctum-text-muted">
                        <td className="px-4 py-2 text-sm">{leave.doctor_name}</td>
                        <td className="px-4 py-2 text-xs">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="text-gray-300 hover:text-red-500"
                            title="Delete Single"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Component: Searchable Select (Combobox) ---
const SearchableSelect = ({ options, value, onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = useRef(null);

  // Sync internal input with external value
  useEffect(() => {
    const selected = options.find(opt => opt.id === value);
    if (selected) {
      setInputValue(selected.name);
    } else {
      setInputValue('');
    }
  }, [value, options]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        const selected = options.find(opt => opt.id === value);
        if (selected) setInputValue(selected.name);
        else setInputValue('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value, options]);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (option) => {
    setInputValue(option.name);
    onChange(option.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 border border-sanctum-border rounded text-sm focus:outline-none focus:border-sanctum-accent focus:ring-1 focus:ring-sanctum-accent bg-sanctum-bg text-sanctum-text-curr"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
        />
        <div className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 pointer-events-none text-sanctum-text-muted/60">
          <IconChevronDown />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-sanctum-surface border border-sanctum-border rounded shadow-2xl-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-sanctum-text-muted">No doctors found.</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-sanctum-primary/40 ${opt.id === value ? 'bg-sanctum-primary/60 text-white font-medium' : 'text-sanctum-text-curr'}`}
                onClick={() => handleSelect(opt)}
              >
                {opt.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};