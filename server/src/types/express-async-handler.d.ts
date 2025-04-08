declare module "express-async-handler" {
  import { Request, Response, NextFunction } from "express";

  type AsyncFunction = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<any>;

  export default function asyncHandler(fn: AsyncFunction): AsyncFunction;
}
