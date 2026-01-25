
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/.netlify/functions/restore_covers',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Restore Status: ${res.statusCode}`);
        console.log(`Restore Output: ${data}`);
    });
});

req.on('error', error => {
    console.error("Restore Request Failed:", error);
});

req.end();
