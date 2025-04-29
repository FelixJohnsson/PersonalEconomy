"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDbConnection = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Test database connection
 * @route   GET /api/test/db
 * @access  Public
 */
const testDbConnection = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const state = mongoose_1.default.connection.readyState;
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
            host: mongoose_1.default.connection.host,
            databaseName: mongoose_1.default.connection.name,
        });
    }
    catch (error) {
        const err = error;
        res.status(500).json({
            success: false,
            message: `Database connection test failed: ${err.message}`,
        });
    }
});
exports.testDbConnection = testDbConnection;
