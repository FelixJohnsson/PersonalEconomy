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
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number] | string;

export const ASSET_CATEGORIES = [
  "cash",
  "investment",
  "stock",
  "crypto",
  "property",
  "vehicle",
  "collectible",
  "other",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number] | string;

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency?: "monthly" | "annual"; // Optional since it only applies to recurring expenses
  category: string;
  isRecurring: boolean;
  date?: string; // date of expense or due date for recurring expenses
  notes?: string;
  necessityLevel?: NecessityLevel;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "annual";
  billingCycle?: "monthly" | "annual";
  renewalDate?: string;
  autoRenews?: boolean;
  category: string;
  billingDate: string;
  notes?: string;
  isActive: boolean;
  necessityLevel?: NecessityLevel;
}

export interface AssetValue {
  date: string;
  value: number;
  isDeposit?: boolean;
  depositAmount?: number;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetCategory;
  value: number;
  savingsGoalId?: string | null;
  historicalValues: AssetValue[];
  totalDeposits: number;
}

export interface ExpenseSummary {
  category: string;
  amount: number;
}

export interface Period {
  startDate: string;
  endDate: string;
}

export interface Income {
  id: string;
  name: string;
  amount: number; // Keeping for backward compatibility
  grossAmount?: number; // Before tax amount
  netAmount?: number; // After tax amount
  taxRate?: number; // Tax rate as a percentage
  frequency: "monthly" | "annual";
  category: string;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  type: "credit_card" | "loan" | "mortgage" | "other";
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  startDate: string;
  targetDate: string;
  monthlySavings: number;
  expectedReturnRate: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  periodStartDate: string;
  periodEndDate: string;
}

export interface SavingsProjection {
  months: number[];
  savings: number[];
  interest: number[];
  total: number[];
}

export interface BudgetItem {
  id: string;
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface TaxReturn {
  id: string;
  year: number;
  declaredIncome: number;
  taxPaid: number;
  returnAmount: number; // Positive for refunds, negative for additional payments
  submissionDate: string;
  notes?: string;
}

export * from "./Note";
