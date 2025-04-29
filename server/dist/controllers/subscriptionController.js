"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubscription = exports.updateSubscription = exports.createSubscription = exports.getSubscriptionById = exports.getSubscriptions = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const findUser_1 = require("../utils/findUser");
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Get all subscriptions for the authenticated user
 * @route   GET /api/subscriptions
 * @access  Private
 */
const getSubscriptions = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    res.status(200).json(user.subscriptions);
});
exports.getSubscriptions = getSubscriptions;
/**
 * Get a specific subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
const getSubscriptionById = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    const subscription = user.subscriptions.find((sub) => { var _a; return ((_a = sub._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (subscription) {
        res.status(200).json(subscription);
    }
    else {
        res.status(404);
        throw new Error("Subscription not found");
    }
});
exports.getSubscriptionById = getSubscriptionById;
/**
 * Create a new subscription
 * @route   POST /api/subscriptions
 * @access  Private
 */
const createSubscription = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    const { name, amount, frequency, category, billingDate, necessityLevel, isActive, } = req.body;
    // Check if required fields are provided
    if (!name || !amount || !frequency || !category || !billingDate) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }
    const newSubscription = {
        _id: new mongoose_1.default.Types.ObjectId(),
        user: user._id,
        name,
        amount,
        frequency,
        category,
        billingDate,
        necessityLevel: necessityLevel || "C",
        active: isActive !== undefined ? isActive : true,
    };
    try {
        // Use updateOne to push the new subscription directly
        await userModel_1.default.updateOne({ _id: user._id }, { $push: { subscriptions: newSubscription } });
        res.status(201).json(newSubscription);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to create subscription",
            error: error.message,
        });
    }
});
exports.createSubscription = createSubscription;
/**
 * Update a subscription
 * @route   PUT /api/subscriptions/:id
 * @access  Private
 */
const updateSubscription = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    const { name, amount, frequency, category, billingDate, necessityLevel, active, } = req.body;
    // Build update fields
    const updateFields = {};
    if (name)
        updateFields["subscriptions.$.name"] = name;
    if (amount !== undefined)
        updateFields["subscriptions.$.amount"] = amount;
    if (frequency)
        updateFields["subscriptions.$.frequency"] = frequency;
    if (category !== undefined)
        updateFields["subscriptions.$.category"] = category;
    if (billingDate !== undefined)
        updateFields["subscriptions.$.billingDate"] = billingDate;
    if (necessityLevel !== undefined)
        updateFields["subscriptions.$.necessityLevel"] = necessityLevel;
    if (active !== undefined)
        updateFields["subscriptions.$.active"] = active;
    if (Object.keys(updateFields).length === 0) {
        res.status(400);
        throw new Error("No update fields provided");
    }
    try {
        // Use findOneAndUpdate to update specific subscription
        const result = await userModel_1.default.findOneAndUpdate({
            _id: req.user._id,
            "subscriptions._id": req.params.id,
        }, { $set: updateFields }, { new: true });
        if (!result) {
            res.status(404);
            throw new Error("Subscription not found");
        }
        // Find the updated subscription
        const updatedSubscription = result.subscriptions.find((sub) => sub._id.toString() === req.params.id);
        res.status(200).json(updatedSubscription);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to update subscription",
            error: error.message,
        });
    }
});
exports.updateSubscription = updateSubscription;
/**
 * Delete a subscription
 * @route   DELETE /api/subscriptions/:id
 * @access  Private
 */
const deleteSubscription = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    try {
        // Use updateOne with $pull to remove the subscription
        const result = await userModel_1.default.updateOne({ _id: req.user._id }, { $pull: { subscriptions: { _id: req.params.id } } });
        if (result.modifiedCount === 0) {
            res.status(404);
            throw new Error("Subscription not found or already deleted");
        }
        // Get updated subscriptions list
        const updatedUser = await userModel_1.default.findById(req.user._id);
        res.status(200).json({
            message: "Subscription removed",
            subscriptions: (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.subscriptions) || [],
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to delete subscription",
            error: error.message,
        });
    }
});
exports.deleteSubscription = deleteSubscription;
