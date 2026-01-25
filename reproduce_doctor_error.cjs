
const http = require('http');

// Helper for requests
function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8888,
            path: '/.netlify/functions/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'adminAuth=admin123', // Admin Password Hardcoded in api.js
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    console.log("1. Fetching first doctor...");
    const listRes = await request('GET', '/doctors?limit=1');
    const list = JSON.parse(listRes.body);

    if (!list.doctors || list.doctors.length === 0) {
        console.log("No doctors found to update. Creating one...");
        // Create logic if needed, but likely there are doctors.
        console.log("Response:", list);
        return;
    }

    // Retrieve ID from list first
    const doctor = list.doctors[0];
    console.log(`Found doctor: ${doctor.name} (ID: ${doctor.id})`);

    console.log("2. Attempting Manual Update (PUT) with Query Param...");
    const updatePayload = {
        name: doctor.name + " (UpdatedQ)",
        specialty: doctor.specialty,
        image_url: doctor.image_url,
        schedule: {
            senin: "09:00 - 13:00"
        }
    };

    // Use ?id= query param to match DoctorManager.jsx
    const updateRes = await request('PUT', `/doctors?id=${doctor.id}`, updatePayload);
    console.log(`Update Status: ${updateRes.status}`);
    console.log(`Update Body: ${updateRes.body}`);
}

run().catch(console.error);
