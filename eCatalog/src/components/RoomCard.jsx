
import React, { useState } from 'react';
import { getValidImageUrl, getProxiedImageUrl } from '../utils/imageUtils';
import { X, Check } from 'lucide-react';

export default function RoomCard({ item, onImageClick }) {
    const [showModal, setShowModal] = useState(false);
    const imageUrl = getValidImageUrl(item.image_url, '/asset/categories/tarif_kamar.png');

    const FEATURES_LIMIT = 3;
    const features = item.features || [];
    const hasMore = features.length > FEATURES_LIMIT;
    const displayedFeatures = hasMore ? features.slice(0, FEATURES_LIMIT) : features;

    // Prevent scrolling when modal is open
    React.useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    return (
        <>
            <div className={`room-class-card ${item.id === 'vip' ? 'vip' : ''} ${item.id === 'vvip' ? 'vvip' : ''}`}>
                <div
                    className="room-card-image"
                    onClick={() => onImageClick(imageUrl)}
                >
                    <img
                        src={imageUrl}
                        alt={item.title}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getProxiedImageUrl('/asset/categories/tarif_kamar.png');
                        }}
                    />
                    <div className="card-image-overlay">Lihat Foto</div>
                </div>

                <div className="room-badge">{item.title}</div>
                {item.price && <div className="room-price">{item.price}</div>}

                {/* Features hidden on card as requested, moved to modal only */}

                <div className="px-6 pb-6 mt-auto">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-colors hover:bg-gray-800 flex items-center justify-center gap-2"
                    >
                        Lihat Detail
                    </button>
                </div>
            </div>

            {/* Read More Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div className="relative h-48 sm:h-64 shrink-0 bg-gray-100">
                            <img
                                src={imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getProxiedImageUrl('/asset/categories/tarif_kamar.png');
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-2xl font-bold shadow-black/50 drop-shadow-md">{item.title}</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="mb-6 border-b border-gray-100 pb-4">
                                <div className="text-3xl font-bold text-blue-600">{item.price}</div>
                            </div>

                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Fasilitas Lengkap
                            </h4>
                            <ul className="space-y-3">
                                {features.map((f, i) => (
                                    <li key={i} className="flex gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-100/50 hover:border-blue-100 transition-colors">
                                        <Check className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                        <span className="text-sm leading-relaxed">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Footer Action */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
