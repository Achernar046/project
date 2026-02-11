require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
    console.log('🔍 Testing MongoDB Connection...\n');

    // Check environment variables
    console.log('Environment Variables:');
    console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
    console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('  ENCRYPTION_SECRET:', process.env.ENCRYPTION_SECRET ? '✅ Set' : '❌ Not set');
    console.log('');

    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not set in .env.local');
        process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('');

    const client = new MongoClient(process.env.MONGODB_URI, {
        retryWrites: true,
        w: 'majority',
        connectTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
    });

    try {
        // Connect to MongoDB
        await client.connect();
        console.log('✅ Successfully connected to MongoDB!\n');

        // Test database access
        const db = client.db('waste-coin-db');
        const collections = await db.listCollections().toArray();

        console.log('📚 Collections in database:');
        if (collections.length === 0) {
            console.log('  (No collections yet - this is normal for a new database)');
        } else {
            collections.forEach(col => {
                console.log(`  - ${col.name}`);
            });
        }
        console.log('');

        // Test a simple operation
        await db.collection('users').findOne({});
        console.log('✅ Database operations working correctly!\n');

        console.log('==================================================');
        console.log('✅ MongoDB Connection Test PASSED');
        console.log('==================================================');

    } catch (error) {
        console.error('❌ MongoDB Connection Test FAILED\n');
        console.error('Error details:');
        console.error('  Name:', error.name);
        console.error('  Message:', error.message);

        if (error.code) {
            console.error('  Code:', error.code);
        }

        console.error('\n📋 Common solutions:');
        console.error('  1. Check if your IP address is whitelisted in MongoDB Atlas');
        console.error('  2. Verify your username and password are correct');
        console.error('  3. Check if the database cluster URL is correct');
        console.error('  4. Ensure network connectivity to MongoDB Atlas');

        process.exit(1);
    } finally {
        await client.close();
    }
}

testConnection();
