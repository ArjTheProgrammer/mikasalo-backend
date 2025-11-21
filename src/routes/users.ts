import express, { Request, Response } from 'express';
import userService from '../services/userService';
import { newUser } from '../utils/validations/user.schema';
import { newUserParser } from '../utils/middlewareParser';

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

export default router;