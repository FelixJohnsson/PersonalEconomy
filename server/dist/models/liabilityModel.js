"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const liabilitySchema = new mongoose_1.default.Schema({
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
const Liability = mongoose_1.default.model("Liability", liabilitySchema);
exports.default = Liability;
