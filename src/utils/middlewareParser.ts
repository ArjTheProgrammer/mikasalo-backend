import { Request, Response, NextFunction } from "express";
import { toNewUser } from "./validations/user.schema";
import { toNewMenu } from "./validations/menu.schema";

export const newUserParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    toNewUser(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const newMenuParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    toNewMenu(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};