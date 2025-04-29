import { Response } from "express";
import asyncHandler from "express-async-handler";
import { findUser, UserRequest } from "../utils/findUser";
import User from "../models/userModel";
import mongoose from "mongoose";

/**
 * Get all subscriptions for the authenticated user
 * @route   GET /api/subscriptions
 * @access  Private
 */
const getSubscriptions = asyncHandler(
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

    res.status(200).json(user.subscriptions);
  }
);

/**
 * Get a specific subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
const getSubscriptionById = asyncHandler(
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

    const subscription = user.subscriptions.find(
      (sub) => sub._id?.toString() === req.params.id
    );

    if (subscription) {
      res.status(200).json(subscription);
    } else {
      res.status(404);
      throw new Error("Subscription not found");
    }
  }
);

/**
 * Create a new subscription
 * @route   POST /api/subscriptions
 * @access  Private
 */
const createSubscription = asyncHandler(
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

    const {
      name,
      amount,
      frequency,
      category,
      billingDate,
      necessityLevel,
      isActive,
    } = req.body;

    // Check if required fields are provided
    if (!name || !amount || !frequency || !category || !billingDate) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    const newSubscription = {
      _id: new mongoose.Types.ObjectId(),
      user: user._id,
      name,
      amount,
      frequency,
      category,
      billingDate,
      necessityLevel: necessityLevel || "C",
      active: isActive !== undefined ? isActive : true,
    };

    try {
      // Use updateOne to push the new subscription directly
      await User.updateOne(
        { _id: user._id },
        { $push: { subscriptions: newSubscription } }
      );

      res.status(201).json(newSubscription);
    } catch (error: any) {
      res.status(400).json({
        message: "Failed to create subscription",
        error: error.message,
      });
    }
  }
);

/**
 * Update a subscription
 * @route   PUT /api/subscriptions/:id
 * @access  Private
 */
const updateSubscription = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user?._id) {
      res.status(400);
      throw new Error("Not authorized, no user found");
    }

    const {
      name,
      amount,
      frequency,
      category,
      billingDate,
      necessityLevel,
      active,
    } = req.body;

    // Build update fields
    const updateFields: Record<string, any> = {};

    if (name) updateFields["subscriptions.$.name"] = name;
    if (amount !== undefined) updateFields["subscriptions.$.amount"] = amount;
    if (frequency) updateFields["subscriptions.$.frequency"] = frequency;
    if (category !== undefined)
      updateFields["subscriptions.$.category"] = category;
    if (billingDate !== undefined)
      updateFields["subscriptions.$.billingDate"] = billingDate;
    if (necessityLevel !== undefined)
      updateFields["subscriptions.$.necessityLevel"] = necessityLevel;
    if (active !== undefined) updateFields["subscriptions.$.active"] = active;

    if (Object.keys(updateFields).length === 0) {
      res.status(400);
      throw new Error("No update fields provided");
    }

    try {
      // Use findOneAndUpdate to update specific subscription
      const result = await User.findOneAndUpdate(
        {
          _id: req.user._id,
          "subscriptions._id": req.params.id,
        },
        { $set: updateFields },
        { new: true }
      );

      if (!result) {
        res.status(404);
        throw new Error("Subscription not found");
      }

      // Find the updated subscription
      const updatedSubscription = result.subscriptions.find(
        (sub) => sub._id.toString() === req.params.id
      );

      res.status(200).json(updatedSubscription);
    } catch (error: any) {
      res.status(400).json({
        message: "Failed to update subscription",
        error: error.message,
      });
    }
  }
);

/**
 * Delete a subscription
 * @route   DELETE /api/subscriptions/:id
 * @access  Private
 */
const deleteSubscription = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user?._id) {
      res.status(400);
      throw new Error("Not authorized, no user found");
    }

    try {
      // Use updateOne with $pull to remove the subscription
      const result = await User.updateOne(
        { _id: req.user._id },
        { $pull: { subscriptions: { _id: req.params.id } } }
      );

      if (result.modifiedCount === 0) {
        res.status(404);
        throw new Error("Subscription not found or already deleted");
      }

      // Get updated subscriptions list
      const updatedUser = await User.findById(req.user._id);
      res.status(200).json({
        message: "Subscription removed",
        subscriptions: updatedUser?.subscriptions || [],
      });
    } catch (error: any) {
      res.status(400).json({
        message: "Failed to delete subscription",
        error: error.message,
      });
    }
  }
);

export {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
