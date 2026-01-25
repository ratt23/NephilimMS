// Facility Thumbnail Card Component
import React from 'react';
import { getValidImageUrl, getProxiedImageUrl } from '../utils/imageUtils';

export default function FacilityCard({ item, onClick }) {
    const imageUrl = getValidImageUrl(item.image_url, '/asset/categories/fasilitas.png');

    return (
        <div
            className="facility-card"
            onClick={() => onClick(item)}
        >
            <div className="facility-thumbnail">
                <img
                    src={imageUrl}
                    alt={item.title}
                    className="facility-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getProxiedImageUrl('/asset/categories/fasilitas.png');
                    }}
                />
                <div className="facility-overlay">
                    <h3 className="facility-title text-white">{item.title}</h3>
                    <span className="facility-view-more">Lihat Detail</span>
                </div>
            </div>
        </div>
    );
}
