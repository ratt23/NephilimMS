const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/.netlify/functions/api/settings',
    method: 'GET',
    headers: {
        'Cookie': 'nf_auth=true',
        'Origin': 'http://localhost:8888'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('BODY: ' + data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
