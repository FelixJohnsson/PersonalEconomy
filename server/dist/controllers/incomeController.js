"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIncome = exports.updateIncome = exports.createIncome = exports.getIncome = exports.getIncomes = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
/**
 * Get all incomes for a user
 * @route   GET /api/incomes
 * @access  Private
 */
const getIncomes = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const user = await userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    res.json(user === null || user === void 0 ? void 0 : user.incomes);
});
exports.getIncomes = getIncomes;
/**
 * Get a single income
 * @route   GET /api/incomes/:id
 * @access  Private
 */
const getIncome = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const user = await userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    const income = user === null || user === void 0 ? void 0 : user.incomes.find((income) => { var _a; return ((_a = income === null || income === void 0 ? void 0 : income._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (!income) {
        res.status(404);
        throw new Error("Income not found");
    }
    res.json(income);
});
exports.getIncome = getIncome;
/**
 * Create a new income
 * @route   POST /api/incomes
 * @access  Private
 */
const createIncome = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, no user found");
    }
    const incomeData = req.body;
    const { name, grossAmount, netAmount, taxRate, frequency, type, date, isRecurring, } = incomeData;
    // Validate required fields
    if (!name ||
        !grossAmount ||
        !netAmount ||
        !taxRate ||
        !frequency ||
        !type ||
        !date ||
        !isRecurring) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }
    const newIncome = {
        user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
        ...incomeData,
    };
    const user = await userModel_1.default.findByIdAndUpdate(req.user._id, { $push: { incomes: newIncome } }, { new: true }).populate("incomes");
    if (user) {
        const addedIncome = user.incomes[user.incomes.length - 1];
        res.status(201).json(addedIncome);
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
});
exports.createIncome = createIncome;
/**
 * Update an income
 * @route   PUT /api/incomes/:id
 * @access  Private
 */
const updateIncome = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const user = await userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const income = user === null || user === void 0 ? void 0 : user.incomes.find((income) => { var _a; return ((_a = income === null || income === void 0 ? void 0 : income._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (!income) {
        res.status(404);
        throw new Error("Income not found");
    }
    const { name, grossAmount, netAmount, taxRate, frequency, type, date, isRecurring, } = req.body;
    income.name = name || income.name;
    income.grossAmount =
        grossAmount !== undefined ? grossAmount : income.grossAmount;
    income.netAmount = netAmount !== undefined ? netAmount : income.netAmount;
    income.taxRate = taxRate !== undefined ? taxRate : income.taxRate;
    income.frequency = frequency !== undefined ? frequency : income.frequency;
    income.type = type !== undefined ? type : income.type;
    income.date = date !== undefined ? date : income.date;
    income.isRecurring =
        isRecurring !== undefined ? isRecurring : income.isRecurring;
    // Replace the old income with the updated income
    user.incomes = user.incomes.map((income) => income._id.toString() === req.params.id ? income : income);
    await user.save();
    res.status(200).json(user.incomes);
});
exports.updateIncome = updateIncome;
/**
 * Delete an income
 * @route   DELETE /api/incomes/:id
 * @access  Private
 */
const deleteIncome = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            res.status(401);
            throw new Error("Not authorized, no user found");
        }
        // Use updateOne with $pull to remove the income by ID
        const result = await userModel_1.default.updateOne({ _id: req.user._id }, { $pull: { incomes: { _id: req.params.id } } });
        if (result.modifiedCount === 0) {
            res.status(404);
            throw new Error("Income not found or already deleted");
        }
        // Get updated list of incomes
        const updatedUser = await userModel_1.default.findById(req.user._id);
        res.status(200).json((updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.incomes) || []);
    }
    catch (error) {
        console.error("Error deleting income:", error);
        res.status(500).json({ message: "Error deleting income" });
    }
});
exports.deleteIncome = deleteIncome;
