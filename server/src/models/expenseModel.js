"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var expenseSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    amount: {
        type: Number,
        required: [true, "Please add an amount"],
    },
    category: {
        type: String,
        required: true,
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    date: {
        type: String,
        required: true,
    },
    necessityLevel: {
        type: String,
    },
    frequency: {
        type: String,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});
var Expense = mongoose_1.default.model("Expense", expenseSchema);
exports.default = Expense;
