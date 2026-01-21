import React from 'react';

const IOSInstallPrompt = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 text-[#01007f] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2">Aktifkan Notifikasi iPhone</h3>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                        Di iPhone, notifikasi hanya berjalan jika website ini ditambahkan ke Layar Utama.
                    </p>

                    <div className="space-y-4 text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-[#01007f] shadow-sm">1</span>
                            <span className="text-sm text-slate-700">
                                Klik tombol <b>Share</b> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Apple_Share_icon.svg/1200px-Apple_Share_icon.svg.png" alt="Share" className="inline w-3 h-3 mx-1 align-baseline opacity-70" /> di bawah browser.
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-[#01007f] shadow-sm">2</span>
                            <span className="text-sm text-slate-700">
                                Pilih menu <b>"Add to Home Screen"</b> (Tambah ke Layar Utama).
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-[#01007f] shadow-sm">3</span>
                            <span className="text-sm text-slate-700">
                                Buka aplikasi baru yang muncul di layar HP Anda.
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-[#01007f] text-white rounded-xl font-semibold text-sm hover:bg-[#000060] transition-colors"
                    >
                        Saya Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IOSInstallPrompt;
