import express, { Request, Response } from 'express';
import menuService from '../services/menuService';
import { newMenu } from '../utils/validations/menu.schema';
import { newMenuParser } from '../utils/middlewareParser';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const menu = await menuService.getAllMenu();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch menu ${error}` });
  }
});

router.post('/', newMenuParser, async (req: Request<unknown, unknown, newMenu>, res: Response) => {
  try {
    const savedMenu = await menuService.createMenu(req.body);
    res.status(201).json(savedMenu);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;