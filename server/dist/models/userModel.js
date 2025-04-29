"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frequency = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const subscriptionModel_1 = require("./subscriptionModel");
const incomeModel_1 = __importDefault(require("./incomeModel"));
const expenseModel_1 = __importDefault(require("./expenseModel"));
const assetModel_1 = __importDefault(require("./assetModel"));
const liabilityModel_1 = __importDefault(require("./liabilityModel"));
const budgetModel_1 = __importDefault(require("./budgetModel"));
const noteModel_1 = require("./noteModel");
var Frequency;
(function (Frequency) {
    Frequency["MONTHLY"] = "monthly";
    Frequency["WEEKLY"] = "weekly";
    Frequency["BIWEEKLY"] = "biweekly";
    Frequency["DAILY"] = "daily";
    Frequency["QUARTERLY"] = "quarterly";
    Frequency["YEARLY"] = "yearly";
})(Frequency || (exports.Frequency = Frequency = {}));
// Create schemas from models to embed in user
const incomeSchema = incomeModel_1.default.schema;
const expenseSchema = expenseModel_1.default.schema;
const assetSchema = assetModel_1.default.schema;
const liabilitySchema = liabilityModel_1.default.schema;
const budgetSchema = budgetModel_1.default.schema;
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [
            // eslint-disable-next-line no-useless-escape
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minlength: 6,
        select: false,
    },
    isSetupComplete: {
        type: Boolean,
        default: false,
    },
    // Add embedded data arrays
    incomes: [incomeSchema],
    expenses: [expenseSchema],
    assets: [assetSchema],
    liabilities: [liabilitySchema],
    subscriptions: [subscriptionModel_1.subscriptionSchema],
    budgets: [budgetSchema],
    notes: [noteModel_1.noteSchema],
}, {
    timestamps: true,
});
// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
    const secret = process.env.JWT_SECRET || "defaultsecret";
    const expiry = process.env.JWT_EXPIRE || "30d";
    // @ts-ignore - Ignoring type checking for this call due to typescript's jsonwebtoken issues
    return jsonwebtoken_1.default.sign({ id: this._id }, secret, { expiresIn: expiry });
};
// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) {
        return false;
    }
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    }
    catch (error) {
        console.error("Error comparing passwords:", error);
        return false;
    }
};
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
