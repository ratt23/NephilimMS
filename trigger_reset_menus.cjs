
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/.netlify/functions/reset_menus',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Reset Status: ${res.statusCode}`);
        console.log(`Reset Output: ${data}`);
    });
});

req.on('error', error => {
    console.error("Reset Request Failed:", error);
});

req.end();
