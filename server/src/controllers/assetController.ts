import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Asset, { IAsset } from "../models/assetModel";
import { IUser } from "../models/userModel";

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

  const { name, value, type, acquisitionDate, notes, category, growthRate } =
    req.body;

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
    notes,
    category,
    growthRate,
  });

  if (asset) {
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

export { getAssets, getAssetById, createAsset, updateAsset, deleteAsset };
