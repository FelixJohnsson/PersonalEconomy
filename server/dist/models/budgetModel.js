"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const trackingSchema = new mongoose_1.default.Schema({
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
});
const BudgetSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    recurrence: {
        type: String,
        enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
    },
    tracking: [trackingSchema],
}, {
    timestamps: true,
});
const Budget = mongoose_1.default.model("Budget", BudgetSchema);
exports.default = Budget;
