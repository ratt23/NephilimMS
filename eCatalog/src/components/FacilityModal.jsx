// Facility Detail Modal Component
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { getValidImageUrl } from '../utils/imageUtils';

export default function FacilityModal({ facility, onClose }) {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!facility) return null;

    const imageUrl = getValidImageUrl(facility.image_url, '/asset/categories/fasilitas.png');

    return (
        <div
            className="facility-modal-overlay"
            onClick={onClose}
        >
            <div
                className="facility-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="facility-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                {/* Image */}
                <div className="facility-modal-image-container">
                    <img
                        src={imageUrl}
                        alt={facility.title}
                        className="facility-modal-image"
                    />
                </div>

                {/* Content */}
                <div className="facility-modal-body">
                    <h2 className="facility-modal-title">{facility.title}</h2>

                    {facility.price && (
                        <p className="facility-modal-price">{facility.price}</p>
                    )}

                    {facility.description && (
                        <p className="facility-modal-description">{facility.description}</p>
                    )}

                    {facility.features && facility.features.length > 0 && (
                        <div className="facility-modal-features">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2">Fasilitas:</h3>
                            <ul className="facility-features-list">
                                {facility.features.map((feature, idx) => (
                                    <li key={idx} className="facility-feature-item">
                                        <span className="feature-bullet">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
