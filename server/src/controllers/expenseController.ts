import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Expense from "../models/expenseModel";
import { IUser } from "../models/userModel";

// Extend Express Request interface to include user property
interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Get all expenses for the authenticated user
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const expenses = await Expense.find({ user: req.user._id });

  res.status(200).json(expenses);
});

/**
 * Get a specific expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpenseById = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (expense) {
    res.status(200).json(expense);
  } else {
    res.status(404);
    throw new Error("Expense not found");
  }
});

/**
 * Create a new expense
 * @route   POST /api/expenses
 * @access  Private
 */
const createExpense = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const {
    name,
    amount,
    category,
    isRecurring,
    date,
    necessityLevel,
    frequency,
    notes,
  } = req.body;

  // Check if required fields are provided
  if (!name || !amount || !category || !date) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const expense = await Expense.create({
    user: req.user._id,
    name,
    amount,
    category,
    isRecurring: isRecurring || false,
    date,
    necessityLevel,
    frequency,
    notes,
  });

  if (expense) {
    res.status(201).json(expense);
  } else {
    res.status(400);
    throw new Error("Invalid expense data");
  }
});

/**
 * Update an expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  const {
    name,
    amount,
    category,
    isRecurring,
    date,
    necessityLevel,
    frequency,
    notes,
  } = req.body;

  // Update expense fields if provided
  expense.name = name || expense.name;
  expense.amount = amount || expense.amount;
  expense.category = category || expense.category;
  expense.isRecurring =
    isRecurring !== undefined ? isRecurring : expense.isRecurring;
  expense.date = date || expense.date;

  // Update optional fields
  if (necessityLevel !== undefined) expense.necessityLevel = necessityLevel;
  if (frequency !== undefined) expense.frequency = frequency;
  if (notes !== undefined) expense.notes = notes;

  const updatedExpense = await expense.save();

  res.status(200).json(updatedExpense);
});

/**
 * Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  await expense.deleteOne();

  res.status(200).json({ message: "Expense removed" });
});

export {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
