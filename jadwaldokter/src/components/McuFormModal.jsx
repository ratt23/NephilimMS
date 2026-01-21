import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { trackEvent } from './AnalyticsTracker';

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

const McuFormModal = ({ pkg, onClose }) => {
    const config = useConfig();
    const [formData, setFormData] = useState({
        nama: '',
        tanggal: '',
        hp: '',
        email: ''
    });
    const [selectedAddons, setSelectedAddons] = useState([]);

    const handleAddonChange = (addon) => {
        if (selectedAddons.find(a => a.id === addon.id)) {
            setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
        } else {
            setSelectedAddons([...selectedAddons, addon]);
        }
    };

    const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
    const totalPrice = (pkg?.basePrice || pkg?.price || 0) + addonsTotal;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if WhatsApp is enabled
        if (!config.whatsappEnabled) {
            alert('WhatsApp booking is currently disabled. Please contact us directly.');
            return;
        }

        // Date formatting: YYYY-MM-DD -> DD-MM-YYYY
        let tanggalFormatted = formData.tanggal;
        if (formData.tanggal) {
            const parts = formData.tanggal.split('-');
            tanggalFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        let additionalText = "";
        let finalPriceText = "";

        if (selectedAddons.length > 0) {
            const selectedLabels = selectedAddons.map(a => a.label);
            additionalText = `%0A%0A*Tambahan (Add-on):*%0A- ${selectedLabels.join('%0A- ')}`;
        }

        if ((pkg.basePrice || 0) > 0 || pkg.isPelaut) {
            finalPriceText = `%0A%0A*Total Estimasi: ${formatRupiah(totalPrice)}*`;
        }

        const message = `Halo Admin ${config.hospitalName || 'Rumah Sakit'},%0A%0ASaya ingin mendaftar Medical Check Up:%0A*${pkg.name}*${additionalText}${finalPriceText}%0A%0AData Diri:%0ANama: ${formData.nama}%0AHp: ${formData.hp}%0ATanggal: ${tanggalFormatted}%0AEmail: ${formData.email}%0AKTP: (Foto KTP akan saya lampirkan manual setelah ini)`;

        trackEvent('conversion_mcu_wa', { package: pkg.name, value: totalPrice });

        alert("Sistem akan membuka WhatsApp.\\n\\nSilakan 'Paste' atau 'Lampirkan' foto KTP secara manual di chat WhatsApp.");
        window.open(`https://wa.me/${config.whatsappNumber}?text=${message}`, '_blank');
        onClose();
    };

    if (!pkg) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white p-4 md:p-6 rounded-2xl w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeInScale_0.3s_ease-out]">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl transition hover:rotate-90">&times;</button>
                <h3 className="text-xl font-bold mb-1 text-slate-800">Form Pemesanan</h3>

                <p className="text-blue-800 font-semibold text-sm mb-2 bg-blue-50 p-2 rounded-lg">
                    Paket Dipilih: {pkg.name}
                </p>

                {pkg.isPelaut && pkg.addons && (
                    <div className="mb-4 p-3 border border-blue-100 rounded-lg bg-slate-50">
                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Pilih Tambahan (Opsional):</p>
                        <div className="space-y-2 text-sm">
                            {pkg.addons.map(addon => (
                                <div key={addon.id} className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            checked={!!selectedAddons.find(a => a.id === addon.id)}
                                            onChange={() => handleAddonChange(addon)}
                                        />
                                        <span className="text-slate-700">{addon.label}</span>
                                    </label>
                                    <span className="text-slate-500 font-semibold text-xs">+{formatRupiah(addon.price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {pkg.isPelaut && (
                    <div className="mb-4 text-right">
                        <span className="text-sm text-slate-500">Total Estimasi:</span>
                        <div className="text-2xl font-bold text-green-600">{formatRupiah(totalPrice)}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition"
                            value={formData.nama}
                            onChange={e => setFormData({ ...formData, nama: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal Lahir</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition"
                            value={formData.tanggal}
                            onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">No. WhatsApp</label>
                        <input
                            type="tel"
                            required
                            placeholder="Contoh: 0812..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition"
                            value={formData.hp}
                            onChange={e => setFormData({ ...formData, hp: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 transition"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Upload Foto KTP</label>
                        <p className="text-xs text-red-500 mt-2 font-semibold">Foto akan dilampirkan manual di chat WA.</p>
                    </div>
                    <button type="submit" className="bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition flex justify-center items-center gap-2 mt-2 shadow-lg shadow-green-200 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.66C14.25 3.66 16.31 4.51 17.87 6.07C19.42 7.63 20.28 9.7 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.66 12.05 3.66" /></svg>
                        Kirim via WhatsApp
                    </button>
                </form>
            </div>
        </div>
    );
};

export default McuFormModal;
