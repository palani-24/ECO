import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecoreward';
console.log('Testing connection to:', connUri.replace(/:([^@]+)@/, ':****@')); // Hide password

const client = new MongoClient(connUri, {
  serverSelectionTimeoutMS: 5000,
});

async function run() {
  try {
    await client.connect();
    console.log('Successfully connected!');
    const dbs = await client.db().admin().listDatabases();
    console.log('Databases:', dbs);
  } catch (err) {
    console.error('Raw driver failed to connect:', err.message);
    if (err.reason && err.reason.servers) {
      console.log('Servers details:');
      for (const [address, server] of err.reason.servers.entries()) {
        console.log(`- ${address}: status = ${server.type}, error =`, server.error);
      }
    } else {
      console.error(err);
    }
  } finally {
    await client.close();
  }
}

run();
