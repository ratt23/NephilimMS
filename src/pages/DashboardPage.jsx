import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorManager from '../components/DoctorManager.jsx';
import LeaveManager from '../components/LeaveManager.jsx';
import SstvManager from '../components/SstvManager.jsx';
import PromoManager from '../components/PromoManager.jsx';
import PushNotificationManager from '../components/PushNotificationManager.jsx';
import SettingsManager from '../components/SettingsManager.jsx';
import PostManager from '../components/PostManager.jsx';
import AdSenseManager from '../components/AdSenseManager.jsx';
import PopUpAdsManager from '../components/PopUpAdsManager.jsx';
import SiteMenuManager from '../components/SiteMenuManager.jsx';
import McuManager from '../components/McuManager.jsx';
import VisitorChart from '../components/VisitorChart.jsx';
import AdvancedAnalytics from '../components/AdvancedAnalytics.jsx';
import ChangelogManager from '../components/ChangelogManager.jsx';
import NewsletterManager from '../modules/newsletter/pages/NewsletterManager.jsx';
import ECatalogItemsManager from '../components/ECatalogItemsManager.jsx';
import TrafficReport from '../components/TrafficReport.jsx';

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
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
);
const IconDollarSign = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
const IconList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
);
const IconChevronDown = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);
const IconTv = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>
);
const IconNewspaper = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
);
const IconBarChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
);


// --- Menu Configuration ---
const MENU_GROUPS = [
  {
    title: 'Overview',
    id: 'overview',
    items: [
      { id: 'dashboard', label: 'Control Panel', icon: IconGrid },
      { id: 'traffic_report', label: 'Traffic Report', icon: IconBarChart },
    ]
  },
  {
    title: 'Medical Data',
    id: 'medical',
    items: [
      { id: 'doctors', label: 'Doctors', icon: IconUsers },
      { id: 'leaves', label: 'Leaves', icon: IconCalendar },
      { id: 'mcu', label: 'MCU Packages', icon: IconFileText },
    ]
  },
  {
    title: 'Content & Media',
    id: 'content',
    items: [
      { id: 'sstv', label: 'Slideshow / TV', icon: IconTv },
      { id: 'posts', label: 'News / Blog', icon: IconFileText },
      { id: 'newsletter', label: 'e-Newsletter', icon: IconNewspaper },
      { id: 'ecatalog_items', label: 'E-Catalog', icon: IconGrid },
      { id: 'promos', label: 'Promos', icon: IconTag },
    ]
  },
  {
    title: 'Marketing',
    id: 'marketing',
    items: [
      { id: 'ads', label: 'AdSense', icon: IconDollarSign },
      { id: 'popup', label: 'Pop Up Ads', icon: IconImage },
      { id: 'notifications', label: 'Push Notif', icon: IconBell },
    ]
  },
  {
    title: 'System',
    id: 'system',
    items: [
      { id: 'site_menu', label: 'Menu Manager', icon: IconList },
      { id: 'settings', label: 'Settings', icon: IconSettings },
      { id: 'changelog', label: 'Changelog', icon: IconFileText },
    ]
  }
];

// --- Route Mapping for URL Navigation (Hash-based) ---
const ROUTE_MAP = {
  'dashboard': '#dashboard',
  'traffic_report': '#trafficreport',
  'doctors': '#doctors',
  'leaves': '#leaves',
  'mcu': '#mcu',
  'sstv': '#slideshow',
  'posts': '#posts',
  'newsletter': '#newsletter',
  'ecatalog_items': '#ecatalog',
  'promos': '#promos',
  'ads': '#adsense',
  'popup': '#popup',
  'notifications': '#notifications',
  'site_menu': '#sitemenu',
  'settings': '#settings',
  'changelog': '#changelog'
};

// Reverse map: hash to menu ID
const HASH_TO_MENU = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([k, v]) => [v, k])
);

// --- Layout Components ---

const SidebarItem = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-10 py-2.5 text-sm font-medium transition-colors border-l-4
      ${active
        ? 'bg-[#1a3e6e] text-white border-blue-400'
        : 'text-gray-400 hover:text-white border-transparent'
      } `}
  >
    <Icon />
    <span>{label}</span>
  </button>
);

const SidebarGroup = ({ group, activeTab, toggleGroup, isExpanded, onTabChange }) => {
  // Check if any child is active to auto-highlight group parent style if needed
  const hasActiveChild = group.items.some(item => item.id === activeTab);

  return (
    <div className="mb-1">
      <button
        onClick={() => toggleGroup(group.id)}
        className={`w-full flex items-center justify-between px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors
                    ${hasActiveChild || isExpanded ? 'text-white bg-[#181b1f]' : 'text-gray-500 hover:bg-[#1a1d21]'}
                `}
      >
        <span>{group.title}</span>
        <IconChevronDown className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#1f2329] py-1">
          {group.items.map(item => (
            <SidebarItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

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

  // Initialize activeTab from URL hash or default to dashboard
  const getInitialTab = () => {
    const hash = window.location.hash;
    const menuId = HASH_TO_MENU[hash];
    return menuId || 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [expandedGroups, setExpandedGroups] = useState({
    overview: true, // Default open
    medical: true,
    content: false,
    marketing: false,
    system: false
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-expand group if active tab changes
  useEffect(() => {
    const parentGroup = MENU_GROUPS.find(g => g.items.some(i => i.id === activeTab));
    if (parentGroup) {
      setExpandedGroups(prev => ({ ...prev, [parentGroup.id]: true }));
    }
  }, [activeTab]);


  // Sync hash with active tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const menuId = HASH_TO_MENU[hash];
      if (menuId && menuId !== activeTab) {
        setActiveTab(menuId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);


  // Handler to change tab and update hash
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const hash = ROUTE_MAP[tabId] || '#dashboard';
    window.location.hash = hash;
    setIsMobileMenuOpen(false); // Close mobile menu on tab change
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/.netlify/functions/logout', { method: 'POST' });
    } catch (err) {
      console.error('Gagal logout dari server', err);
    }
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-light text-gray-800 mb-6 border-b pb-2">Control Panel</h2>
            <VisitorChart />
            <div className="mb-8">
              <AdvancedAnalytics />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <QuickIcon onClick={() => handleTabChange('doctors')} icon={IconUsers} label="Manage Doctors" />
              <QuickIcon onClick={() => handleTabChange('leaves')} icon={IconCalendar} label="Manage Leaves" />
              <QuickIcon onClick={() => handleTabChange('posts')} icon={IconFileText} label="Manage News" />
              <QuickIcon onClick={() => handleTabChange('sstv')} icon={IconTv} label="Slideshow Manager" />
              <QuickIcon onClick={() => handleTabChange('mcu')} icon={IconFileText} label="MCU Packages" />
              <QuickIcon onClick={() => handleTabChange('settings')} icon={IconSettings} label="System Settings" />
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
      case 'doctors': return <DoctorManager />;
      case 'leaves': return <LeaveManager />;
      case 'posts': return <PostManager />;
      case 'newsletter': return <NewsletterManager />;
      case 'ecatalog_items': return <ECatalogItemsManager />;
      case 'ads': return <AdSenseManager />;
      case 'popup': return <PopUpAdsManager />;
      case 'site_menu': return <SiteMenuManager />;
      case 'sstv': return <SstvManager />;
      case 'promos': return <PromoManager />;
      case 'mcu': return <McuManager />;
      case 'notifications': return <PushNotificationManager />;
      case 'settings': return <SettingsManager />;
      case 'changelog': return <ChangelogManager />;
      case 'traffic_report': return <TrafficReport />;
      default: return <div>Select an item from the menu</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#1a3e6e] text-white flex items-center justify-between px-4 shadow-md z-50">
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
              <span>CatMS</span>
              <span className="text-[10px] uppercase font-normal text-blue-200 tracking-wider">Custom CMS</span>
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

      {/* Main Layout Container */}
      <div className="flex pt-14 min-h-screen">

        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Fixed */}
        <aside
          className={`
                bg-[#23282d] text-white flex-col shadow-inner
                fixed top-14 bottom-0 left-0 w-64 z-40 overflow-y-auto
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}
        >
          <div className="py-4 px-6 bg-[#181b1f] text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-700">
            Main Navigation
          </div>
          <nav className="flex-1 overflow-y-auto custom-scrollbar pb-20">
            {MENU_GROUPS.map(group => (
              <SidebarGroup
                key={group.id}
                group={group}
                activeTab={activeTab}
                isExpanded={expandedGroups[group.id]}
                toggleGroup={toggleGroup}
                onTabChange={handleTabChange}
              />
            ))}
          </nav>
          <div className="p-4 text-xs text-gray-500 text-center border-t border-gray-700 mt-auto bg-[#23282d]">
            &copy; {new Date().getFullYear()} CatMS
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 w-full min-w-0 md:ml-64 bg-[#f0f2f5]">
          <div className="bg-white rounded shadow-sm min-h-[500px] border border-gray-200 p-1 mb-16">
            <div key={activeTab} className="animate-fade-in h-full">
              {renderContent()}
            </div>
          </div>

          {/* Dashboard Footer */}
          <footer className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#0f1d3d] text-white py-2 px-4 z-50 border-t border-blue-800 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
              <div className="opacity-90">
                <span>&copy; {new Date().getFullYear()} <b>CatMS</b> - Custom CMS</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1a2d52] px-4 py-1.5 rounded-full border border-blue-700/50">
                <span className="text-[11px]">Designed & Developed by <b className="text-blue-300">Marcomm SHAB</b></span>
                <a href="https://www.linkedin.com/in/raditya-putra-titapasanea-a250a616a/" target="_blank" rel="noopener noreferrer" className="text-white flex items-center transition-transform hover:text-[#0077B5] hover:scale-125">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}