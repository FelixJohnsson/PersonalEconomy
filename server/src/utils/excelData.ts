import * as ExcelJS from "exceljs";
import * as path from "path";
import * as fs from "fs/promises";

export type NecessityLevel = "F" | "E" | "D" | "C" | "B" | "A" | "A+";

export const EXPENSE_CATEGORIES = [
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
] as const;

// Category keywords mapping
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
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
export enum Frequency {
  OneTime = "OneTime",
  Monthly = "Monthly",
  Weekly = "Weekly",
  Yearly = "Yearly",
}
export enum DayOfWeek {
  Sunday = "Sunday",
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
}

export interface ExpenseFormData {
  name: string;
  amount: number;
  frequency?: Frequency;
  category: string;
  isRecurring: boolean;
  date: string;
  day: DayOfWeek;
  necessityLevel?: NecessityLevel;
  merchantFrequency?: number;
}

// Store transaction history to detect patterns
interface TransactionPattern {
  [key: string]: {
    dates: string[];
    amounts: number[];
  };
}

// Global transaction history to detect recurring patterns
const transactionHistory: TransactionPattern = {};

/**
 * Maps transaction data from banking excel to the expense format
 * @param filePath Path to the Excel file
 * @returns Promise with array of parsed ExpenseFormData objects
 */
export async function parseTransactionExcel(
  filePath: string
): Promise<ExpenseFormData[]> {
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(path.resolve(filePath));
    const worksheet = workbook.worksheets[0];

    // Find the row where transactions start (look for column headers)
    let headerRowIndex = -1;
    worksheet.eachRow((row, rowNumber) => {
      const firstCell = row.getCell(1).value?.toString();
      if (firstCell === "Reskontradatum") {
        headerRowIndex = rowNumber;
      }
    });

    if (headerRowIndex === -1) {
      throw new Error("Could not find transaction header row");
    }

    const expenses: ExpenseFormData[] = [];
    const merchantCounts: { [key: string]: number } = {};

    // Process each transaction row
    let rowIndex = headerRowIndex + 1;
    while (rowIndex <= worksheet.rowCount) {
      const row = worksheet.getRow(rowIndex);

      // Get text column for the name
      const textValue = row.getCell(3).value?.toString() || "";

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
      } else if (
        amountCell &&
        typeof amountCell === "object" &&
        "result" in amountCell
      ) {
        amount = -Number(amountCell.result || 0);
      }

      // Get date
      const dateCell = row.getCell(2).value;
      let date = "";
      if (dateCell instanceof Date) {
        date = dateCell.toISOString().split("T")[0]; // YYYY-MM-DD format
      } else if (typeof dateCell === "string") {
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
      const expense: ExpenseFormData = {
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
      const patternResult = detectRecurringPattern(
        expense.name,
        expense.amount
      );
      expense.isRecurring = patternResult.isRecurring;
      expense.frequency = patternResult.frequency;
    });

    return expenses;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw error;
  }
}

/**
 * Get day of week from a date string (YYYY-MM-DD)
 */
function getDayOfWeek(dateString: string): DayOfWeek {
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
function detectRecurringPattern(
  name: string,
  amount: number
): { isRecurring: boolean; frequency: Frequency } {
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
    if (
      daysOfMonth.length >= 2 &&
      daysOfMonth.every((d) => d === daysOfMonth[0])
    ) {
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
      if (
        weekdays.every((w) => w === weekdays[0]) &&
        dates.length >= 2 &&
        Math.abs(dates[1].getTime() - dates[0].getTime()) <=
          8 * 24 * 60 * 60 * 1000
      ) {
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
export function categorizeTransaction(text: string): string {
  const lowerText = text.toLowerCase();

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
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
function determineNecessityLevel(text: string): NecessityLevel {
  return "C";
}

/**
 * Saves parsed expense data to a JSON file
 * @param expenses Array of expense data
 * @param outputPath Path to save the output JSON file
 */
async function saveExpensesToFile(
  expenses: ExpenseFormData[],
  outputPath: string
): Promise<void> {
  try {
    const outputDir = path.dirname(outputPath);

    // Ensure the directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write the data to file
    await fs.writeFile(outputPath, JSON.stringify(expenses, null, 2), "utf8");

    console.log(`Expenses saved to ${outputPath}`);
  } catch (error) {
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
  } catch (error) {
    console.error("Failed to process file:", error);
  }
}

if (require.main === module) {
  main();
}
