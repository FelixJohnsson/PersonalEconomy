import { Request } from "express";
import User from "../models/userModel";
import { IUser } from "../models/userModel";

// Extend Express Request interface to include user property
export interface UserRequest extends Request {
  user?: IUser;
}

export const findUser = async (req: Request & { user?: IUser }) => {
  if (!req.user) {
    return 400;
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return 404;
  }

  return user;
};

export const findUserById = async (id: string) => {
  if (!id) {
    return 400;
  }

  const user = await User.findById(id);

  if (!user) {
    return 404;
  }

  return user;
};

export const findUserByEmail = async (email: string) => {
  if (!email) {
    return 400;
  }

  const user = await User.findOne({ email });

  if (!user) {
    return 404;
  }

  return user;
};

export const doesUserExist = async (id: string) => {
  const user = await User.findById(id);

  return user ? true : false;
};
