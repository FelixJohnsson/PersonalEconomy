"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var liabilitySchema = new mongoose_1.default.Schema({
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
    type: {
        type: String,
        required: true,
    },
    interestRate: {
        type: Number,
    },
    minimumPayment: {
        type: Number,
    },
    dueDate: {
        type: String,
    },
    category: {
        type: String,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});
var Liability = mongoose_1.default.model("Liability", liabilitySchema);
exports.default = Liability;
