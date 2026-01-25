import React from 'react';
import { Phone, MessageCircle, User } from 'lucide-react';
import { getProxiedImageUrl } from '../utils/imageUtils';

export default function ContactCard({ item }) {
    // Sanitize phone number for WhatsApp API
    const getWhatsAppUrl = (number) => {
        if (!number) return '#';
        // Remove non-numeric characters
        let cleanNumber = number.replace(/\D/g, '');

        // Ensure ID country code (62)
        if (cleanNumber.startsWith('0')) {
            cleanNumber = '62' + cleanNumber.slice(1);
        }

        return `https://wa.me/${cleanNumber}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <div className="p-6 flex flex-col items-center text-center flex-grow">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-50 shadow-inner">
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getProxiedImageUrl('/asset/categories/placeholder.svg');
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <User size={48} />
                        </div>
                    )}
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-gray-800 mb-1 font-['Poppins']">{item.title}</h3>
                <p className="text-blue-600 font-medium mb-4 text-sm uppercase tracking-wide">{item.description}</p>

                {/* Features / Additional Info */}
                {item.features && item.features.length > 0 && (
                    <div className="w-full border-t border-gray-100 pt-3 mb-4">
                        <ul className="text-sm text-gray-500 space-y-1">
                            {item.features.map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                <a
                    href={getWhatsAppUrl(item.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 rounded-xl font-bold text-white text-center transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${item.price ? 'bg-green-500 hover:bg-green-600 shadow-green-200' : 'bg-gray-300 cursor-not-allowed'}`}
                    onClick={(e) => !item.price && e.preventDefault()}
                >
                    <MessageCircle size={20} />
                    {item.price ? 'Chat WhatsApp' : 'Tidak Ada Nomor'}
                </a>
            </div>
        </div>
    );
}
