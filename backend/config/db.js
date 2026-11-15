import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecoreward';
    const conn = await mongoose.connect(connUri, {
      maxPoolSize: 50, // Connection pool for high concurrent load
      minPoolSize: 10, // Warm standby connections ready for instant queries
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // IPv4 to avoid DNS delay
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Do not crash the server in local dev environments if MongoDB is not running
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing execution in local development mode without database connection.');
    }
  }
};

export default connectDB;
