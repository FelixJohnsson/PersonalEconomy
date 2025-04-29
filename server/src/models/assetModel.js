"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var assetSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    value: {
        type: Number,
        required: [true, "Please add a value"],
    },
    type: {
        type: String,
        required: true,
    },
    acquisitionDate: {
        type: String,
    },
    notes: {
        type: String,
    },
    category: {
        type: String,
    },
    growthRate: {
        type: Number,
    },
    initialValue: {
        type: Number,
    },
    purchaseDate: {
        type: String,
    },
    savingsGoalId: {
        type: String,
        default: null,
    },
    values: [
        {
            date: String,
            value: Number,
        },
    ],
    deposits: [
        {
            date: String,
            amount: Number,
            notes: String,
        },
    ],
}, {
    timestamps: true,
});
var Asset = mongoose_1.default.model("Asset", assetSchema);
exports.default = Asset;
