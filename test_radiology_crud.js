
import http from 'http';

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8888,
            path: '/.netlify/functions/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'adminAuth=admin123'
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
        });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testCRUD() {
    console.log('--- Starting Radiology CRUD Test ---');

    // 1. CREATE
    console.log('1. Creating Dummy Item...');
    const createRes = await request('POST', '/radiology', {
        name: 'TEST_DUMMY_ITEM',
        common_name: 'Test X-Ray',
        category: 'Test Category',
        price: 123456
    });
    console.log(`   Status: ${createRes.status}`);

    if (createRes.status !== 201) {
        console.error('   Failed to create:', createRes.body);
        return;
    }
    const newItem = createRes.body;
    console.log(`   Created ID: ${newItem.id}, Name: ${newItem.name}`);

    // 2. UPDATE
    console.log('\n2. Updating Dummy Item (Price)...');
    const updateRes = await request('PUT', `/radiology/${newItem.id}`, {
        name: 'TEST_DUMMY_ITEM_UPDATED',
        common_name: 'Test X-Ray',
        category: 'Test Category',
        price: 999999
    });
    console.log(`   Status: ${updateRes.status}`);
    console.log(`   Updated Price: ${updateRes.body.price}`);

    // 3. DELETE (Soft)
    console.log('\n3. Deleting Dummy Item...');
    const deleteRes = await request('DELETE', `/radiology/${newItem.id}`);
    console.log(`   Status: ${deleteRes.status}`);

    // Verify it's gone (or soft deleted)
    // Ideally we check if it is still findable
    // But verify API response for now
    if (deleteRes.status === 200) {
        console.log('   Delete successful.');
    } else {
        console.error('   Delete failed:', deleteRes.body);
    }

    console.log('\n--- CRUD Test Complete ---');
}

testCRUD();
