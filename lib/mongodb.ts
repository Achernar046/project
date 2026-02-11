import { MongoClient, Db } from 'mongodb';
import { promises as dns } from 'dns';

// Configure DNS to use Google DNS servers for better MongoDB Atlas connectivity
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
    retryWrites: true,
    w: 'majority' as const,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the connection
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, create a new client for each connection
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;

// Helper function to get database
export async function getDatabase(): Promise<Db> {
    const client = await clientPromise;
    return client.db('waste-coin-db');
}
