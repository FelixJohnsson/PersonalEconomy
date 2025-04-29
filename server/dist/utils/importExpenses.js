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
exports.importExpensesToUser = importExpensesToUser;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const findUser_1 = require("./findUser");
const userModel_1 = __importDefault(require("../models/userModel"));
/**
 * Imports expenses from a JSON file to a user's account
 * @param filePath Path to the JSON file containing expenses
 * @param userEmail Email of the user to import expenses for
 * @returns Number of expenses imported
 */
async function importExpensesToUser(filePath, userEmail) {
    try {
        // Read and parse the JSON file
        const fileContent = await fs.readFile(path.resolve(filePath), "utf8");
        const expenses = JSON.parse(fileContent);
        if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
            console.error("No valid expenses found in the file");
            return 0;
        }
        // Find the user by email
        const user = await (0, findUser_1.findUserByEmail)(userEmail);
        if (user === 400 || user === 404) {
            console.error(`User with email ${userEmail} not found`);
            return 0;
        }
        // Map expenses to the correct format for embedded documents
        const mappedExpenses = expenses.map((expense) => ({
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            isRecurring: expense.isRecurring,
            date: expense.date,
            necessityLevel: expense.necessityLevel,
            frequency: expense.frequency,
            notes: `Imported from bank transactions. Day: ${expense.day}`,
        }));
        // Add expenses to user.expenses array using $push
        const updatedUser = await userModel_1.default.findByIdAndUpdate(user._id, { $push: { expenses: { $each: mappedExpenses } } }, { new: true });
        if (!updatedUser) {
            console.error(`Failed to update user ${userEmail} with new expenses`);
            return 0;
        }
        console.log(`Successfully imported ${mappedExpenses.length} expenses for user ${userEmail}`);
        return mappedExpenses.length;
    }
    catch (error) {
        console.error("Error importing expenses:", error);
        throw error;
    }
}
// Command line script to run the import
async function main() {
    try {
        // Connect to MongoDB - remove this if running within a server where mongoose is already connected
        if (mongoose_1.default.connection.readyState === 0) {
            const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/economy-tracker";
            await mongoose_1.default.connect(MONGO_URI);
            console.log("Connected to MongoDB");
        }
        else {
            console.log("Already connected to MongoDB");
        }
        const filePath = process.argv[2] ||
            "economy-tracker/server/src/utils/output/Handelsbanken_Account_Transactions_2025-04-25_processed.json";
        const userEmail = process.argv[3] || "felix.johnsson@proton.me";
        const importCount = await importExpensesToUser(filePath, userEmail);
        console.log(`Imported ${importCount} expenses`);
        // Only disconnect if we connected in this script
        if (mongoose_1.default.connection.readyState === 1 && !process.env.NODE_ENV) {
            await mongoose_1.default.disconnect();
            console.log("Disconnected from MongoDB");
        }
        if (!process.env.NODE_ENV) {
            process.exit(0);
        }
    }
    catch (error) {
        console.error("Import failed:", error);
        if (!process.env.NODE_ENV) {
            process.exit(1);
        }
    }
}
// Run the script if this file is executed directly
if (require.main === module) {
    main();
}
