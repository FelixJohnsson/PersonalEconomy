"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssetValue = exports.addAssetDeposit = exports.deleteAsset = exports.updateAsset = exports.createAsset = exports.getAssetById = exports.getAssets = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/userModel"));
/**
 * Get all assets for the authenticated user
 * @route   GET /api/assets
 * @access  Private
 */
const getAssets = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, no user found");
    }
    const user = await userModel_1.default.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    if (!user.assets) {
        res.status(204).json([]);
        return;
    }
    res.status(200).json(user === null || user === void 0 ? void 0 : user.assets);
});
exports.getAssets = getAssets;
/**
 * Get a specific asset by ID
 * @route   GET /api/assets/:id
 * @access  Private
 */
const getAssetById = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, no user found");
    }
    const user = await userModel_1.default.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const asset = user.assets.find((asset) => { var _a; return ((_a = asset === null || asset === void 0 ? void 0 : asset._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (asset) {
        res.status(200).json(asset);
    }
    else {
        res.status(404);
        throw new Error("Asset not found");
    }
});
exports.getAssetById = getAssetById;
/**
 * Create a new asset
 * @route   POST /api/assets
 * @access  Private
 */
const createAsset = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, no user found");
    }
    const { name, value, type, acquisitionDate, category } = req.body;
    // Check if required fields are provided
    if (!name || !value || !type) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }
    const newAsset = {
        name,
        value,
        type,
        acquisitionDate,
        category,
        values: [
            {
                date: new Date().toISOString(),
                value,
            },
        ],
        deposits: [
            {
                date: new Date().toISOString(),
                amount: value,
            },
        ],
    };
    // Find and update the user document directly
    const user = await userModel_1.default.findByIdAndUpdate(req.user._id, { $push: { assets: newAsset } }, { new: true }).populate("assets");
    if (user) {
        const addedAsset = user.assets[user.assets.length - 1];
        res.status(201).json(addedAsset);
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
});
exports.createAsset = createAsset;
/**
 * Update an asset
 * @route   PUT /api/assets/:id
 * @access  Private
 */
const updateAsset = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, no user found");
    }
    const user = await userModel_1.default.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const asset = user.assets.find((asset) => { var _a; return ((_a = asset === null || asset === void 0 ? void 0 : asset._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (!asset) {
        res.status(404);
        throw new Error("Asset not found");
    }
    const { name, value, type, acquisitionDate, notes, category, growthRate } = req.body;
    // Update asset fields if provided
    asset.name = name || asset.name;
    asset.value = value !== undefined ? value : asset.value;
    asset.type = type || asset.type;
    // Update optional fields
    if (acquisitionDate !== undefined)
        asset.acquisitionDate = acquisitionDate;
    if (notes !== undefined)
        asset.notes = notes;
    if (category !== undefined)
        asset.category = category;
    if (growthRate !== undefined)
        asset.growthRate = growthRate;
    await asset.save();
    const allAssets = await userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).populate("assets");
    res.status(200).json(allAssets === null || allAssets === void 0 ? void 0 : allAssets.assets);
});
exports.updateAsset = updateAsset;
/**
 * Delete an asset
 * @route   DELETE /api/assets/:id
 * @access  Private
 */
const deleteAsset = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        if (!req.user) {
            res.status(401);
            throw new Error("Not authorized, no user found");
        }
        const user = await userModel_1.default.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        const asset = user.assets.find((asset) => { var _a; return ((_a = asset === null || asset === void 0 ? void 0 : asset._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
        if (!asset) {
            res.status(404);
            throw new Error("Asset not found");
        }
        const result = await userModel_1.default.updateOne({ _id: req.user._id }, { $pull: { assets: { _id: req.params.id } } });
        if (result.modifiedCount === 0) {
            res.status(404);
            throw new Error("Asset not found or already deleted");
        }
        const updatedUser = await userModel_1.default.findById(req.user._id);
        res.status(200).json(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.assets);
    }
    catch (error) {
        console.warn("Error deleting asset", error);
        res.status(400).json({
            message: "Failed to delete asset",
            error: error.message,
        });
    }
});
exports.deleteAsset = deleteAsset;
/**
 * Add a deposit to an asset
 * @route   POST /api/user-data/assets/:id/deposit
 * @access  Private
 */
const addAssetDeposit = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, no user found");
    }
    const user = await userModel_1.default.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const asset = user.assets.find((ast) => { var _a; return ((_a = ast === null || ast === void 0 ? void 0 : ast._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (!asset) {
        res.status(404);
        throw new Error("Asset not found");
    }
    const { amount, date } = req.body;
    if (amount === undefined || !date) {
        res.status(400);
        throw new Error("Please provide amount and date");
    }
    // Initialize deposits array if it doesn't exist
    if (!asset.deposits)
        asset.deposits = [];
    // Add new deposit
    asset.deposits.push({
        date,
        amount,
    });
    await user.save();
    res.status(201).json(asset);
});
exports.addAssetDeposit = addAssetDeposit;
/**
 * Update an asset value
 * @route   PUT /api/user-data/assets/:id/value
 * @access  Private
 */
const updateAssetValue = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        if (!req.user) {
            res.status(401);
            throw new Error("Not authorized, no user found");
        }
        const { value, date } = req.body;
        if (value === undefined || !date) {
            res.status(400);
            throw new Error("Please provide value and date");
        }
        if (value < 0) {
            res.status(400);
            throw new Error("Value cannot be negative");
        }
        const result = await userModel_1.default.updateOne({
            _id: req.user._id,
            "assets._id": req.params.id,
        }, {
            $push: {
                "assets.$.values": {
                    date,
                    value,
                },
            },
            $set: {
                "assets.$.value": value,
            },
        });
        if (result.matchedCount === 0) {
            res.status(404);
            throw new Error("Asset not found");
        }
        const updatedUser = await userModel_1.default.findById(req.user._id).populate("assets");
        res.status(200).json(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.assets);
    }
    catch (error) {
        console.warn("Error updating asset value", error);
        res.status(400).json({
            message: "Failed to update asset value",
            error: error.message,
        });
    }
});
exports.updateAssetValue = updateAssetValue;
