import React from 'react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max px-6 py-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
              flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm
              transition-all duration-300 whitespace-nowrap
              ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-[#01007f] to-[#0c4a6e] text-white shadow-lg shadow-[#01007f]/30 scale-105'
                                : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md border border-slate-200'
                            }
            `}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabNavigation;
