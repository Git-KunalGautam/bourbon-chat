import { MongoClient } from "mongodb";

const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
    // If the variable is still missing here, it might be due to an earlier import.
    // We specify this but allow it to continue so we can troubleshoot better.
    console.warn('Warning: MONGODB_URI is not set during mongodb-client initialization.');
}

const uri = process.env.MONGODB_URI || "";

if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        if (!uri) {
            globalWithMongo._mongoClientPromise = Promise.reject(new Error('MONGODB_URI is missing in .env.local'));
        } else {
            client = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client.connect();
        }
    }
    clientPromise = globalWithMongo._mongoClientPromise!;
} else {
    if (!uri) {
        clientPromise = Promise.reject(new Error('MONGODB_URI is missing in environment variables'));
    } else {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
