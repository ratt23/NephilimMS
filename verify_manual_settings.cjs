
const http = require('http');

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8888,
            path: '/.netlify/functions/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'adminAuth=admin123'
            }
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log("Testing Manual Update (FIXED Payload - Array)...");

    const payload = [
        {
            key: 'manual_update_list',
            value: JSON.stringify([101, 102, 103])
        }
    ];

    const res = await request('POST', '/settings', payload);
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${res.body}`);
}

run().catch(console.error);
