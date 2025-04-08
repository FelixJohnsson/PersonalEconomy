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

export enum Frequency {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  DAILY = "daily",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

export interface IncomeFormData {
  name: string;
  grossAmount: number;
  netAmount: number;
  taxRate: number;
  frequency: Frequency;
  isRecurring: boolean;
  type: string;
  date: string;
}

export interface Income extends IncomeFormData {
  _id: string;
  updatedAt: string;
  createdAt: string;
}

export interface SubscriptionFormData {
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
  billingDate: string;
  active: boolean;
  necessityLevel: NecessityLevel;
}

export interface Subscription extends SubscriptionFormData {
  _id: string;
  updatedAt: string;
  createdAt: string;
}

export interface ExpenseFormData {
  name: string;
  amount: number;
  frequency?: Frequency;
  category: string;
  isRecurring: boolean;
  date: string;
  necessityLevel?: NecessityLevel;
}

export interface Expense extends ExpenseFormData {
  _id: string;
  updatedAt: string;
  createdAt: string;
}

export interface AssetValue {
  date: string;
  value: number;
  isDeposit?: boolean;
  depositAmount?: number;
}

export interface AssetDeposit {
  date: string;
  amount: number;
  notes?: string;
}

export interface AssetFormData {
  name: string;
  type: AssetCategory;
  value: number;
  savingsGoalId?: string | null;
  historicalValues?: AssetValue[];
  totalDeposits?: number;
  values?: AssetValue[];
  deposits?: AssetDeposit[];
  notes?: string;
}

export interface Asset extends AssetFormData {
  _id: string;
  updatedAt: string;
  createdAt: string;
}

export interface ExpenseSummary {
  category: string;
  amount: number;
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
