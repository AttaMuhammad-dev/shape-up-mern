import mongoose from 'mongoose';

let connectionPromise;

export default async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  await connectionPromise;
  return mongoose.connection;
}
