import mongoose from "mongoose";

/**
 * Connect to MongoDB
 * This function establishes a connection to MongoDB using the connection string
 * from environment variables
 */
const connectDB = async (): Promise<mongoose.Connection> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    const err = error as Error;
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
