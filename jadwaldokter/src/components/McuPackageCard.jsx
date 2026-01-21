import React, { useState } from 'react';

const McuPackageCard = ({ pkg, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Filter items: visible ones always shown, hidden ones shown if expanded
    // Logic: in legacy, 'hidden' class items were hidden initially.
    // Here, pkg.items has `hidden: true` property.

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    return (
        <article className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition overflow-hidden group transform md:-translate-y-0 relative z-10">
            {pkg.recomended && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-20">
                    REKOMENDASI
                </div>
            )}
            <div className={`h-40 md:h-48 relative overflow-hidden ${pkg.recomended ? 'bg-blue-50' : 'bg-slate-200'}`}>
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div className="p-4 md:p-6 flex flex-col flex-grow">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                    {pkg.name}
                    {pkg.isPelaut && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Bersertifikat</span>}
                </h2>
                <div className="text-xl md:text-2xl font-bold text-blue-700 my-2">
                    {formatCurrency(pkg.price)} {pkg.isPelaut && <span className="text-sm text-slate-500 font-normal">(Base)</span>}
                </div>

                <ul className="flex-grow space-y-2 mb-4 text-sm text-slate-600">
                    {pkg.items.map((cat, idx) => {
                        const isHidden = cat.hidden;
                        if (isHidden && !isExpanded) return null;
                        return (
                            <React.Fragment key={idx}>
                                {cat.category && (
                                    <li className="flex items-start gap-2 pt-1">
                                        <span className="text-green-500 font-bold"></span><b>{cat.category}</b>
                                    </li>
                                )}
                                {cat.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">✓</span> {item}
                                    </li>
                                ))}
                            </React.Fragment>
                        );
                    })}
                    {pkg.addons && isExpanded && (
                        <div className="mt-4 pt-3 border-t border-dashed border-slate-300">
                            <p className="font-bold text-xs text-slate-500 mb-1">Pemeriksaan Tambahan (Opsional):</p>
                            {pkg.addons.map((addon, i) => (
                                <li key={i} className="flex justify-between items-center text-xs">
                                    <span>{addon.label}</span>
                                    <span className="font-semibold text-slate-700">{formatCurrency(addon.price)}</span>
                                </li>
                            ))}
                        </div>
                    )}
                </ul>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 text-sm font-semibold mb-6 hover:underline text-left"
                >
                    {isExpanded ? 'Tutup Detail' : 'Lihat Selengkapnya'}
                </button>

                <button
                    onClick={() => onSelect(pkg)}
                    className={`w-full py-3 text-white rounded-xl font-bold transition shadow-lg ${pkg.recomended ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-200' : 'bg-blue-900 hover:bg-blue-800 shadow-blue-100'}`}
                >
                    {pkg.isPelaut ? 'Pilih Paket Pelaut' : 'Pilih Paket'}
                </button>
            </div>
        </article>
    );
};

export default McuPackageCard;
