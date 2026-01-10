/**
 * Upload PDF to Cloudinary
 * Reuses existing Cloudinary pattern from dashboard
 */
export async function uploadPDFToCloudinary(file) {
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Cloudinary credentials missing in .env');
    }

    // Validate file is PDF
    if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
        throw new Error('PDF file size must be less than 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'newsletter_public'); // Use unsigned preset for public access
    formData.append('resource_type', 'raw'); // For PDFs (not image)

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
        {
            method: 'POST',
            body: formData
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();

    return {
        url: data.secure_url,
        publicId: data.public_id
    };
}
