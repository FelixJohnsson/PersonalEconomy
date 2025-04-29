"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
/**
 * Register a new user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    // Check if required fields are provided
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }
    // Check if user exists
    const userExists = await userModel_1.default.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    // Create user
    const user = await userModel_1.default.create({
        name,
        email,
        password,
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isSetupComplete: user.isSetupComplete,
            token: user.getSignedJwtToken(),
        });
    }
    else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});
exports.registerUser = registerUser;
/**
 * Authenticate a user and get token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const { email, password } = req.body;
        console.warn("Login user", email, password);
        // Check if email and password are provided
        if (!email || !password) {
            res.status(400);
            throw new Error("Please provide email and password");
        }
        // Check for user
        const user = await userModel_1.default.findOne({ email }).select("+password");
        if (!user) {
            res.status(401);
            throw new Error("Invalid credentials");
        }
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        console.warn("Is match", isMatch, user);
        if (!isMatch) {
            res.status(401);
            throw new Error("Invalid credentials");
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isSetupComplete: user.isSetupComplete,
            token: user.getSignedJwtToken(),
        });
    }
    catch (error) {
        res.status(401);
        console.warn("Error", error);
        throw new Error(error.message);
    }
});
exports.loginUser = loginUser;
/**
 * Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const user = await userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isSetupComplete: user.isSetupComplete,
        });
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
});
exports.getUserProfile = getUserProfile;
/**
 * Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const user = await userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isSetupComplete =
            req.body.isSetupComplete !== undefined
                ? req.body.isSetupComplete
                : user.isSetupComplete;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isSetupComplete: updatedUser.isSetupComplete,
            token: updatedUser.getSignedJwtToken(),
        });
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
});
exports.updateUserProfile = updateUserProfile;
