/**
 * Cloudinary Upload Widget Component
 * Wrapper for Cloudinary upload widget
 */
import React from 'react';

export default function CloudinaryUploadWidget({ onUpload, children }) {
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const openWidget = () => {
        if (!window.cloudinary) {
            console.error('Cloudinary widget script not loaded');
            alert('Cloudinary widget not available. Please refresh the page.');
            return;
        }

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: CLOUD_NAME,
                uploadPreset: UPLOAD_PRESET,
                sources: ['local', 'camera'],
                multiple: false,
                maxFileSize: 5000000, // 5MB
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                cropping: false
            },
            (error, result) => {
                if (error) {
                    console.error('Upload error:', error);
                }
                if (result.event === 'success') {
                    onUpload(error, result, widget);
                }
            }
        );

        widget.open();
    };

    return children({ open: openWidget });
}
