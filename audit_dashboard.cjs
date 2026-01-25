
const http = require('http');

const COOKIE = 'adminAuth=admin123';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8888,
            path: '/.netlify/functions/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': COOKIE
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

async function runAudit() {
    console.log("=== STARTING DASHBOARD ENDPOINT AUDIT ===\n");

    const results = [];

    // 1. DOCTOR: Create
    console.log("1. Testing Doctor Create...");
    const docPayload = {
        name: "Dr. Audit Test",
        specialty: "Auditologist",
        image_url: "http://example.com/img.jpg",
        schedule: { senin: "10:00-12:00" }
    };
    const docRes = await request('POST', '/doctors', docPayload);
    let docId = null;
    if (docRes.status === 201) {
        const d = JSON.parse(docRes.body);
        docId = d.id || d.rows?.[0]?.id; // Adjust based on actual return
        if (!docId && d.name) docId = "captured"; // Assuming successful insert but ID format variance
        // Usually standard insert returns object with id.
        if (d.id) docId = d.id;

        results.push({ name: 'Create Doctor', status: 'PASS', code: 201 });
    } else {
        results.push({ name: 'Create Doctor', status: 'FAIL', code: docRes.status, err: docRes.body });
    }

    // 2. DOCTOR: Update (if created)
    if (docId && typeof docId === 'number') {
        console.log(`2. Testing Doctor Update (ID: ${docId})...`);
        const updateRes = await request('PUT', `/doctors?id=${docId}`, { ...docPayload, name: "Dr. Audit Update" });
        if (updateRes.status === 200) results.push({ name: 'Update Doctor', status: 'PASS', code: 200 });
        else results.push({ name: 'Update Doctor', status: 'FAIL', code: updateRes.status });
    } else {
        results.push({ name: 'Update Doctor', status: 'SKIP', msg: 'Create failed' });
    }

    // 3. LEAVE: Submission
    // Need a doctor ID. Use fetched list if created failed.
    let validDocId = docId;
    if (!validDocId) {
        const list = await request('GET', '/doctors?limit=1');
        const l = JSON.parse(list.body);
        if (l.doctors && l.doctors.length > 0) validDocId = l.doctors[0].id;
    }

    if (validDocId) {
        console.log(`3. Testing Leave Submission (Doc ID: ${validDocId})...`);
        const leaveRes = await request('POST', '/leaves', {
            doctor_id: validDocId,
            start_date: '2026-02-01',
            end_date: '2026-02-02',
            reason: 'Audit Leave'
        });
        if (leaveRes.status === 201) results.push({ name: 'Submit Leave', status: 'PASS', code: 201 });
        else results.push({ name: 'Submit Leave', status: 'FAIL', code: leaveRes.status, err: leaveRes.body });
    } else {
        results.push({ name: 'Submit Leave', status: 'SKIP', msg: 'No doctors found' });
    }

    // 4. RADIOLOGY: Create
    console.log("4. Testing Radiology Create...");
    const radPayload = { name: "Audit X-Ray", category: "Test", price: 50000 };
    const radRes = await request('POST', '/radiology', radPayload);
    let radId = null;
    if (radRes.status === 201) {
        const r = JSON.parse(radRes.body);
        radId = r.id;
        results.push({ name: 'Create Radiology', status: 'PASS', code: 201 });
    } else {
        results.push({ name: 'Create Radiology', status: 'FAIL', code: radRes.status, err: radRes.body });
    }
    // Delete Radiology Cleanup
    if (radId) await request('DELETE', `/radiology/${radId}`);

    // 5. MCU: Create
    console.log("5. Testing MCU Create...");
    const mcuPayload = {
        package_id: "audit_mcu",
        name: "Audit Checkup",
        price: 100000,
        items: [{ category: "Fisik", items: ["Tensi"] }]
    };
    const mcuRes = await request('POST', '/mcu-packages', mcuPayload);
    let mcuId = null;
    if (mcuRes.status === 201) {
        const m = JSON.parse(mcuRes.body);
        mcuId = m.id;
        results.push({ name: 'Create MCU', status: 'PASS', code: 201 });
    } else {
        results.push({ name: 'Create MCU', status: 'FAIL', code: mcuRes.status, err: mcuRes.body });
    }
    // Cleanup MCU (assuming valid ID)
    if (mcuId) await request('DELETE', `/mcu-packages/${mcuId}`);


    // 6. POPUP ADS
    console.log("6. Testing PopUp Ad Config...");
    const popRes = await request('POST', '/popup-ad', { images: [], active: false });
    if (popRes.status === 200) results.push({ name: 'Save PopUp Ads', status: 'PASS', code: 200 });
    else results.push({ name: 'Save PopUp Ads', status: 'FAIL', code: popRes.status, err: popRes.body });

    // 7. SETTINGS (Manual Update)
    console.log("7. Testing Settings (Manual Update Array)...");
    const setRes = await request('POST', '/settings', [{ key: 'manual_update_list', value: '[]' }]);
    if (setRes.status === 200) results.push({ name: 'Save Settings', status: 'PASS', code: 200 });
    else results.push({ name: 'Save Settings', status: 'FAIL', code: setRes.status, err: setRes.body });

    // Cleanup Doctor
    if (docId && typeof docId === 'number') {
        await request('DELETE', `/doctors?id=${docId}`);
    }

    console.log("\n=== AUDIT SUMMARY ===");
    console.table(results);
}

runAudit().catch(console.error);
