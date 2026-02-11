// Test to find the correct replica set name
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const dns = require('dns').promises;

async function findReplicaSetName() {
    console.log('🔍 Finding Replica Set Configuration...\n');

    // Use Google DNS
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    try {
        const srvRecords = await dns.resolveSrv('_mongodb._tcp.waste-coin-db.q0qeniz.mongodb.net');
        console.log('✅ Found MongoDB servers:');
        srvRecords.forEach((record, i) => {
            console.log(`   ${i + 1}. ${record.name}:${record.port}`);
        });
        console.log('');

        // Get TXT records which contain replica set name and other options
        console.log('Checking TXT records for configuration...');
        try {
            const txtRecords = await dns.resolveTxt('waste-coin-db.q0qeniz.mongodb.net');
            console.log('TXT Records:', txtRecords);
            console.log('');
        } catch (error) {
            console.log('No TXT records found');
            console.log('');
        }

        // Try connection without replica set name
        console.log('Attempting connection WITHOUT specifying replica set...');
        const simpleUri = `mongodb://waste-coin-db:databaseproject@ac-frjriu3-shard-00-00.q0qeniz.mongodb.net:27017,ac-frjriu3-shard-00-01.q0qeniz.mongodb.net:27017,ac-frjriu3-shard-00-02.q0qeniz.mongodb.net:27017/waste-coin-db?ssl=true&authSource=admin&retryWrites=true&w=majority`;

        const client = new MongoClient(simpleUri, {
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
        });

        try {
            console.log('Connecting...');
            await client.connect();
            console.log('✅ CONNECTION SUCCESSFUL!\n');

            const db = client.db('waste-coin-db');
            const adminDb = client.db().admin();

            // Get replica set status
            try {
                const replStatus = await adminDb.command({ replSetGetStatus: 1 });
                console.log('Replica Set Name:', replStatus.set);
            } catch (error) {
                console.log('Could not get replica set status (this is OK)');
            }

            console.log('');
            console.log('📋 WORKING CONNECTION STRING:');
            console.log(simpleUri.replace('databaseproject', '<db_password>'));

            await client.close();

        } catch (error) {
            console.log('❌ Connection failed:', error.message);
            console.log('');
            console.log('🔍 This suggests a firewall/network issue:');
            console.log('   - Your ISP or network firewall may be blocking MongoDB Atlas');
            console.log('   - Windows Firewall might be blocking outbound connections');
            console.log('   - Try using mobile hotspot to bypass network restrictions');
        }

    } catch (error) {
        console.log('❌ Failed:', error.message);
    }
}

findReplicaSetName();
