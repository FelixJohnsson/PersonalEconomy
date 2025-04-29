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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayOfWeek = exports.Frequency = exports.CATEGORY_KEYWORDS = exports.EXPENSE_CATEGORIES = void 0;
exports.parseTransactionExcel = parseTransactionExcel;
exports.categorizeTransaction = categorizeTransaction;
const ExcelJS = __importStar(require("exceljs"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
exports.EXPENSE_CATEGORIES = [
    "Housing",
    "Transportation",
    "Food",
    "Lunch",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Personal Care",
    "Education",
    "Clothing",
    "Electronics",
    "Debt Payments",
    "Savings",
    "Gifts & Donations",
    "Travel",
    "Transfer",
    "Income",
    "Other",
];
// Category keywords mapping
exports.CATEGORY_KEYWORDS = {
    Housing: ["hyra", "hyran", "rent", "bostad", "apartment"],
    Transportation: ["sj", "sl", "uber", "taxi", "parking", "parkering"],
    Food: [
        "ica",
        "coop",
        "willys",
        "hemköp",
        "lidl",
        "mat",
        "haojie",
        "supermarke",
    ],
    Lunch: ["lunch", "restaurang", "subway"],
    Entertainment: [
        "prel",
        "arena",
        "bio",
        "cinema",
        "spotify",
        "netflix",
        "hbo",
    ],
    Savings: ["avanza", "nordnet", "investeringssparkonto", "fonder", "stocks"],
    Transfer: ["revolut", "överföring", "swish", "transfer"],
    Income: ["salary", "epic", "lön", "dividend", "utdelning"],
    // Add more categories and keywords as needed
    // Default mappings for other categories
    Utilities: [
        "electric",
        "vatten",
        "water",
        "gas",
        "tele2",
        "telia",
        "internet",
    ],
    Healthcare: [
        "läkare",
        "doctor",
        "apotek",
        "pharmacy",
        "tandläkare",
        "dental",
    ],
    "Personal Care": ["frisör", "haircut", "gym", "spa"],
    Education: ["kurs", "course", "book", "bok", "utbildning"],
    Clothing: ["h&m", "zara", "kläder", "shoes", "skor"],
    Electronics: ["elgiganten", "mediamarkt", "kjell", "webhallen"],
    "Debt Payments": ["loan", "lån", "mortgage", "csn"],
    "Gifts & Donations": ["present", "gift", "donation"],
    Travel: ["hotel", "hotell", "flight", "flyg", "airbnb", "booking"],
    Other: [],
};
// Define the expense data interface
var Frequency;
(function (Frequency) {
    Frequency["OneTime"] = "OneTime";
    Frequency["Monthly"] = "Monthly";
    Frequency["Weekly"] = "Weekly";
    Frequency["Yearly"] = "Yearly";
})(Frequency || (exports.Frequency = Frequency = {}));
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["Sunday"] = "Sunday";
    DayOfWeek["Monday"] = "Monday";
    DayOfWeek["Tuesday"] = "Tuesday";
    DayOfWeek["Wednesday"] = "Wednesday";
    DayOfWeek["Thursday"] = "Thursday";
    DayOfWeek["Friday"] = "Friday";
    DayOfWeek["Saturday"] = "Saturday";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
// Global transaction history to detect recurring patterns
const transactionHistory = {};
/**
 * Maps transaction data from banking excel to the expense format
 * @param filePath Path to the Excel file
 * @returns Promise with array of parsed ExpenseFormData objects
 */
async function parseTransactionExcel(filePath) {
    var _a;
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(path.resolve(filePath));
        const worksheet = workbook.worksheets[0];
        // Find the row where transactions start (look for column headers)
        let headerRowIndex = -1;
        worksheet.eachRow((row, rowNumber) => {
            var _a;
            const firstCell = (_a = row.getCell(1).value) === null || _a === void 0 ? void 0 : _a.toString();
            if (firstCell === "Reskontradatum") {
                headerRowIndex = rowNumber;
            }
        });
        if (headerRowIndex === -1) {
            throw new Error("Could not find transaction header row");
        }
        const expenses = [];
        const merchantCounts = {};
        // Process each transaction row
        let rowIndex = headerRowIndex + 1;
        while (rowIndex <= worksheet.rowCount) {
            const row = worksheet.getRow(rowIndex);
            // Get text column for the name
            const textValue = ((_a = row.getCell(3).value) === null || _a === void 0 ? void 0 : _a.toString()) || "";
            // Skip empty rows
            if (!textValue) {
                rowIndex++;
                continue;
            }
            // Get amount - make it positive for expenses, negative for income
            const amountCell = row.getCell(4).value;
            let amount = 0;
            if (typeof amountCell === "number") {
                amount = -amountCell; // Make expenses positive and income negative
            }
            else if (amountCell &&
                typeof amountCell === "object" &&
                "result" in amountCell) {
                amount = -Number(amountCell.result || 0);
            }
            // Get date
            const dateCell = row.getCell(2).value;
            let date = "";
            if (dateCell instanceof Date) {
                date = dateCell.toISOString().split("T")[0]; // YYYY-MM-DD format
            }
            else if (typeof dateCell === "string") {
                date = dateCell;
            }
            // Get day of week
            const dayOfWeek = getDayOfWeek(date);
            // Track merchant frequency
            if (!merchantCounts[textValue]) {
                merchantCounts[textValue] = 0;
            }
            merchantCounts[textValue]++;
            // Track transactions for pattern detection
            if (!transactionHistory[textValue]) {
                transactionHistory[textValue] = { dates: [], amounts: [] };
            }
            transactionHistory[textValue].dates.push(date);
            transactionHistory[textValue].amounts.push(Math.abs(amount));
            // Create expense object
            const expense = {
                name: textValue,
                amount: Math.abs(amount), // Always store as positive
                category: categorizeTransaction(textValue), // Helper function to categorize
                isRecurring: false, // Will be updated later with pattern detection
                date: date,
                day: dayOfWeek,
                frequency: Frequency.OneTime, // Will be updated later
                necessityLevel: determineNecessityLevel(textValue),
                merchantFrequency: merchantCounts[textValue],
            };
            expenses.push(expense);
            rowIndex++;
        }
        // After processing all transactions, detect recurring patterns
        expenses.forEach((expense) => {
            const patternResult = detectRecurringPattern(expense.name, expense.amount);
            expense.isRecurring = patternResult.isRecurring;
            expense.frequency = patternResult.frequency;
        });
        return expenses;
    }
    catch (error) {
        console.error("Error parsing Excel file:", error);
        throw error;
    }
}
/**
 * Get day of week from a date string (YYYY-MM-DD)
 */
function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = [
        DayOfWeek.Sunday,
        DayOfWeek.Monday,
        DayOfWeek.Tuesday,
        DayOfWeek.Wednesday,
        DayOfWeek.Thursday,
        DayOfWeek.Friday,
        DayOfWeek.Saturday,
    ];
    return days[date.getDay()];
}
/**
 * Detect recurring patterns based on transaction history
 */
function detectRecurringPattern(name, amount) {
    // Default values
    let isRecurring = false;
    let frequency = Frequency.OneTime;
    // If we don't have transaction history, return keyword-based result
    if (!transactionHistory[name] || transactionHistory[name].dates.length < 2) {
        return { isRecurring, frequency };
    }
    const history = transactionHistory[name];
    const dates = history.dates.map((d) => new Date(d));
    const amounts = history.amounts;
    // Check if this transaction has consistent amount and appears on same day of month
    if (amounts.every((a) => Math.abs(a - amount) < 0.01)) {
        // Get days of month for all dates
        const daysOfMonth = dates.map((d) => d.getDate());
        // If transaction occurs on same day of month consistently
        if (daysOfMonth.length >= 2 &&
            daysOfMonth.every((d) => d === daysOfMonth[0])) {
            // Check monthly pattern
            const months = dates.map((d) => d.getMonth());
            const sortedMonths = [...months].sort((a, b) => a - b);
            // Check if months are consecutive or spaced by 1 month
            let isMonthly = true;
            for (let i = 1; i < sortedMonths.length; i++) {
                const diff = sortedMonths[i] - sortedMonths[i - 1];
                if (diff !== 1 && diff !== 0) {
                    isMonthly = false;
                    break;
                }
            }
            if (isMonthly) {
                isRecurring = true;
                frequency = Frequency.Monthly;
            }
            // Check if weekly pattern - same weekday
            const weekdays = dates.map((d) => d.getDay());
            if (weekdays.every((w) => w === weekdays[0]) &&
                dates.length >= 2 &&
                Math.abs(dates[1].getTime() - dates[0].getTime()) <=
                    8 * 24 * 60 * 60 * 1000) {
                isRecurring = true;
                frequency = Frequency.Weekly;
            }
        }
    }
    return { isRecurring, frequency };
}
/**
 * Helper function to categorize transactions based on text
 */
function categorizeTransaction(text) {
    const lowerText = text.toLowerCase();
    // Check each category's keywords
    for (const [category, keywords] of Object.entries(exports.CATEGORY_KEYWORDS)) {
        if (keywords.some((keyword) => lowerText.includes(keyword))) {
            return category;
        }
    }
    // Default category if nothing matches
    return "Other";
}
/**
 * Helper function to determine necessity level based on transaction details
 */
function determineNecessityLevel(text) {
    return "C";
}
/**
 * Saves parsed expense data to a JSON file
 * @param expenses Array of expense data
 * @param outputPath Path to save the output JSON file
 */
async function saveExpensesToFile(expenses, outputPath) {
    try {
        const outputDir = path.dirname(outputPath);
        // Ensure the directory exists
        await fs.mkdir(outputDir, { recursive: true });
        // Write the data to file
        await fs.writeFile(outputPath, JSON.stringify(expenses, null, 2), "utf8");
        console.log(`Expenses saved to ${outputPath}`);
    }
    catch (error) {
        console.error("Error saving expenses to file:", error);
        throw error;
    }
}
// Example usage
async function main() {
    try {
        const inputFile = "./Handelsbanken_Account_Transactions_2025-04-25.xlsx";
        const expenses = await parseTransactionExcel(inputFile);
        // Generate output filename based on input file
        const inputBasename = path.basename(inputFile, path.extname(inputFile));
        const outputPath = path.join("./output", `${inputBasename}_processed.json`);
        // Save to file instead of logging
        await saveExpensesToFile(expenses, outputPath);
    }
    catch (error) {
        console.error("Failed to process file:", error);
    }
}
if (require.main === module) {
    main();
}
