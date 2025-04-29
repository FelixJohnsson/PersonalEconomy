import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Income, { IncomeType } from "../models/incomeModel";
import User, { IUser } from "../models/userModel";

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
  const user = await User.findById(req.user?._id);
  res.json(user?.incomes);
});

/**
 * Get a single income
 * @route   GET /api/incomes/:id
 * @access  Private
 */
const getIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await User.findById(req.user?._id);
  const income = user?.incomes.find(
    (income) => income?._id?.toString() === req.params.id
  );

  if (!income) {
    res.status(404);
    throw new Error("Income not found");
  }

  res.json(income);
});

/**
 * Create a new income
 * @route   POST /api/incomes
 * @access  Private
 */
const createIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const incomeData: IncomeType = req.body;
  const {
    name,
    grossAmount,
    netAmount,
    taxRate,
    frequency,
    type,
    date,
    isRecurring,
  } = incomeData;

  // Validate required fields
  if (
    !name ||
    !grossAmount ||
    !netAmount ||
    !taxRate ||
    !frequency ||
    !type ||
    !date ||
    !isRecurring
  ) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const newIncome = {
    user: req.user?._id,
    ...incomeData,
  };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { incomes: newIncome } },
    { new: true }
  ).populate("incomes");

  if (user) {
    const addedIncome = user.incomes[user.incomes.length - 1];
    res.status(201).json(addedIncome);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * Update an income
 * @route   PUT /api/incomes/:id
 * @access  Private
 */
const updateIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const income = user?.incomes.find(
    (income) => income?._id?.toString() === req.params.id
  );

  if (!income) {
    res.status(404);
    throw new Error("Income not found");
  }

  const {
    name,
    grossAmount,
    netAmount,
    taxRate,
    frequency,
    type,
    date,
    isRecurring,
  } = req.body;

  income.name = name || income.name;
  income.grossAmount =
    grossAmount !== undefined ? grossAmount : income.grossAmount;
  income.netAmount = netAmount !== undefined ? netAmount : income.netAmount;
  income.taxRate = taxRate !== undefined ? taxRate : income.taxRate;
  income.frequency = frequency !== undefined ? frequency : income.frequency;
  income.type = type !== undefined ? type : income.type;
  income.date = date !== undefined ? date : income.date;
  income.isRecurring =
    isRecurring !== undefined ? isRecurring : income.isRecurring;

  // Replace the old income with the updated income
  user.incomes = user.incomes.map((income) =>
    income._id.toString() === req.params.id ? income : income
  );

  await user.save();

  res.status(200).json(user.incomes);
});

/**
 * Delete an income
 * @route   DELETE /api/incomes/:id
 * @access  Private
 */
const deleteIncome = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    // Use updateOne with $pull to remove the income by ID
    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { incomes: { _id: req.params.id } } }
    );

    if (result.modifiedCount === 0) {
      res.status(404);
      throw new Error("Income not found or already deleted");
    }

    // Get updated list of incomes
    const updatedUser = await User.findById(req.user._id);
    res.status(200).json(updatedUser?.incomes || []);
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({ message: "Error deleting income" });
  }
});

export { getIncomes, getIncome, createIncome, updateIncome, deleteIncome };
