import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/userModel";

// Extend the Request interface to include user property
interface UserRequest extends Request {
  user?: IUser;
}

// JWT payload interface
interface JwtPayload {
  id: string;
}

/**
 * Protect routes - Authentication middleware
 * Verifies the JWT token in the Authorization header
 */
const protect = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let token;

    // Check if Authorization header exists and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as JwtPayload;

        // Get user from the token (excluding password)
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
          req.user = user;
        }

        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
);

export { protect };
