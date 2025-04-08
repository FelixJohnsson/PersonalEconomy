import express from "express";
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// All routes are protected
router.use(protect);

// GET all expenses and POST new expense
router.route("/").get(getExpenses).post(createExpense);

// GET, PUT, DELETE specific expense
router
  .route("/:id")
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
