// src/components/LoadingSpinner.jsx
import React from 'react';
import SanctumHeaderParticles from './SanctumHeaderParticles';

export default function LoadingSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sanctum-bg/95 backdrop-blur-sm animate-fade-in overflow-hidden">
            {/* Particle Background */}
            <SanctumHeaderParticles />

            {/* Loading Card */}
            <div className="relative z-10 bg-sanctum-surface/80 border border-sanctum-border p-8 rounded-xl shadow-2xl flex flex-col items-center space-y-5 min-w-[240px] backdrop-blur-md animate-slide-up">
                <div className="relative">
                    {/* Outer Ring */}
                    <div className="w-16 h-16 border-4 border-sanctum-bg rounded-full opacity-50"></div>
                    {/* Spinning Inner Ring */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-sanctum-accent rounded-full animate-spin border-t-transparent shadow-[0_0_15px_rgba(31,106,255,0.5)]"></div>
                    {/* Center Dot */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>

                <div className="flex flex-col items-center">
                    <p className="text-sanctum-text-curr text-lg font-cinzel font-bold tracking-wider animate-pulse">SanctumDB</p>
                    <p className="text-sanctum-text-muted text-xs uppercase tracking-[0.2em] mt-1">Processing Data</p>
                </div>
            </div>
        </div>
    );
}
