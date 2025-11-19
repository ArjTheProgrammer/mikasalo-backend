import express, { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { NewUserSchema, newUser } from '../utils/validations/user.schema';
import { z } from 'zod';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await userService.findById(req.params.id);
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid user ID' });
  }
});

const newUserParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    NewUserSchema.parse(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

const errorMiddleware = (error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).send({ error: error.issues });
  } else if (error instanceof Error) {
    res.status(400).json({ error: error.message });
  } else {
    next(error);
  }
};

router.post('/', newUserParser, async (req: Request<unknown, unknown, newUser>, res: Response) => {
  try {
    const savedUser = await userService.createUser(req.body);
    res.status(201).json(savedUser);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.use(errorMiddleware);

export default router;