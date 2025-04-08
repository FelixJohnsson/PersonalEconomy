import {
  Asset,
  Expense,
  Income,
  IncomeFrequency,
  Liability,
  Subscription,
  BudgetItem,
  SavingsGoal,
} from "./index";

/**
 * Form data types with string values for numeric inputs
 * and optional id fields for both new and existing items
 */

export interface ExpenseFormData {
  id?: string;
  name: string;
  amount: string; // String for form inputs
  category: string;
  isRecurring: boolean;
  frequency?: "monthly" | "annual";
  date: string;
  necessityLevel?: string;
  notes?: string;
}

export interface IncomeFormData {
  id?: string;
  name: string;
  amount: string; // String for form inputs
  grossAmount?: string;
  netAmount?: string;
  taxRate?: string;
  frequency: IncomeFrequency;
  category: string;
  isRecurring: boolean;
  date: string;
}

export interface AssetFormData {
  id?: string;
  name: string;
  type: string;
  value: string; // String for form inputs
  savingsGoalId?: string | null;
  notes?: string;
}

export interface LiabilityFormData {
  id?: string;
  name: string;
  amount: string; // String for form inputs
  interestRate: string;
  minimumPayment: string;
  type: "credit_card" | "loan" | "mortgage" | "other";
  notes?: string;
}

export interface SubscriptionFormData {
  id?: string;
  name: string;
  amount: string; // String for form inputs
  frequency: "monthly" | "annual";
  billingCycle?: "monthly" | "annual";
  renewalDate?: string;
  autoRenews?: boolean;
  category: string;
  billingDate: string;
  notes?: string;
  isActive: boolean;
  necessityLevel?: string;
}

export interface BudgetItemFormData {
  id?: string;
  category: string;
  amount: string; // String for form inputs
  percentage: string; // String for form inputs
}

export interface SavingsGoalFormData {
  id?: string;
  name: string;
  targetAmount: string; // String for form inputs
  startDate: string;
  targetDate: string;
  monthlySavings: string; // String for form inputs
  expectedReturnRate: string; // String for form inputs
}

/**
 * Type converters for transforming form data to model data
 */

export function expenseFromForm(
  formData: ExpenseFormData
): Omit<Expense, "id"> {
  return {
    name: formData.name,
    amount: parseFloat(formData.amount),
    category: formData.category,
    isRecurring: formData.isRecurring,
    frequency: formData.frequency,
    date: formData.date,
    necessityLevel: formData.necessityLevel as any,
    notes: formData.notes,
  };
}

export function incomeFromForm(formData: IncomeFormData): Omit<Income, "_id"> {
  return {
    name: formData.name,
    grossAmount: formData.grossAmount ? parseFloat(formData.grossAmount) : 0,
    netAmount: formData.netAmount ? parseFloat(formData.netAmount) : 0,
    taxRate: formData.taxRate ? parseFloat(formData.taxRate) : 0,
    frequency: formData.frequency,
    type: formData.category,
    isRecurring: formData.isRecurring,
    date: formData.date,
  };
}

export function assetFromForm(formData: AssetFormData): Omit<Asset, "id"> {
  return {
    name: formData.name,
    type: formData.type,
    value: parseFloat(formData.value),
    savingsGoalId: formData.savingsGoalId,
    notes: formData.notes,
  };
}

export function liabilityFromForm(
  formData: LiabilityFormData
): Omit<Liability, "id"> {
  return {
    name: formData.name,
    amount: parseFloat(formData.amount),
    interestRate: parseFloat(formData.interestRate),
    minimumPayment: parseFloat(formData.minimumPayment),
    type: formData.type,
  };
}

export function subscriptionFromForm(
  formData: SubscriptionFormData
): Omit<Subscription, "id"> {
  return {
    name: formData.name,
    amount: parseFloat(formData.amount),
    frequency: formData.frequency,
    billingCycle: formData.billingCycle,
    renewalDate: formData.renewalDate,
    autoRenews: formData.autoRenews,
    category: formData.category,
    billingDate: formData.billingDate,
    notes: formData.notes,
    isActive: formData.isActive,
    necessityLevel: formData.necessityLevel as any,
  };
}

export function budgetItemFromForm(
  formData: BudgetItemFormData
): Omit<BudgetItem, "id"> {
  return {
    category: formData.category,
    amount: parseFloat(formData.amount),
    percentage: parseFloat(formData.percentage),
  };
}

export function savingsGoalFromForm(
  formData: SavingsGoalFormData
): Omit<SavingsGoal, "id"> {
  return {
    name: formData.name,
    targetAmount: parseFloat(formData.targetAmount),
    startDate: formData.startDate,
    targetDate: formData.targetDate,
    monthlySavings: parseFloat(formData.monthlySavings),
    expectedReturnRate: parseFloat(formData.expectedReturnRate),
  };
}

/**
 * Convert model data to form data
 */

export function expenseToForm(expense: Expense): ExpenseFormData {
  return {
    id: expense.id,
    name: expense.name,
    amount: expense.amount.toString(),
    category: expense.category,
    isRecurring: expense.isRecurring,
    frequency: expense.frequency,
    date: expense.date || "",
    necessityLevel: expense.necessityLevel,
    notes: expense.notes,
  };
}

export function incomeToForm(income: Income): IncomeFormData {
  return {
    id: income._id,
    name: income.name,
    amount: "0", // This isn't used in the model anymore but is needed for the form
    grossAmount: income.grossAmount?.toString() || "0",
    netAmount: income.netAmount?.toString() || "0",
    taxRate: income.taxRate?.toString() || "0",
    frequency: income.frequency,
    category: income.type,
    isRecurring: income.isRecurring,
    date: income.date || new Date().toISOString().split("T")[0],
  };
}

export function assetToForm(asset: Asset): AssetFormData {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    value: asset.value.toString(),
    savingsGoalId: asset.savingsGoalId,
    notes: asset.notes,
  };
}

export function liabilityToForm(liability: Liability): LiabilityFormData {
  return {
    id: liability.id,
    name: liability.name,
    amount: liability.amount.toString(),
    interestRate: liability.interestRate.toString(),
    minimumPayment: liability.minimumPayment.toString(),
    type: liability.type,
    notes: "", // Default empty string for form field
  };
}

export function subscriptionToForm(
  subscription: Subscription
): SubscriptionFormData {
  return {
    id: subscription.id,
    name: subscription.name,
    amount: subscription.amount.toString(),
    frequency: subscription.frequency,
    billingCycle: subscription.billingCycle,
    renewalDate: subscription.renewalDate,
    autoRenews: subscription.autoRenews,
    category: subscription.category,
    billingDate: subscription.billingDate,
    notes: subscription.notes,
    isActive: subscription.isActive,
    necessityLevel: subscription.necessityLevel,
  };
}

export function budgetItemToForm(budgetItem: BudgetItem): BudgetItemFormData {
  return {
    id: budgetItem.id,
    category: budgetItem.category,
    amount: budgetItem.amount.toString(),
    percentage: budgetItem.percentage.toString(),
  };
}

export function savingsGoalToForm(
  savingsGoal: SavingsGoal
): SavingsGoalFormData {
  return {
    id: savingsGoal.id,
    name: savingsGoal.name,
    targetAmount: savingsGoal.targetAmount.toString(),
    startDate: savingsGoal.startDate,
    targetDate: savingsGoal.targetDate,
    monthlySavings: savingsGoal.monthlySavings.toString(),
    expectedReturnRate: savingsGoal.expectedReturnRate.toString(),
  };
}
