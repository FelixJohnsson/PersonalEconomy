import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getUserData } from "../controllers/userDataController";

import {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../controllers/incomeController";

import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptions,
  getSubscriptionById,
} from "../controllers/subscriptionController";

import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  addAssetDeposit,
  updateAssetValue,
} from "../controllers/assetController";

import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  importExpensesToUser,
} from "../controllers/expenseController";

import {
  getLiabilities,
  getLiabilityById,
  createLiability,
  updateLiability,
  deleteLiability,
} from "../controllers/liabilityController";

import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  toggleNotePin,
} from "../controllers/notesController";

import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  trackBudgetSpending,
} from "../controllers/budgetController";

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Main route to get all user data
router.route("/").get(getUserData);

// Income routes
router.route("/incomes").post(createIncome).get(getIncomes);
router
  .route("/incomes/:id")
  .put(updateIncome)
  .delete(deleteIncome)
  .get(getIncome);

// Expense routes
router.route("/expenses").post(createExpense).get(getExpenses);
router
  .route("/expenses/:id")
  .put(updateExpense)
  .delete(deleteExpense)
  .get(getExpenseById);
router.route("/expenses/import").post(importExpensesToUser);

// Asset routes
router.route("/assets").post(createAsset).get(getAssets);
router
  .route("/assets/:id")
  .put(updateAsset)
  .delete(deleteAsset)
  .get(getAssetById);
router.route("/assets/:id/value").put(updateAssetValue);
router.route("/assets/:id/deposit").post(addAssetDeposit);

// Liability routes
router.route("/liabilities").post(createLiability).get(getLiabilities);
router
  .route("/liabilities/:id")
  .put(updateLiability)
  .delete(deleteLiability)
  .get(getLiabilityById);

// Subscription routes
router.route("/subscriptions").post(createSubscription).get(getSubscriptions);
router
  .route("/subscriptions/:id")
  .get(getSubscriptionById)
  .put(updateSubscription)
  .delete(deleteSubscription);

// Note routes
router.route("/notes").post(createNote).get(getNotes);
router.route("/notes/:id").get(getNote).put(updateNote).delete(deleteNote);
router.route("/notes/:id/pin").put(toggleNotePin);

// Budget routes
router.route("/budgets").post(createBudget).get(getBudgets);
router
  .route("/budgets/:id")
  .get(getBudgetById)
  .put(updateBudget)
  .delete(deleteBudget);
router.route("/budgets/:id/track").post(trackBudgetSpending);

export default router;
