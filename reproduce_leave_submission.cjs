
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
    console.log("1. Fetching a doctor ID...");
    const listRes = await request('GET', '/doctors?limit=1');
    const list = JSON.parse(listRes.body);
    if (!list.doctors || list.doctors.length === 0) {
        console.log("No doctors found.");
        return;
    }
    const doctor = list.doctors[0];
    console.log(`Using Doctor: ${doctor.name} (ID: ${doctor.id})`);

    console.log("2. Submitting Leave (POST /leaves)...");
    const leaveData = {
        doctor_id: doctor.id,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: "Test Leave via Local Script"
    };

    const res = await request('POST', '/leaves', leaveData);
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${res.body}`);
}

run().catch(console.error);
