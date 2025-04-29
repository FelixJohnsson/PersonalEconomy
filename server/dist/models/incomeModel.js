"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const incomeSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    grossAmount: {
        type: Number,
    },
    netAmount: {
        type: Number,
    },
    taxRate: {
        type: Number,
    },
    frequency: {
        type: String,
        required: true,
        enum: ["monthly", "annual", "weekly", "biweekly", "daily", "quarterly"],
    },
    type: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Income = mongoose_1.default.model("Income", incomeSchema);
exports.default = Income;
