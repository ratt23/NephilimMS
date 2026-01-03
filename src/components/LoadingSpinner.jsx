// src/components/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-500 text-sm font-medium animate-pulse">Loading data...</p>
        </div>
    );
}
