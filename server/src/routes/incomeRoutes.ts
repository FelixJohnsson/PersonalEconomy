import express from "express";
import {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../controllers/incomeController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// All routes are protected
router.use(protect);

// Route for all incomes and creating new ones
router.route("/").get(getIncomes).post(createIncome);

// Routes for operations on a specific income
router.route("/:id").get(getIncome).put(updateIncome).delete(deleteIncome);

export default router;
