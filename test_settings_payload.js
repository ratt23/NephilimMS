
import http from 'http';

function post(data) {
    const body = JSON.stringify(data);
    const req = http.request({
        hostname: 'localhost',
        port: 8888,
        path: '/.netlify/functions/api/settings',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'adminAuth=admin123'
        }
    }, res => {
        let respBody = '';
        res.on('data', c => respBody += c);
        res.on('end', () => console.log(`Payload: ${Array.isArray(data) ? 'ARRAY' : 'OBJECT'} -> Status: ${res.statusCode}, Body: ${respBody}`));
    });
    req.write(body);
    req.end();
}

// Test 1: Object (Current implementation)
post({
    category_visibility: { value: "{}", enabled: true }
});

// Test 2: Array (What api.js seems to want)
setTimeout(() => {
    post([
        { key: 'category_visibility', value: "{}" }
    ]);
}, 1000);
