// Standalone test script without imports
const API_URL = 'http://localhost:3000';

async function testLogin() {
    console.log('Testing Login Endpoint...');
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'admin123' }),
        });

        console.log('Status:', response.status);
        console.log('Headers:', [...response.headers.entries()]);

        const data = await response.json();
        console.log('Body:', data);

        const cookie = response.headers.get('set-cookie');
        if (cookie) {
            console.log('✅ Set-Cookie header received:', cookie);
        } else {
            console.log('⚠️ No Set-Cookie header received');
        }

    } catch (error) {
        console.error('Login Test Failed:', error);
    }
}

testLogin();
