import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Liability from "../models/liabilityModel";
import { IUser } from "../models/userModel";

// Extend Express Request interface to include user property
interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Get all liabilities for the authenticated user
 * @route   GET /api/liabilities
 * @access  Private
 */
const getLiabilities = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const liabilities = await Liability.find({ user: req.user._id });

  res.status(200).json(liabilities);
});

/**
 * Get a specific liability by ID
 * @route   GET /api/liabilities/:id
 * @access  Private
 */
const getLiabilityById = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const liability = await Liability.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

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
    if (!req.user) {
      res.status(401);
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
    } = req.body;

    // Check if required fields are provided
    if (!name || !amount) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    const liability = await Liability.create({
      user: req.user._id,
      name,
      amount,
      interestRate,
      minimumPayment,
      dueDate,
      category,
      notes,
    });

    if (liability) {
      res.status(201).json(liability);
    } else {
      res.status(400);
      throw new Error("Invalid liability data");
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
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const liability = await Liability.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!liability) {
      res.status(404);
      throw new Error("Liability not found");
    }

    const {
      name,
      amount,
      interestRate,
      minimumPayment,
      dueDate,
      category,
      notes,
    } = req.body;

    // Update liability fields if provided
    liability.name = name || liability.name;
    liability.amount = amount !== undefined ? amount : liability.amount;

    // Update optional fields
    if (interestRate !== undefined) liability.interestRate = interestRate;
    if (minimumPayment !== undefined) liability.minimumPayment = minimumPayment;
    if (dueDate !== undefined) liability.dueDate = dueDate;
    if (category !== undefined) liability.category = category;
    if (notes !== undefined) liability.notes = notes;

    const updatedLiability = await liability.save();

    res.status(200).json(updatedLiability);
  }
);

/**
 * Delete a liability
 * @route   DELETE /api/liabilities/:id
 * @access  Private
 */
const deleteLiability = asyncHandler(
  async (req: UserRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    const liability = await Liability.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!liability) {
      res.status(404);
      throw new Error("Liability not found");
    }

    await liability.deleteOne();

    res.status(200).json({ message: "Liability removed" });
  }
);

export {
  getLiabilities,
  getLiabilityById,
  createLiability,
  updateLiability,
  deleteLiability,
};
