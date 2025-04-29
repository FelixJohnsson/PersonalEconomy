import { Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { findUser, UserRequest } from "../utils/findUser";
import { ExpenseFormData } from "../utils/excelData";
import { CATEGORY_KEYWORDS, categorizeTransaction } from "../utils/excelData";

/**
 * Get all expenses for the authenticated user
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await findUser(req);

  if (user === 400) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  if (user === 404) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user.expenses || []);
});

/**
 * Get a specific expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpenseById = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await findUser(req);

  if (user === 400) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  if (user === 404) {
    res.status(404);
    throw new Error("User not found");
  }

  const expense = user.expenses.find(
    (exp) => exp._id?.toString() === req.params.id
  );

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
  const user = await findUser(req);

  if (user === 400) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  if (user === 404) {
    res.status(404);
    throw new Error("User not found");
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

  const newExpense = {
    _id: new mongoose.Types.ObjectId(),
    user: user._id,
    name,
    amount,
    category,
    isRecurring: isRecurring || false,
    date,
    necessityLevel: necessityLevel || "C",
    frequency,
    notes,
  };

  try {
    // Use updateOne to push the new expense directly
    await User.updateOne(
      { _id: user._id },
      { $push: { expenses: newExpense } }
    );

    res.status(201).json(newExpense);
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to create expense",
      error: error.message,
    });
  }
});

/**
 * Update an expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user?._id) {
    res.status(400);
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

  // Build update fields
  const updateFields: Record<string, any> = {};

  if (name) updateFields["expenses.$.name"] = name;
  if (amount !== undefined) updateFields["expenses.$.amount"] = amount;
  if (category) updateFields["expenses.$.category"] = category;
  if (isRecurring !== undefined)
    updateFields["expenses.$.isRecurring"] = isRecurring;
  if (date) updateFields["expenses.$.date"] = date;
  if (necessityLevel !== undefined)
    updateFields["expenses.$.necessityLevel"] = necessityLevel;
  if (frequency !== undefined) updateFields["expenses.$.frequency"] = frequency;
  if (notes !== undefined) updateFields["expenses.$.notes"] = notes;

  if (Object.keys(updateFields).length === 0) {
    res.status(400);
    throw new Error("No update fields provided");
  }

  try {
    // Use findOneAndUpdate to update specific expense
    const result = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        "expenses._id": req.params.id,
      },
      { $set: updateFields },
      { new: true }
    );

    if (!result) {
      res.status(404);
      throw new Error("Expense not found");
    }

    // Find the updated expense
    const updatedExpense = result.expenses.find(
      (exp) => exp._id.toString() === req.params.id
    );

    res.status(200).json(updatedExpense);
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to update expense",
      error: error.message,
    });
  }
});

/**
 * Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user?._id) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  try {
    // Use updateOne with $pull to remove the expense
    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { expenses: { _id: req.params.id } } }
    );

    if (result.modifiedCount === 0) {
      res.status(404);
      throw new Error("Expense not found or already deleted");
    }

    // Get updated expenses list
    const updatedUser = await User.findById(req.user._id);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to delete expense",
      error: error.message,
    });
  }
});

/**
 * Imports expenses from a JSON file to a user's account
 * @route   POST /api/expenses/import-file
 * @access  Private
 */
const importExpensesToUser = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const filePath =
      "/Users/felix.johnsson/EconomyTracker/economy-tracker/server/src/utils/output/Handelsbanken_Account_Transactions_2025-04-25_processed.json";
    try {
      const user = await findUser(req);

      if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
      }

      if (user === 404) {
        res.status(404);
        throw new Error("User not found");
      }

      const fileContent = await fs.readFile(path.resolve(filePath), "utf8");
      const expenses: ExpenseFormData[] = JSON.parse(fileContent);

      if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
        console.error("No valid expenses found in the file");
        res
          .status(400)
          .json({ message: "No valid expenses found in the file" });
        return;
      }

      // Create expense objects with IDs
      const newExpenses = expenses.map((expense) => ({
        _id: new mongoose.Types.ObjectId(),
        user: user._id,
        name: expense.name,
        amount: expense.amount,
        category: categorizeTransaction(expense.name),
        isRecurring: expense.isRecurring,
        date: expense.date,
        day: expense.day,
        necessityLevel: "C",
        frequency: expense.frequency,
      }));

      // Add all expenses to the user's expenses array
      await User.updateOne(
        { _id: user._id },
        { $push: { expenses: { $each: newExpenses } } }
      );

      res.status(200).json({
        message: "Expenses imported successfully",
        count: newExpenses.length,
      });
    } catch (error) {
      console.error("Error importing expenses:", error);
      res.status(500).json({ message: "Error importing expenses" });
    }
  }
);

export {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  importExpensesToUser,
};
