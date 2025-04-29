import { Response } from "express";
import asyncHandler from "express-async-handler";
import { findUser, UserRequest } from "../utils/findUser";
import User from "../models/userModel";
import mongoose from "mongoose";

/**
 * Get all budgets for the authenticated user
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await findUser(req);

  if (user === 400) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  if (user === 404) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user.budgets || []);
});

/**
 * Get a specific budget by ID
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudgetById = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await findUser(req);

  if (user === 400) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  if (user === 404) {
    res.status(404);
    throw new Error("User not found");
  }

  const budget = user.budgets.find(
    (budget) => budget._id?.toString() === req.params.id
  );

  if (budget) {
    res.status(200).json(budget);
  } else {
    res.status(404);
    throw new Error("Budget not found");
  }
});

/**
 * Create a new budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await findUser(req);

  if (user === 400) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  if (user === 404) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, amount, category } = req.body;

  // Check if required fields are provided
  if (!name || amount === undefined) {
    res.status(400);
    throw new Error("Please provide name and amount");
  }

  try {
    const newBudget = {
      user: user._id,
      name,
      amount,
      category,
    };

    await User.updateOne(
      { _id: user._id },
      { $push: { budgets: newBudget } }
    ).populate("budgets");

    // Get the updated user
    const updatedUser = await User.findById(user._id).populate("budgets");
    console.log("Updated user", updatedUser);

    res.status(201).json(updatedUser?.budgets);
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to create budget",
      error: error.message,
    });
  }
});

/**
 * Update a budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user?._id) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  const { name, amount, category, startDate, endDate, recurrence } = req.body;

  // Build update fields
  const updateFields: Record<string, any> = {};

  if (name) updateFields["budgets.$.name"] = name;
  if (amount !== undefined) updateFields["budgets.$.amount"] = amount;
  if (category !== undefined) updateFields["budgets.$.category"] = category;
  if (startDate !== undefined) updateFields["budgets.$.startDate"] = startDate;
  if (endDate !== undefined) updateFields["budgets.$.endDate"] = endDate;
  if (recurrence !== undefined)
    updateFields["budgets.$.recurrence"] = recurrence;

  if (Object.keys(updateFields).length === 0) {
    res.status(400);
    throw new Error("No update fields provided");
  }

  try {
    // Use findOneAndUpdate to update specific budget
    const result = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        "budgets._id": req.params.id,
      },
      { $set: updateFields },
      { new: true }
    );

    if (!result) {
      res.status(404);
      throw new Error("Budget not found");
    }

    // Find the updated budget
    const updatedBudget = result.budgets.find(
      (budget) => budget._id.toString() === req.params.id
    );

    res.status(200).json(updatedBudget);
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to update budget",
      error: error.message,
    });
  }
});

/**
 * Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user?._id) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  try {
    // Use updateOne with $pull to remove the budget
    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { budgets: { _id: req.params.id } } }
    );

    if (result.modifiedCount === 0) {
      res.status(404);
      throw new Error("Budget not found or already deleted");
    }

    // Get updated budgets list
    const updatedUser = await User.findById(req.user._id);
    res.status(200).json({
      message: "Budget removed",
      budgets: updatedUser?.budgets || [],
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to delete budget",
      error: error.message,
    });
  }
});

/**
 * Track spending against a budget
 * @route   POST /api/budgets/:id/track
 * @access  Private
 */
const trackBudgetSpending = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user?._id) {
      res.status(400);
      throw new Error("Not authorized, no user found");
    }

    const { date, amount, description } = req.body;

    if (!date || amount === undefined) {
      res.status(400);
      throw new Error("Please provide date and amount");
    }

    try {
      // Find the user and budget
      const user = await User.findOne({
        _id: req.user._id,
        "budgets._id": req.params.id,
      });

      if (!user) {
        res.status(404);
        throw new Error("Budget not found");
      }

      // Create the tracking entry
      const trackingEntry = {
        _id: new mongoose.Types.ObjectId(),
        date,
        amount,
        description: description || "",
      };

      // Add the tracking entry to the budget
      await User.updateOne(
        {
          _id: req.user._id,
          "budgets._id": req.params.id,
        },
        { $push: { "budgets.$.tracking": trackingEntry } }
      );

      // Get the updated budget
      const updatedUser = await User.findOne({
        _id: req.user._id,
        "budgets._id": req.params.id,
      });

      const updatedBudget = updatedUser?.budgets.find(
        (budget) => budget._id.toString() === req.params.id
      );

      res.status(200).json(updatedBudget);
    } catch (error: any) {
      res.status(400).json({
        message: "Failed to track budget spending",
        error: error.message,
      });
    }
  }
);

export {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  trackBudgetSpending,
};
