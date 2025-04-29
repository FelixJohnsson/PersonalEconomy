"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackBudgetSpending = exports.deleteBudget = exports.updateBudget = exports.createBudget = exports.getBudgetById = exports.getBudgets = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const findUser_1 = require("../utils/findUser");
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Get all budgets for the authenticated user
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    res.status(200).json(user.budgets || []);
});
exports.getBudgets = getBudgets;
/**
 * Get a specific budget by ID
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudgetById = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    const budget = user.budgets.find((budget) => { var _a; return ((_a = budget._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (budget) {
        res.status(200).json(budget);
    }
    else {
        res.status(404);
        throw new Error("Budget not found");
    }
});
exports.getBudgetById = getBudgetById;
/**
 * Create a new budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    const { name, amount, category } = req.body;
    // Check if required fields are provided
    if (!name || amount === undefined) {
        res.status(400);
        throw new Error("Please provide name and amount");
    }
    try {
        const newBudget = {
            user: user._id,
            name,
            amount,
            category,
        };
        await userModel_1.default.updateOne({ _id: user._id }, { $push: { budgets: newBudget } }).populate("budgets");
        // Get the updated user
        const updatedUser = await userModel_1.default.findById(user._id).populate("budgets");
        console.log("Updated user", updatedUser);
        res.status(201).json(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.budgets);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to create budget",
            error: error.message,
        });
    }
});
exports.createBudget = createBudget;
/**
 * Update a budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    const { name, amount, category, startDate, endDate, recurrence } = req.body;
    // Build update fields
    const updateFields = {};
    if (name)
        updateFields["budgets.$.name"] = name;
    if (amount !== undefined)
        updateFields["budgets.$.amount"] = amount;
    if (category !== undefined)
        updateFields["budgets.$.category"] = category;
    if (startDate !== undefined)
        updateFields["budgets.$.startDate"] = startDate;
    if (endDate !== undefined)
        updateFields["budgets.$.endDate"] = endDate;
    if (recurrence !== undefined)
        updateFields["budgets.$.recurrence"] = recurrence;
    if (Object.keys(updateFields).length === 0) {
        res.status(400);
        throw new Error("No update fields provided");
    }
    try {
        // Use findOneAndUpdate to update specific budget
        const result = await userModel_1.default.findOneAndUpdate({
            _id: req.user._id,
            "budgets._id": req.params.id,
        }, { $set: updateFields }, { new: true });
        if (!result) {
            res.status(404);
            throw new Error("Budget not found");
        }
        // Find the updated budget
        const updatedBudget = result.budgets.find((budget) => budget._id.toString() === req.params.id);
        res.status(200).json(updatedBudget);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to update budget",
            error: error.message,
        });
    }
});
exports.updateBudget = updateBudget;
/**
 * Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    try {
        // Use updateOne with $pull to remove the budget
        const result = await userModel_1.default.updateOne({ _id: req.user._id }, { $pull: { budgets: { _id: req.params.id } } });
        if (result.modifiedCount === 0) {
            res.status(404);
            throw new Error("Budget not found or already deleted");
        }
        // Get updated budgets list
        const updatedUser = await userModel_1.default.findById(req.user._id);
        res.status(200).json({
            message: "Budget removed",
            budgets: (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.budgets) || [],
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to delete budget",
            error: error.message,
        });
    }
});
exports.deleteBudget = deleteBudget;
/**
 * Track spending against a budget
 * @route   POST /api/budgets/:id/track
 * @access  Private
 */
const trackBudgetSpending = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    const { date, amount, description } = req.body;
    if (!date || amount === undefined) {
        res.status(400);
        throw new Error("Please provide date and amount");
    }
    try {
        // Find the user and budget
        const user = await userModel_1.default.findOne({
            _id: req.user._id,
            "budgets._id": req.params.id,
        });
        if (!user) {
            res.status(404);
            throw new Error("Budget not found");
        }
        // Create the tracking entry
        const trackingEntry = {
            _id: new mongoose_1.default.Types.ObjectId(),
            date,
            amount,
            description: description || "",
        };
        // Add the tracking entry to the budget
        await userModel_1.default.updateOne({
            _id: req.user._id,
            "budgets._id": req.params.id,
        }, { $push: { "budgets.$.tracking": trackingEntry } });
        // Get the updated budget
        const updatedUser = await userModel_1.default.findOne({
            _id: req.user._id,
            "budgets._id": req.params.id,
        });
        const updatedBudget = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.budgets.find((budget) => budget._id.toString() === req.params.id);
        res.status(200).json(updatedBudget);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to track budget spending",
            error: error.message,
        });
    }
});
exports.trackBudgetSpending = trackBudgetSpending;
