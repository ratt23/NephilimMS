// src/components/LeaveManager.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

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
async function fetchApi(url, options = {}) {
  const response = await fetch(url, options);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date cannot be before start date.');
      return;
    }
    setError(null);
    try {
      await fetchApi('/.netlify/functions/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-onesignal-app-id': localStorage.getItem('oneSignalAppId') || '',
          'x-onesignal-api-key': localStorage.getItem('oneSignalApiKey') || ''
        },
        body: JSON.stringify(formData),
      });
      setFormData({ doctor_id: '', start_date: '', end_date: '' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave record?')) {
      try {
        await fetchApi(`/.netlify/functions/api/leaves?id=${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to delete ALL title history? This cannot be undone.')) {
      try {
        await fetchApi(`/.netlify/functions/api/leaves?cleanup=true`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

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
      {/* --- Toolbar: Add Leave & Search --- */}
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-xl font-light text-gray-800 flex items-center gap-2">
          Leave Management
        </h2>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Search doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LEFT: Add Form --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700 text-sm">Add New Leave</h3>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Doctor</label>
                  <SearchableSelect
                    options={allDoctors}
                    value={formData.doctor_id}
                    onChange={(val) => setFormData(prev => ({ ...prev, doctor_id: val }))}
                    placeholder="Type to search..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                {error && <div className="text-red-600 text-xs bg-red-50 p-2 rounded border border-red-100">{error}</div>}
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
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
              <h3 className="font-semibold text-blue-800 text-sm">Active & Upcoming Leaves</h3>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{activeFiltered.length}</span>
            </div>
            {/* Scrollable Table Container */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-100 relative">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left bg-gray-50">Doctor Name</th>
                    <th className="px-4 py-3 text-left bg-gray-50">Period</th>
                    <th className="px-4 py-3 text-right bg-gray-50">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeFiltered.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-gray-400 text-sm italic">
                        No active leaves found.
                      </td>
                    </tr>
                  ) : (
                    activeFiltered.map((leave, index) => {
                      const isSameDoc = index > 0 && activeFiltered[index - 1].doctor_name === leave.doctor_name;
                      return (
                        <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                            {!isSameDoc && leave.doctor_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                              {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(leave.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
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
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-600 text-sm">Leave History (Expired)</h3>
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
                <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-medium sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left bg-gray-50">Doctor Name</th>
                    <th className="px-4 py-3 text-left bg-gray-50">Period</th>
                    <th className="px-4 py-3 text-right bg-gray-50">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-gray-50/30">
                  {historyFiltered.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-gray-400 text-xs italic">
                        No history data.
                      </td>
                    </tr>
                  ) : (
                    historyFiltered.map((leave) => (
                      <tr key={leave.id} className="text-gray-500">
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
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
        />
        <div className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <IconChevronDown />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500">No doctors found.</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${opt.id === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
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