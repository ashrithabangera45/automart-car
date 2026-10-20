const http = require('http');

function postContact(data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/contact',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function getMessages() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/contact',
            method: 'GET'
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runTests() {
    console.log('--- TEST 1: Missing Required Fields ---');
    const t1 = await postContact({ fullName: 'John Doe', email: 'john@example.com' });
    console.log('Result 1 (Expected 400):', t1.status, t1.data);

    console.log('\n--- TEST 2: Invalid Email Format ---');
    const t2 = await postContact({
        fullName: 'John Doe',
        email: 'invalid-email',
        phone: '+91 9876543210',
        subject: 'Car inquiry',
        message: 'Looking for a BMW M3'
    });
    console.log('Result 2 (Expected 400):', t2.status, t2.data);

    console.log('\n--- TEST 3: Valid Submission with Unconfigured/Placeholder SMTP ---');
    const t3 = await postContact({
        fullName: 'Ashritha Visitor',
        email: 'visitor@example.com',
        phone: '+91 9876543210',
        subject: 'Test Inquiry Subject',
        message: 'Hello AutoMart team, this is an automated test message.'
    });
    console.log('Result 3 (Expected 502 with email failure logged securely):', t3.status, t3.data);

    console.log('\n--- TEST 4: Verifying MongoDB Storage Preserved ---');
    const t4 = await getMessages();
    console.log('Result 4 Messages Count:', t4.data.length);
    const latest = t4.data[0];
    console.log('Latest Saved Message in DB:', {
        id: latest?._id,
        fullName: latest?.fullName,
        email: latest?.email,
        phone: latest?.phone,
        subject: latest?.subject,
        status: latest?.status,
        createdAt: latest?.createdAt
    });
}

runTests().catch(console.error);
