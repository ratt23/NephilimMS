export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const imageUrl = event.queryStringParameters?.url;

        if (!imageUrl) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Image URL required' })
            };
        }

        // Fetch Image
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: 'Failed to fetch image' })
            };
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const buffer = await response.arrayBuffer();

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400' // Cache for 1 day
            },
            body: Buffer.from(buffer).toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('Image Proxy error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error', error: error.message })
        };
    }
}
