// Emergency connection test using direct hostnames
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const dns = require('dns').promises;

async function testDirectConnection() {
    console.log('🔍 Testing Alternative MongoDB Connection Methods...\n');

    // First, set DNS to Google DNS
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    console.log('Step 1: Resolving SRV records with Google DNS...');
    try {
        const srvRecords = await dns.resolveSrv('_mongodb._tcp.waste-coin-db.q0qeniz.mongodb.net');
        console.log('✅ Found', srvRecords.length, 'MongoDB servers:');
        srvRecords.forEach((record, i) => {
            console.log(`   ${i + 1}. ${record.name}:${record.port}`);
        });
        console.log('');

        // Try connecting directly to the first server
        if (srvRecords.length > 0) {
            const directHost = srvRecords[0].name;
            const directPort = srvRecords[0].port;

            console.log(`Step 2: Attempting direct connection to ${directHost}:${directPort}...`);

            const directUri = `mongodb://${directHost}:${directPort}/waste-coin-db?retryWrites=true&w=majority&authSource=admin`;
            const client = new MongoClient(directUri, {
                auth: {
                    username: 'waste-coin-db',
                    password: 'databaseproject',
                },
                connectTimeoutMS: 30000,
                serverSelectionTimeoutMS: 30000,
                ssl: true,
                tls: true,
            });

            try {
                await client.connect();
                console.log('✅ Direct connection successful!');
                console.log('');
                console.log('📋 SOLUTION: Use this connection string in .env.local:');
                console.log(`MONGODB_URI=${directUri.replace('databaseproject', '<db_password>')}`);
                console.log('');

                await client.close();
            } catch (error) {
                console.log('❌ Direct connection failed:', error.message);
            }
        }

    } catch (error) {
        console.log('❌ SRV resolution failed:', error.message);
        console.log('');
        console.log('🔍 This is likely a network/firewall issue.');
        console.log('');
        console.log('💡 Try these workarounds:');
        console.log('   1. Use mobile hotspot instead of your current network');
        console.log('   2. Disable VPN if you\'re using one');
        console.log('   3. Flush DNS cache: ipconfig /flushdns');
        console.log('   4. Contact cluster owner to verify cluster is actually reachable');
    }
}

testDirectConnection();
