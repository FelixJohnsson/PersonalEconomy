"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserData = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
/**
 * Get all user data
 * @route   GET /api/user-data
 * @access  Private
 */
const getUserData = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, no user found");
    }
    const user = await userModel_1.default.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.status(200).json({ user });
});
exports.getUserData = getUserData;
