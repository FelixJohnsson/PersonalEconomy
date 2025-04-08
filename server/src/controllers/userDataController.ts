import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User, { IUser } from "../models/userModel";

interface UserRequest extends Request {
  user?: IUser;
}

/**
 * Get all user data
 * @route   GET /api/user-data
 * @access  Private
 */
const getUserData = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ user });
});

export { getUserData };
