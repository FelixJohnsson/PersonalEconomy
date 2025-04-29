"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.subscriptionSchema = new mongoose_1.default.Schema({
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
    frequency: {
        type: String,
    },
    category: {
        type: String,
    },
    billingDate: {
        type: String,
    },
    necessityLevel: {
        type: String,
    },
    active: {
        type: Boolean,
    },
}, {
    timestamps: true,
});
const Subscription = mongoose_1.default.model("Subscription", exports.subscriptionSchema);
exports.default = Subscription;
