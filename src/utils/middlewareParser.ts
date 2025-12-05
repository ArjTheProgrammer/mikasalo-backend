import { Request, Response, NextFunction } from "express";
import { toNewUser } from "./validations/user.schema";
import { toNewMenu } from "./validations/menu.schema";
import { toNewOrder, toUpdateOrder, toUpdateOrderItems } from "./validations/order.schema";
import { toNewInventory, toUpdateInventory, toUpdateStock } from "./validations/inventory.schema";

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

export const newOrderParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    toNewOrder(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const updateOrderParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    toUpdateOrder(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const updateOrderItemsParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    toUpdateOrderItems(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const newInventoryParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    toNewInventory(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const updateInventoryParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    toUpdateInventory(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const updateStockParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    toUpdateStock(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};