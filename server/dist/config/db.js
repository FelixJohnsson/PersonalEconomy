"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Connect to MongoDB
 * This function establishes a connection to MongoDB using the connection string
 * from environment variables
 */
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
    }
    catch (error) {
        const err = error;
        console.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
    }
};
exports.default = connectDB;
