import React from 'react';

const MaintenanceView = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-[Inter] text-[#1f2937]">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
                <div className="mb-6 flex justify-center">
                    {/* Simple Icon or Logo placeholder */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-3 text-slate-800">Under Maintenance</h1>
                <p className="text-slate-600 mb-6 leading-relaxed">
                    We are currently updating our system to provide you with a better experience.
                    Please check back shortly.
                </p>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-1/3 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                    System Update in Progress
                </p>
            </div>
            <style>{`
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
      `}</style>
        </div>
    );
};

export default MaintenanceView;
