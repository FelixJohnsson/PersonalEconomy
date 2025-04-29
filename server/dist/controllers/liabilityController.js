"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLiability = exports.updateLiability = exports.createLiability = exports.getLiabilityById = exports.getLiabilities = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const findUser_1 = require("../utils/findUser");
/**
 * Get all liabilities for the authenticated user
 * @route   GET /api/liabilities
 * @access  Private
 */
const getLiabilities = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    res.status(200).json(user.liabilities || []);
});
exports.getLiabilities = getLiabilities;
/**
 * Get a specific liability by ID
 * @route   GET /api/liabilities/:id
 * @access  Private
 */
const getLiabilityById = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    const liability = user.liabilities.find((liability) => { var _a; return ((_a = liability._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (liability) {
        res.status(200).json(liability);
    }
    else {
        res.status(404);
        throw new Error("Liability not found");
    }
});
exports.getLiabilityById = getLiabilityById;
/**
 * Create a new liability
 * @route   POST /api/liabilities
 * @access  Private
 */
const createLiability = (0, express_async_handler_1.default)(async (req, res) => {
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
        const { name, amount, interestRate, minimumPayment, type } = req.body;
        if (!name || !amount) {
            res.status(400);
            throw new Error("Please provide all required fields");
        }
        const newLiability = {
            _id: new mongoose_1.default.Types.ObjectId(),
            user: user._id,
            name,
            amount,
            interestRate,
            minimumPayment,
            type,
        };
        await userModel_1.default.updateOne({ _id: user._id }, { $push: { liabilities: newLiability } });
        res.status(201).json(newLiability);
    }
    catch (error) {
        console.error("Error creating liability:", error);
        res.status(500).json({
            message: "Error creating liability",
            error: error.message,
        });
    }
});
exports.createLiability = createLiability;
/**
 * Update a liability
 * @route   PUT /api/liabilities/:id
 * @access  Private
 */
const updateLiability = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    const { name, amount, interestRate, minimumPayment, dueDate, category, notes, type, } = req.body;
    // Build update fields
    const updateFields = {};
    if (name)
        updateFields["liabilities.$.name"] = name;
    if (amount !== undefined)
        updateFields["liabilities.$.amount"] = amount;
    if (interestRate !== undefined)
        updateFields["liabilities.$.interestRate"] = interestRate;
    if (minimumPayment !== undefined)
        updateFields["liabilities.$.minimumPayment"] = minimumPayment;
    if (dueDate !== undefined)
        updateFields["liabilities.$.dueDate"] = dueDate;
    if (category !== undefined)
        updateFields["liabilities.$.category"] = category;
    if (notes !== undefined)
        updateFields["liabilities.$.notes"] = notes;
    if (type !== undefined)
        updateFields["liabilities.$.type"] = type;
    if (Object.keys(updateFields).length === 0) {
        res.status(400);
        throw new Error("No update fields provided");
    }
    try {
        // Use findOneAndUpdate to update specific liability
        const result = await userModel_1.default.findOneAndUpdate({
            _id: req.user._id,
            "liabilities._id": req.params.id,
        }, { $set: updateFields }, { new: true });
        if (!result) {
            res.status(404);
            throw new Error("Liability not found");
        }
        // Find the updated liability
        const updatedLiability = result.liabilities.find((liability) => liability._id.toString() === req.params.id);
        res.status(200).json(updatedLiability);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to update liability",
            error: error.message,
        });
    }
});
exports.updateLiability = updateLiability;
/**
 * Delete a liability
 * @route   DELETE /api/liabilities/:id
 * @access  Private
 */
const deleteLiability = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    try {
        // Use updateOne with $pull to remove the liability
        const result = await userModel_1.default.updateOne({ _id: req.user._id }, { $pull: { liabilities: { _id: req.params.id } } });
        if (result.modifiedCount === 0) {
            res.status(404);
            throw new Error("Liability not found or already deleted");
        }
        // Get updated liabilities list
        const updatedUser = await userModel_1.default.findById(req.user._id);
        res.status(200).json({
            message: "Liability removed",
            liabilities: (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.liabilities) || [],
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to delete liability",
            error: error.message,
        });
    }
});
exports.deleteLiability = deleteLiability;
