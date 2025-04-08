import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User, { IUser } from "../models/userModel";
import Income from "../models/incomeModel";
import Expense from "../models/expenseModel";
import Asset from "../models/assetModel";
import Liability from "../models/liabilityModel";
import mongoose from "mongoose";

// Extend Express Request interface to include user property
interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Import data from localStorage to MongoDB
 * @route   POST /api/import/localStorage
 * @access  Private
 */
const importFromLocalStorage = asyncHandler(
  async (req: UserRequest, res: Response) => {
    // Get the data from request body
    const { incomes, expenses, assets, liabilities } = req.body;

    // Ensure user is authenticated
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const userId = req.user._id;

    try {
      // Import incomes
      if (incomes && incomes.length > 0) {
        // Delete existing incomes for this user to avoid duplicates
        await Income.deleteMany({ user: userId });

        // Map the localStorage data to our MongoDB schema
        const incomeObjects = incomes.map((income: any) => ({
          user: userId,
          name: income.name,
          amount: income.amount,
          grossAmount: income.grossAmount || income.amount,
          netAmount: income.netAmount || income.amount,
          taxRate: income.taxRate || 0,
          frequency: income.frequency || "monthly",
          category: income.category || "Other",
        }));

        // Insert the income data
        await Income.insertMany(incomeObjects);
      }

      // Import expenses
      if (expenses && expenses.length > 0) {
        // Delete existing expenses for this user to avoid duplicates
        await Expense.deleteMany({ user: userId });

        // Map the localStorage data to our MongoDB schema
        const expenseObjects = expenses.map((expense: any) => ({
          user: userId,
          name: expense.name,
          amount: expense.amount,
          category: expense.category || "Other",
          isRecurring: expense.isRecurring || false,
          date: expense.date || new Date().toISOString().split("T")[0],
          necessityLevel: expense.necessityLevel,
          frequency: expense.frequency,
          notes: expense.notes,
        }));

        // Insert the expense data
        await Expense.insertMany(expenseObjects);
      }

      // Import assets
      if (assets && assets.length > 0) {
        // Delete existing assets for this user to avoid duplicates
        await Asset.deleteMany({ user: userId });

        // Map the localStorage data to our MongoDB schema
        const assetObjects = assets.map((asset: any) => ({
          user: userId,
          name: asset.name,
          value: asset.value,
          type: asset.type || "Other",
          acquisitionDate: asset.acquisitionDate,
          notes: asset.notes,
          category: asset.category,
          growthRate: asset.growthRate,
        }));

        // Insert the asset data
        await Asset.insertMany(assetObjects);
      }

      // Import liabilities
      if (liabilities && liabilities.length > 0) {
        // Delete existing liabilities for this user to avoid duplicates
        await Liability.deleteMany({ user: userId });

        // Map the localStorage data to our MongoDB schema
        const liabilityObjects = liabilities.map((liability: any) => ({
          user: userId,
          name: liability.name,
          amount: liability.amount,
          interestRate: liability.interestRate,
          minimumPayment: liability.minimumPayment,
          dueDate: liability.dueDate,
          category: liability.category,
          notes: liability.notes,
        }));

        // Insert the liability data
        await Liability.insertMany(liabilityObjects);
      }

      res.status(200).json({
        success: true,
        message: "Data imported successfully",
        counts: {
          incomes: incomes?.length || 0,
          expenses: expenses?.length || 0,
          assets: assets?.length || 0,
          liabilities: liabilities?.length || 0,
        },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500);
      throw new Error(`Import failed: ${err.message}`);
    }
  }
);

export { importFromLocalStorage };
