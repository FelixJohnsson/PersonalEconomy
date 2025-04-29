import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
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

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!user.assets) {
    res.status(204).json([]);
    return;
  }

  res.status(200).json(user?.assets);
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

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const asset = user.assets.find(
    (asset) => asset?._id?.toString() === req.params.id
  );

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

  const newAsset = {
    name,
    value,
    type,
    acquisitionDate,
    category,
    values: [
      {
        date: new Date().toISOString(),
        value,
      },
    ],
    deposits: [
      {
        date: new Date().toISOString(),
        amount: value,
      },
    ],
  };

  // Find and update the user document directly
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { assets: newAsset } },
    { new: true }
  ).populate("assets");

  if (user) {
    const addedAsset = user.assets[user.assets.length - 1];
    res.status(201).json(addedAsset);
  } else {
    res.status(404);
    throw new Error("User not found");
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

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const asset = user.assets.find(
    (asset) => asset?._id?.toString() === req.params.id
  );

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

  await asset.save();

  const allAssets = await User.findById(req.user?._id).populate("assets");

  res.status(200).json(allAssets?.assets);
});

/**
 * Delete an asset
 * @route   DELETE /api/assets/:id
 * @access  Private
 */
const deleteAsset = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
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
      (asset) => asset?._id?.toString() === req.params.id
    );

    if (!asset) {
      res.status(404);
      throw new Error("Asset not found");
    }

    const result = await User.updateOne(
      { _id: req.user._id },
      { $pull: { assets: { _id: req.params.id } } }
    );

    if (result.modifiedCount === 0) {
      res.status(404);
      throw new Error("Asset not found or already deleted");
    }

    const updatedUser = await User.findById(req.user._id);
    res.status(200).json(updatedUser?.assets);
  } catch (error: any) {
    console.warn("Error deleting asset", error);
    res.status(400).json({
      message: "Failed to delete asset",
      error: error.message,
    });
  }
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
    try {
      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, no user found");
      }

      const { value, date } = req.body;

      if (value === undefined || !date) {
        res.status(400);
        throw new Error("Please provide value and date");
      }

      if (value < 0) {
        res.status(400);
        throw new Error("Value cannot be negative");
      }

      const result = await User.updateOne(
        {
          _id: req.user._id,
          "assets._id": req.params.id,
        },
        {
          $push: {
            "assets.$.values": {
              date,
              value,
            },
          },
          $set: {
            "assets.$.value": value,
          },
        }
      );

      if (result.matchedCount === 0) {
        res.status(404);
        throw new Error("Asset not found");
      }

      const updatedUser = await User.findById(req.user._id).populate("assets");
      res.status(200).json(updatedUser?.assets);
    } catch (error: any) {
      console.warn("Error updating asset value", error);
      res.status(400).json({
        message: "Failed to update asset value",
        error: error.message,
      });
    }
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
