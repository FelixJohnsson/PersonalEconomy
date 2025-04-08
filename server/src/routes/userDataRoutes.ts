import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getUserData,
  addIncome,
  updateIncome,
  deleteIncome,
  addExpense,
  updateExpense,
  deleteExpense,
  addAsset,
  updateAsset,
  deleteAsset,
  addLiability,
  updateLiability,
  deleteLiability,
  updateAssetValue,
  addAssetDeposit,
} from "../controllers/userDataController";

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Main route to get all user data
router.route("/").get(getUserData);

// Income routes
router.route("/incomes").post(addIncome);
router.route("/incomes/:id").put(updateIncome).delete(deleteIncome);

// Expense routes
router.route("/expenses").post(addExpense);
router.route("/expenses/:id").put(updateExpense).delete(deleteExpense);

// Asset routes
router.route("/assets").post(addAsset);
router.route("/assets/:id").put(updateAsset).delete(deleteAsset);
router.route("/assets/:id/value").put(updateAssetValue);
router.route("/assets/:id/deposit").post(addAssetDeposit);

// Liability routes
router.route("/liabilities").post(addLiability);
router.route("/liabilities/:id").put(updateLiability).delete(deleteLiability);

export default router;
