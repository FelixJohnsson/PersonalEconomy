"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const assetSchema = new mongoose_1.default.Schema({
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
const Asset = mongoose_1.default.model("Asset", assetSchema);
exports.default = Asset;
