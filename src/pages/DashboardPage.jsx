import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorManager from '../components/DoctorManager.jsx';
import LeaveManager from '../components/LeaveManager.jsx';
import SstvManager from '../components/SstvManager.jsx';
import PromoManager from '../components/PromoManager.jsx';
import PushNotificationManager from '../components/PushNotificationManager.jsx';
import SettingsManager from '../components/SettingsManager.jsx';
import PostManager from '../components/PostManager.jsx';
import AdSenseManager from '../components/AdSenseManager.jsx';

// --- Icons (Inline SVGs for lightweight dependency) ---
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);
const IconImage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
);
const IconTag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>
);
const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
const IconLogOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);
const IconGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
);
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
// New Icon for News
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
);
const IconDollarSign = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);


// --- Layout Components ---

const SidebarItem = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors
      ${active
        ? 'bg-[#1a3e6e] text-white border-l-4 border-blue-400'
        : 'text-gray-300 hover:bg-[#15345d] hover:text-white border-l-4 border-transparent'
      } `}
  >
    <Icon />
    <span>{label}</span>
  </button>
);

const QuickIcon = ({ onClick, icon: Icon, label, colorClass = "text-blue-600 bg-blue-50 hover:bg-blue-100" }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md hover:-translate-y-1 ${colorClass} bg-white`}
  >
    <div className="mb-3 transform scale-150">
      <Icon />
    </div>
    <span className="font-semibold text-gray-700">{label}</span>
  </button>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to Control Panel
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/.netlify/functions/logout', { method: 'POST' });
    } catch (err) {
      console.error('Gagal logout dari server', err);
    }
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Control Panel', icon: IconGrid },
    { id: 'doctors', label: 'Doctors', icon: IconUsers },
    { id: 'leaves', label: 'Leaves', icon: IconCalendar },
    { id: 'posts', label: 'News / Blog', icon: IconFileText },
    { id: 'sstv', label: 'Slideshow', icon: IconImage },
    { id: 'promos', label: 'Promos', icon: IconTag },
    { id: 'ads', label: 'AdSense', icon: IconDollarSign },
    { id: 'notifications', label: 'Push Notif', icon: IconBell },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu on usage
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-light text-gray-800 mb-6 border-b pb-2">Control Panel</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <QuickIcon
                onClick={() => handleTabChange('doctors')}
                icon={IconUsers}
                label="Manage Doctors"
              />
              <QuickIcon
                onClick={() => handleTabChange('leaves')}
                icon={IconCalendar}
                label="Manage Leaves"
              />
              <QuickIcon
                onClick={() => handleTabChange('posts')}
                icon={IconFileText}
                label="Manage News"
              />
              <QuickIcon
                onClick={() => handleTabChange('ads')}
                icon={IconDollarSign}
                label="Manage Ads"
              />
              <QuickIcon
                onClick={() => handleTabChange('sstv')}
                icon={IconImage}
                label="Manage Slideshow"
              />
              <QuickIcon
                onClick={() => handleTabChange('promos')}
                icon={IconTag}
                label="Manage Promos"
              />
              <QuickIcon
                onClick={() => handleTabChange('notifications')}
                icon={IconBell}
                label="Push Notifications"
              />
              <QuickIcon
                onClick={() => handleTabChange('settings')}
                icon={IconSettings}
                label="System Settings"
              />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium text-gray-700">
                  System Information
                </div>
                <div className="p-4 text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Logged in as:</span>
                    <span className="font-semibold">Administrator</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'doctors':
        return <DoctorManager />;
      case 'leaves':
        return <LeaveManager />;
      case 'posts':
        return <PostManager />;
      case 'ads':
        return <AdSenseManager />;
      case 'sstv':
        return <SstvManager />;
      case 'promos':
        return <PromoManager />;
      case 'notifications':
        return <PushNotificationManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <div>Select an item from the menu</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-14 bg-[#1a3e6e] text-white flex items-center justify-between px-4 shadow-md z-20 relative">
        <div className="flex items-center space-x-3">
          {/* Mobile Hamburger / X Toggle */}
          <button
            className="md:hidden p-1 hover:bg-blue-800 rounded focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <IconX /> : <IconMenu />}
          </button>

          <div className="font-bold text-xl tracking-wide flex items-center gap-2">
            <img src="/CMS.png" alt="CMS Logo" className="h-8 w-8" />
            <div className="flex flex-col leading-tight">
              <span>GraphCMS</span>
              <span className="text-[10px] uppercase font-normal text-blue-200 tracking-wider">Empowering Healthcare</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
          >
            <IconLogOut />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Responsive */}
        <aside
          className={`
                bg-[#23282d] text-white flex-col shadow-inner
                fixed inset-y-0 left-0 w-64 z-30
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:min-h-full
            `}
          // Mobile: Fixed top-14 (header height)
          // Desktop: standard flow
          style={isMobileMenuOpen ? { top: '3.5rem' } : {}}
        >
          <div className="py-4 px-6 bg-[#181b1f] text-xs font-bold text-gray-500 uppercase tracking-wider">
            Main Menu
          </div>
          <nav className="flex-1">
            <ul className="space-y-1 py-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <SidebarItem
                    label={item.label}
                    icon={item.icon}
                    active={activeTab === item.id}
                    onClick={() => handleTabChange(item.id)}
                  />
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 text-xs text-gray-500 text-center border-t border-gray-700 mt-auto">
            &copy; {new Date().getFullYear()} GraphCMS
          </div>
        </aside>

        {/* content area */}
        <main className="flex-1 p-4 md:p-8 w-full min-w-0">
          <div className="bg-white rounded shadow-sm min-h-[500px] border border-gray-200 p-1">
            <div key={activeTab} className="animate-fade-in h-full">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}