import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Asset from "../models/assetModel";
import User, { IUser } from "../models/userModel";

// Extend Express Request interface to include user property
interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Get all assets for the authenticated user
 * @route   GET /api/assets
 * @access  Private
 */
const getAssets = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const assets = await Asset.find({ user: req.user._id });

  res.status(200).json(assets);
});

/**
 * Get a specific asset by ID
 * @route   GET /api/assets/:id
 * @access  Private
 */
const getAssetById = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const asset = await Asset.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (asset) {
    res.status(200).json(asset);
  } else {
    res.status(404);
    throw new Error("Asset not found");
  }
});

/**
 * Create a new asset
 * @route   POST /api/assets
 * @access  Private
 */
const createAsset = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const { name, value, type, acquisitionDate, category } = req.body;

  // Check if required fields are provided
  if (!name || !value || !type) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const asset = await Asset.create({
    user: req.user._id,
    name,
    value,
    type,
    acquisitionDate,
    category,
  });

  if (asset) {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.assets.push(asset);
    await user.save();

    res.status(201).json(asset);
  } else {
    res.status(400);
    throw new Error("Invalid asset data");
  }
});

/**
 * Update an asset
 * @route   PUT /api/assets/:id
 * @access  Private
 */
const updateAsset = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const asset = await Asset.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  const { name, value, type, acquisitionDate, notes, category, growthRate } =
    req.body;

  // Update asset fields if provided
  asset.name = name || asset.name;
  asset.value = value !== undefined ? value : asset.value;
  asset.type = type || asset.type;

  // Update optional fields
  if (acquisitionDate !== undefined) asset.acquisitionDate = acquisitionDate;
  if (notes !== undefined) asset.notes = notes;
  if (category !== undefined) asset.category = category;
  if (growthRate !== undefined) asset.growthRate = growthRate;

  const updatedAsset = await asset.save();

  res.status(200).json(updatedAsset);
});

/**
 * Delete an asset
 * @route   DELETE /api/assets/:id
 * @access  Private
 */
const deleteAsset = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const asset = await Asset.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  await asset.deleteOne();

  res.status(200).json({ message: "Asset removed" });
});

/**
 * Add a deposit to an asset
 * @route   POST /api/user-data/assets/:id/deposit
 * @access  Private
 */
const addAssetDeposit = asyncHandler(
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

    const asset = user.assets.find(
      (ast) => ast?._id?.toString() === req.params.id
    );

    if (!asset) {
      res.status(404);
      throw new Error("Asset not found");
    }

    const { amount, date } = req.body;

    if (amount === undefined || !date) {
      res.status(400);
      throw new Error("Please provide amount and date");
    }

    // Initialize deposits array if it doesn't exist
    if (!asset.deposits) asset.deposits = [];

    // Add new deposit
    asset.deposits.push({
      date,
      amount,
    });

    await user.save();

    res.status(201).json(asset);
  }
);

/**
 * Update an asset value
 * @route   PUT /api/user-data/assets/:id/value
 * @access  Private
 */
const updateAssetValue = asyncHandler(
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

    const asset = user.assets.find(
      (ast) => ast?._id?.toString() === req.params.id
    );

    if (!asset) {
      res.status(404);
      throw new Error("Asset not found");
    }

    const { value, date } = req.body;

    if (value === undefined || !date) {
      res.status(400);
      throw new Error("Please provide value and date");
    }

    // Update asset's current value
    asset.value = value;

    // Add to value history array
    if (!asset.values) asset.values = [];

    asset.values.push({
      date,
      value,
    });

    await user.save();

    res.status(200).json(asset);
  }
);

export {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  addAssetDeposit,
  updateAssetValue,
};
