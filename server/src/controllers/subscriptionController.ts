import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import { IUser } from "../models/userModel";

// Extend Express Request interface to include user property
interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Get all subscriptions for the authenticated user
 * @route   GET /api/subscriptions
 * @access  Private
 */
const getSubscriptions = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json(user.subscriptions || []);
  }
);

/**
 * Get a specific subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
const getSubscriptionById = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
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
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
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

    console.warn("Req body", req.body);

    // Check if required fields are provided
    if (!name || !amount || !frequency || !category || !billingDate) {
      res.status(400);
      console.log("Please provide all required fields");
      throw new Error("Please provide all required fields");
    }

    console.warn("User ID", req.user._id);
    const user = await User.findById(req.user._id);

    console.warn("User", user);

    if (!user) {
      res.status(404);
      console.log("User not found");
      throw new Error("User not found");
    }

    const newSubscription = {
      user: req.user._id, // Add the user ID to the subscription
      name,
      amount,
      frequency,
      category,
      billingDate,
      necessityLevel: necessityLevel || "C",
      active: isActive !== undefined ? isActive : true,
    };

    console.warn("New subscription", newSubscription);

    try {
      user.subscriptions.push(newSubscription as any);
      const updatedUser = await user.save();
      console.warn("Updated user", updatedUser);

      // Return the newly created subscription
      const createdSubscription =
        updatedUser.subscriptions[updatedUser.subscriptions.length - 1];
      res.status(201).json(createdSubscription);
      return; // Add return to prevent continued execution
    } catch (error: any) {
      console.warn("Error", error);
      res.status(400).json({
        message: "Failed to create subscription",
        error: error.message,
      });
      return; // Add return to prevent continued execution
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
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const subscription = user.subscriptions.find(
      (sub) => sub._id?.toString() === req.params.id
    );

    if (!subscription) {
      res.status(404);
      throw new Error("Subscription not found");
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

    // Update subscription fields if provided
    if (name) subscription.name = name;
    if (amount !== undefined) subscription.amount = amount;
    if (frequency) subscription.frequency = frequency;
    if (category !== undefined) subscription.category = category;
    if (billingDate !== undefined) subscription.billingDate = billingDate;
    if (necessityLevel !== undefined)
      subscription.necessityLevel = necessityLevel;
    if (active !== undefined) subscription.active = active;

    await user.save();

    res.status(200).json(subscription);
  }
);

/**
 * Delete a subscription
 * @route   DELETE /api/subscriptions/:id
 * @access  Private
 */
const deleteSubscription = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const subscriptionIndex = user.subscriptions.findIndex(
      (sub) => sub._id?.toString() === req.params.id
    );

    if (subscriptionIndex === -1) {
      res.status(404);
      throw new Error("Subscription not found");
    }

    user.subscriptions.splice(subscriptionIndex, 1);
    await user.save();

    res.status(200).json({ message: "Subscription removed" });
  }
);

export {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
