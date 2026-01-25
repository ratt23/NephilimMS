// Reusable Room Card Component
import React from 'react';
import { getValidImageUrl, getProxiedImageUrl } from '../utils/imageUtils';

export default function RoomCard({ item, onImageClick }) {
    const imageUrl = getValidImageUrl(item.image_url, '/asset/categories/tarif_kamar.png');

    return (
        <div className="room-class-card">
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
            {item.features && item.features.length > 0 && (
                <ul className="room-features">
                    {item.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
