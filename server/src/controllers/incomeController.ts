import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Income from "../models/incomeModel";
import { IUser } from "../models/userModel";

// Extend Express Request interface to include user property
interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Get all incomes for a user
 * @route   GET /api/incomes
 * @access  Private
 */
const getIncomes = asyncHandler(async (req: UserRequest, res: Response) => {
  const incomes = await Income.find({ user: req.user?._id });
  res.json(incomes);
});

/**
 * Get a single income
 * @route   GET /api/incomes/:id
 * @access  Private
 */
const getIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  const income = await Income.findById(req.params.id);

  if (!income) {
    res.status(404);
    throw new Error("Income not found");
  }

  // Check if income belongs to user
  if (income.user.toString() !== req.user?._id?.toString()) {
    res.status(401);
    throw new Error("Not authorized to access this income");
  }

  res.json(income);
});

/**
 * Create a new income
 * @route   POST /api/incomes
 * @access  Private
 */
const createIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  const { name, amount, grossAmount, netAmount, taxRate, frequency, category } =
    req.body;

  // Validate required fields
  if (!name || !amount || !frequency || !category) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const income = await Income.create({
    user: req.user?._id,
    name,
    amount,
    grossAmount,
    netAmount,
    taxRate,
    frequency,
    category,
  });

  res.status(201).json(income);
});

/**
 * Update an income
 * @route   PUT /api/incomes/:id
 * @access  Private
 */
const updateIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  const income = await Income.findById(req.params.id);

  if (!income) {
    res.status(404);
    throw new Error("Income not found");
  }

  // Check if income belongs to user
  if (income.user.toString() !== req.user?._id?.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this income");
  }

  const updatedIncome = await Income.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(updatedIncome);
});

/**
 * Delete an income
 * @route   DELETE /api/incomes/:id
 * @access  Private
 */
const deleteIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  const income = await Income.findById(req.params.id);

  if (!income) {
    res.status(404);
    throw new Error("Income not found");
  }

  // Check if income belongs to user
  if (income.user.toString() !== req.user?._id?.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this income");
  }

  await income.deleteOne();

  res.json({ message: "Income removed" });
});

export { getIncomes, getIncome, createIncome, updateIncome, deleteIncome };
