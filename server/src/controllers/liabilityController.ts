import { Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import mongoose from "mongoose";
import { findUser, UserRequest } from "../utils/findUser";

/**
 * Get all liabilities for the authenticated user
 * @route   GET /api/liabilities
 * @access  Private
 */
const getLiabilities = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await findUser(req);

  if (user === 400) {
    res.status(400);
    throw new Error("Not authorized, no user found");
  }

  if (user === 404) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user.liabilities || []);
});

/**
 * Get a specific liability by ID
 * @route   GET /api/liabilities/:id
 * @access  Private
 */
const getLiabilityById = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const user = await findUser(req);

    if (user === 400) {
      res.status(400);
      throw new Error("Not authorized, no user found");
    }

    if (user === 404) {
      res.status(404);
      throw new Error("User not found");
    }

    const liability = user.liabilities.find(
      (liability) => liability._id?.toString() === req.params.id
    );

    if (liability) {
      res.status(200).json(liability);
    } else {
      res.status(404);
      throw new Error("Liability not found");
    }
  }
);

/**
 * Create a new liability
 * @route   POST /api/liabilities
 * @access  Private
 */
const createLiability = asyncHandler(
  async (req: UserRequest, res: Response) => {
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

      const { name, amount, interestRate, minimumPayment, type } = req.body;

      if (!name || !amount) {
        res.status(400);
        throw new Error("Please provide all required fields");
      }

      const newLiability = {
        _id: new mongoose.Types.ObjectId(),
        user: user._id,
        name,
        amount,
        interestRate,
        minimumPayment,
        type,
      };

      await User.updateOne(
        { _id: user._id },
        { $push: { liabilities: newLiability } }
      );

      const updatedUser = await User.findById(user._id);

      res.status(201).json(updatedUser?.liabilities || []);
    } catch (error: any) {
      res.status(500).json({
        message: "Error creating liability",
        error: error.message,
      });
    }
  }
);

/**
 * Update a liability
 * @route   PUT /api/liabilities/:id
 * @access  Private
 */
const updateLiability = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user?._id) {
      res.status(400);
      throw new Error("Not authorized, no user found");
    }

    const {
      name,
      amount,
      interestRate,
      minimumPayment,
      dueDate,
      category,
      notes,
      type,
    } = req.body;

    // Build update fields
    const updateFields: Record<string, any> = {};

    if (name) updateFields["liabilities.$.name"] = name;
    if (amount !== undefined) updateFields["liabilities.$.amount"] = amount;
    if (interestRate !== undefined)
      updateFields["liabilities.$.interestRate"] = interestRate;
    if (minimumPayment !== undefined)
      updateFields["liabilities.$.minimumPayment"] = minimumPayment;
    if (dueDate !== undefined) updateFields["liabilities.$.dueDate"] = dueDate;
    if (category !== undefined)
      updateFields["liabilities.$.category"] = category;
    if (notes !== undefined) updateFields["liabilities.$.notes"] = notes;
    if (type !== undefined) updateFields["liabilities.$.type"] = type;

    if (Object.keys(updateFields).length === 0) {
      res.status(400);
      throw new Error("No update fields provided");
    }

    try {
      // Use findOneAndUpdate to update specific liability
      const result = await User.findOneAndUpdate(
        {
          _id: req.user._id,
          "liabilities._id": req.params.id,
        },
        { $set: updateFields },
        { new: true }
      );

      if (!result) {
        res.status(404);
        throw new Error("Liability not found");
      }

      // Find the updated liability
      const updatedLiability = result.liabilities.find(
        (liability) => liability._id.toString() === req.params.id
      );

      res.status(200).json(updatedLiability);
    } catch (error: any) {
      res.status(400).json({
        message: "Failed to update liability",
        error: error.message,
      });
    }
  }
);

/**
 * Delete a liability
 * @route   DELETE /api/liabilities/:id
 * @access  Private
 */
const deleteLiability = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user?._id) {
      res.status(400);
      throw new Error("Not authorized, no user found");
    }

    try {
      // Use updateOne with $pull to remove the liability
      const result = await User.updateOne(
        { _id: req.user._id },
        { $pull: { liabilities: { _id: req.params.id } } }
      );

      if (result.modifiedCount === 0) {
        res.status(404);
        throw new Error("Liability not found or already deleted");
      }

      // Get updated liabilities list
      const updatedUser = await User.findById(req.user._id);
      res.status(200).json(updatedUser?.liabilities || []);
    } catch (error: any) {
      res.status(400).json({
        message: "Failed to delete liability",
        error: error.message,
      });
    }
  }
);

export {
  getLiabilities,
  getLiabilityById,
  createLiability,
  updateLiability,
  deleteLiability,
};
