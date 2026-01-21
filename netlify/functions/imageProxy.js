export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigins = [
    'https://shab.web.id',
    'https://jadwaldoktershab.netlify.app',
    'https://dashdev1.netlify.app',
    'https://dashdev2.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ];

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
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
