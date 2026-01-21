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
        const pdfUrl = event.queryStringParameters?.url;

        if (!pdfUrl) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'PDF URL required' })
            };
        }

        // Fetch PDF from Cloudinary
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ message: 'Failed to fetch PDF' })
            };
        }

        // Get PDF as buffer
        const pdfBuffer = await response.arrayBuffer();

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
            },
            body: Buffer.from(pdfBuffer).toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('PDF Proxy error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Server error', error: error.message })
        };
    }
}
