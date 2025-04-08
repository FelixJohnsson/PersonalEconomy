import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

/**
 * Test database connection
 * @route   GET /api/test/db
 * @access  Public
 */
const testDbConnection = asyncHandler(async (req: Request, res: Response) => {
  try {
    const state = mongoose.connection.readyState;
    let status;

    switch (state) {
      case 0:
        status = "disconnected";
        break;
      case 1:
        status = "connected";
        break;
      case 2:
        status = "connecting";
        break;
      case 3:
        status = "disconnecting";
        break;
      default:
        status = "unknown";
    }

    res.status(200).json({
      success: true,
      message: `Database connection status: ${status}`,
      connectionState: state,
      host: mongoose.connection.host,
      databaseName: mongoose.connection.name,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: `Database connection test failed: ${err.message}`,
    });
  }
});

export { testDbConnection };
