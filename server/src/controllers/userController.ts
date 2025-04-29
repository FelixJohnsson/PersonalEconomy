import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User, { IUser } from "../models/userModel";

// Extend Express Request interface to include user property
interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Register a new user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check if required fields are provided
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isSetupComplete: user.isSetupComplete,
      token: user.getSignedJwtToken(),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

/**
 * Authenticate a user and get token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.warn("Login user", email, password);

    // Check if email and password are provided
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.warn("Is match", isMatch, user);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isSetupComplete: user.isSetupComplete,
      token: user.getSignedJwtToken(),
    });
  } catch (error: any) {
    res.status(401);
    console.warn("Error", error);
    throw new Error(error.message);
  }
});

/**
 * Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req: UserRequest, res: Response) => {
  const user = await User.findById(req.user?._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isSetupComplete: user.isSetupComplete,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isSetupComplete =
        req.body.isSetupComplete !== undefined
          ? req.body.isSetupComplete
          : user.isSetupComplete;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isSetupComplete: updatedUser.isSetupComplete,
        token: updatedUser.getSignedJwtToken(),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  }
);

export { registerUser, loginUser, getUserProfile, updateUserProfile };
