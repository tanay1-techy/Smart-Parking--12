import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongoServer;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // Fallback to in-memory MongoDB if local is not available or explicitly requested
    if (!uri || uri.includes('localhost') || process.env.USE_MEMORY_DB === 'true') {
      try {
        // Try connecting to local first
        if (!process.env.USE_MEMORY_DB && uri) {
          await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
          console.log(`MongoDB Connected (Local): ${mongoose.connection.host}`);
          return;
        }
      } catch (err) {
        console.log('Local MongoDB not found, falling back to Memory Server...');
      }

      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log(`Starting MongoDB Memory Server at ${uri}`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const stopDB = async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
};
