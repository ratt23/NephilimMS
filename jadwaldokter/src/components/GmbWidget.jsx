import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';

const GmbWidget = () => {
    const [visible, setVisible] = useState(true);
    const config = useConfig();

    // Check if GMB feature is enabled in Admin Dashboard
    if (!config.features.googleReview) return null;
    if (!visible) return null;

    return (
        <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white p-4 rounded-xl shadow-lg border border-slate-100 z-50 flex flex-col items-center text-center animate-fade-in sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-24 sm:w-80">
            <button
                onClick={() => setVisible(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            >
                &times;
            </button>
            <h3 className="font-bold text-slate-800 text-lg">Bagaimana pengalaman Anda?</h3>
            <p className="text-sm text-slate-500 mb-3">Masukan Anda membantu kami.</p>
            <a
                href="https://g.page/r/CXA8lVuBr9QwEBM/review"
                target="_blank"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full justify-center"
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
                <span>Beri ulasan di Google</span>
            </a>
            <div className="flex items-center gap-2 mt-3 text-yellow-500 font-bold text-sm">
                <span className="text-slate-800 bg-slate-100 px-2 rounded">4.8</span>
                <span>★★★★★</span>
            </div>
        </div>
    );
};

export default GmbWidget;
