"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importExpensesToUser = exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenseById = exports.getExpenses = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const findUser_1 = require("../utils/findUser");
const excelData_1 = require("../utils/excelData");
/**
 * Get all expenses for the authenticated user
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    res.status(200).json(user.expenses || []);
});
exports.getExpenses = getExpenses;
/**
 * Get a specific expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpenseById = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    const expense = user.expenses.find((exp) => { var _a; return ((_a = exp._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (expense) {
        res.status(200).json(expense);
    }
    else {
        res.status(404);
        throw new Error("Expense not found");
    }
});
exports.getExpenseById = getExpenseById;
/**
 * Create a new expense
 * @route   POST /api/expenses
 * @access  Private
 */
const createExpense = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    const { name, amount, category, isRecurring, date, necessityLevel, frequency, notes, } = req.body;
    // Check if required fields are provided
    if (!name || !amount || !category || !date) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }
    const newExpense = {
        _id: new mongoose_1.default.Types.ObjectId(),
        user: user._id,
        name,
        amount,
        category,
        isRecurring: isRecurring || false,
        date,
        necessityLevel: necessityLevel || "C",
        frequency,
        notes,
    };
    try {
        // Use updateOne to push the new expense directly
        await userModel_1.default.updateOne({ _id: user._id }, { $push: { expenses: newExpense } });
        res.status(201).json(newExpense);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to create expense",
            error: error.message,
        });
    }
});
exports.createExpense = createExpense;
/**
 * Update an expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    const { name, amount, category, isRecurring, date, necessityLevel, frequency, notes, } = req.body;
    // Build update fields
    const updateFields = {};
    if (name)
        updateFields["expenses.$.name"] = name;
    if (amount !== undefined)
        updateFields["expenses.$.amount"] = amount;
    if (category)
        updateFields["expenses.$.category"] = category;
    if (isRecurring !== undefined)
        updateFields["expenses.$.isRecurring"] = isRecurring;
    if (date)
        updateFields["expenses.$.date"] = date;
    if (necessityLevel !== undefined)
        updateFields["expenses.$.necessityLevel"] = necessityLevel;
    if (frequency !== undefined)
        updateFields["expenses.$.frequency"] = frequency;
    if (notes !== undefined)
        updateFields["expenses.$.notes"] = notes;
    if (Object.keys(updateFields).length === 0) {
        res.status(400);
        throw new Error("No update fields provided");
    }
    try {
        // Use findOneAndUpdate to update specific expense
        const result = await userModel_1.default.findOneAndUpdate({
            _id: req.user._id,
            "expenses._id": req.params.id,
        }, { $set: updateFields }, { new: true });
        if (!result) {
            res.status(404);
            throw new Error("Expense not found");
        }
        // Find the updated expense
        const updatedExpense = result.expenses.find((exp) => exp._id.toString() === req.params.id);
        res.status(200).json(updatedExpense);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to update expense",
            error: error.message,
        });
    }
});
exports.updateExpense = updateExpense;
/**
 * Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    try {
        // Use updateOne with $pull to remove the expense
        const result = await userModel_1.default.updateOne({ _id: req.user._id }, { $pull: { expenses: { _id: req.params.id } } });
        if (result.modifiedCount === 0) {
            res.status(404);
            throw new Error("Expense not found or already deleted");
        }
        // Get updated expenses list
        const updatedUser = await userModel_1.default.findById(req.user._id);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to delete expense",
            error: error.message,
        });
    }
});
exports.deleteExpense = deleteExpense;
/**
 * Imports expenses from a JSON file to a user's account
 * @route   POST /api/expenses/import-file
 * @access  Private
 */
const importExpensesToUser = (0, express_async_handler_1.default)(async (req, res) => {
    const filePath = "/Users/felix.johnsson/EconomyTracker/economy-tracker/server/src/utils/output/Handelsbanken_Account_Transactions_2025-04-25_processed.json";
    try {
        const user = await (0, findUser_1.findUser)(req);
        if (user === 400) {
            res.status(400);
            throw new Error("Not authorized, no user found");
        }
        if (user === 404) {
            res.status(404);
            throw new Error("User not found");
        }
        const fileContent = await promises_1.default.readFile(path_1.default.resolve(filePath), "utf8");
        const expenses = JSON.parse(fileContent);
        if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
            console.error("No valid expenses found in the file");
            res
                .status(400)
                .json({ message: "No valid expenses found in the file" });
            return;
        }
        // Create expense objects with IDs
        const newExpenses = expenses.map((expense) => ({
            _id: new mongoose_1.default.Types.ObjectId(),
            user: user._id,
            name: expense.name,
            amount: expense.amount,
            category: (0, excelData_1.categorizeTransaction)(expense.name),
            isRecurring: expense.isRecurring,
            date: expense.date,
            day: expense.day,
            necessityLevel: "C",
            frequency: expense.frequency,
        }));
        // Add all expenses to the user's expenses array
        await userModel_1.default.updateOne({ _id: user._id }, { $push: { expenses: { $each: newExpenses } } });
        res.status(200).json({
            message: "Expenses imported successfully",
            count: newExpenses.length,
        });
    }
    catch (error) {
        console.error("Error importing expenses:", error);
        res.status(500).json({ message: "Error importing expenses" });
    }
});
exports.importExpensesToUser = importExpensesToUser;
