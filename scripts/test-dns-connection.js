// Test different MongoDB connection methods
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testMultipleConnectionMethods() {
    console.log('🔍 Testing Multiple MongoDB Connection Methods...\n');

    // Method 1: Using DNS over HTTPS (Google DNS)
    console.log('Method 1: Testing with custom DNS resolver...');
    const dns = require('dns').promises;
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); // Google DNS + Cloudflare

    try {
        const srvRecords = await dns.resolveSrv('_mongodb._tcp.waste-coin-db.q0qeniz.mongodb.net');
        console.log('✅ DNS SRV lookup successful!');
        console.log('Found', srvRecords.length, 'MongoDB servers');
    } catch (error) {
        console.log('❌ DNS SRV lookup failed:', error.message);
    }
    console.log('');

    // Method 2: Try connecting with longer timeout
    console.log('Method 2: Testing with extended timeout...');
    const uriWithTimeout = process.env.MONGODB_URI + '&connectTimeoutMS=30000&serverSelectionTimeoutMS=30000';

    const client2 = new MongoClient(uriWithTimeout, {
        retryWrites: true,
        w: 'majority',
    });

    try {
        await client2.connect();
        console.log('✅ Connected successfully with extended timeout!');
        await client2.close();
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
    }
    console.log('');

    // Method 3: Print detailed network info
    console.log('Method 3: Network diagnostics...');
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();

    console.log('Active network interfaces:');
    Object.keys(networkInterfaces).forEach(name => {
        const nets = networkInterfaces[name];
        nets.forEach(net => {
            if (!net.internal && net.family === 'IPv4') {
                console.log(`  - ${name}: ${net.address}`);
            }
        });
    });
    console.log('');

    // Method 4: Test if it's a temporary DNS issue
    console.log('Method 4: Testing plain DNS lookup...');
    try {
        const addresses = await dns.resolve4('waste-coin-db.q0qeniz.mongodb.net');
        console.log('✅ Can resolve host:', addresses);
    } catch (error) {
        console.log('❌ Cannot resolve host:', error.message);
        console.log('');
        console.log('🔍 This suggests one of the following:');
        console.log('   1. The cluster was just created - wait 2-5 minutes');
        console.log('   2. Your ISP/firewall is blocking MongoDB Atlas DNS');
        console.log('   3. The cluster URL might be incorrect');
        console.log('');
        console.log('💡 Suggested actions:');
        console.log('   - Wait 5 minutes and try again');
        console.log('   - Try using mobile hotspot to test if it\'s network issue');
        console.log('   - Check MongoDB Atlas dashboard to verify cluster status');
    }
}

testMultipleConnectionMethods().catch(console.error);
