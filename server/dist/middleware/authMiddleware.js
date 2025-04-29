"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
/**
 * Protect routes - Authentication middleware
 * Verifies the JWT token in the Authorization header
 */
const protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token;
    // Check if Authorization header exists and starts with Bearer
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Get user from the token (excluding password)
            const user = await userModel_1.default.findById(decoded.id).select("-password");
            if (user) {
                req.user = user;
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }
    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});
exports.protect = protect;
