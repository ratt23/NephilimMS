// src/components/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center space-y-4 min-w-[200px] transform transition-all scale-100">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="text-gray-700 text-sm font-semibold animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
