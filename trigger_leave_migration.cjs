
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/.netlify/functions/migrate_leave_schema',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Migration Status: ${res.statusCode}`);
        console.log(`Migration Output: ${data}`);
    });
});

req.on('error', error => {
    console.error("Migration Request Failed:", error);
});

req.end();
