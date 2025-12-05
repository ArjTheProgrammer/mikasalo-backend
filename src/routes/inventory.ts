import express, { Request, Response } from 'express';
import inventoryService from '../services/inventoryService';
import { newInventory, UpdateInventoryInput, UpdateStockInput } from '../utils/validations/inventory.schema';
import { newInventoryParser, updateInventoryParser, updateStockParser } from '../utils/middlewareParser';

const router = express.Router();

// GET /api/inventory - Get all inventory items
router.get('/', async (_req: Request, res: Response) => {
  try {
    const inventory = await inventoryService.getAllInventory();
    return res.json(inventory);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }
});

// GET /api/inventory/low-stock - Get low stock items
router.get('/low-stock', async (_req: Request, res: Response) => {
  try {
    const lowStockItems = await inventoryService.getLowStockItems();
    return res.json(lowStockItems);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to fetch low stock items' });
    }
  }
});

// GET /api/inventory/:id - Get inventory item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const inventory = await inventoryService.getInventoryById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    return res.json(inventory);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ error: 'Invalid inventory ID format' });
    } else if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
  }
});

// POST /api/inventory - Create new inventory item
router.post('/', newInventoryParser, async (req: Request<unknown, unknown, newInventory>, res: Response) => {
  try {
    const savedInventory = await inventoryService.createInventory(req.body);
    return res.status(201).json(savedInventory);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('E11000')) {
        return res.status(409).json({ 
          error: 'Inventory item with this ID already exists',
          type: 'DUPLICATE_ERROR'
        });
      } else if (error.message.includes('validation failed')) {
        return res.status(400).json({ 
          error: error.message,
          type: 'VALIDATION_ERROR'
        });
      } else {
        return res.status(400).json({ error: error.message });
      }
    } else {
      return res.status(500).json({ error: 'Failed to create inventory item' });
    }
  }
});

// POST /api/inventory/bulk - Create multiple inventory items
router.post('/bulk', async (req: Request<unknown, unknown, newInventory[]>, res: Response) => {
  try {
    // Validate each item in the array
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Request body must be an array of inventory items' });
    }
    
    const savedInventories = await inventoryService.createManyInventoryItems(req.body);
    return res.status(201).json(savedInventories);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('E11000')) {
        return res.status(409).json({ 
          error: 'One or more inventory items have duplicate IDs',
          type: 'DUPLICATE_ERROR'
        });
      } else if (error.message.includes('validation failed')) {
        return res.status(400).json({ 
          error: error.message,
          type: 'VALIDATION_ERROR'
        });
      } else {
        return res.status(400).json({ error: error.message });
      }
    } else {
      return res.status(500).json({ error: 'Failed to create inventory items' });
    }
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', updateInventoryParser, async (req: Request<{ id: string }, unknown, UpdateInventoryInput>, res: Response) => {
  try {
    const updatedInventory = await inventoryService.updateInventory(req.params.id, req.body);
    
    if (!updatedInventory) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    return res.json(updatedInventory);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ error: 'Invalid inventory ID format' });
    } else if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return res.status(400).json({ 
          error: error.message,
          type: 'VALIDATION_ERROR'
        });
      } else {
        return res.status(400).json({ error: error.message });
      }
    } else {
      return res.status(500).json({ error: 'Failed to update inventory item' });
    }
  }
});

// PUT /api/inventory/:id/stock - Update inventory stock
router.put('/:id/stock', updateStockParser, async (req: Request<{ id: string }, unknown, UpdateStockInput>, res: Response) => {
  try {
    const { quantity, operation } = req.body;
    const updatedInventory = await inventoryService.updateStock(req.params.id, operation, quantity);
    
    if (!updatedInventory) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    return res.json(updatedInventory);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ error: 'Invalid inventory ID format' });
    } else if (error instanceof Error) {
      if (error.message.includes('Cannot subtract') || 
          error.message.includes('negative value') ||
          error.message.includes('Invalid operation')) {
        return res.status(400).json({ 
          error: error.message,
          type: 'STOCK_OPERATION_ERROR'
        });
      } else {
        return res.status(400).json({ error: error.message });
      }
    } else {
      return res.status(500).json({ error: 'Failed to update inventory stock' });
    }
  }
});

// POST /api/inventory/:id/check-stock - Check stock availability
router.post('/:id/check-stock', async (req: Request<{ id: string }, unknown, { quantity: number }>, res: Response) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }
    
    const stockCheck = await inventoryService.checkStockAvailability(req.params.id, quantity);
    return res.json(stockCheck);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ error: 'Invalid inventory ID format' });
    } else if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    } else if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to check stock availability' });
    }
  }
});

// POST /api/inventory/validate-stock - Validate stock for multiple items
router.post('/validate-stock', async (req: Request<unknown, unknown, { items: Array<{ inventoryId: string; quantity: number }> }>, res: Response) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array of {inventoryId, quantity} objects' });
    }
    
    const stockErrors = await inventoryService.validateStockForItems(items);
    
    if (stockErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Insufficient stock for some items',
        stockErrors,
        type: 'INSUFFICIENT_STOCK'
      });
    }
    
    return res.json({ message: 'All items have sufficient stock', valid: true });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to validate stock' });
    }
  }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedInventory = await inventoryService.deleteInventory(req.params.id);
    
    if (!deletedInventory) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    return res.json({ 
      message: 'Inventory item deleted successfully',
      deletedItem: deletedInventory 
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ error: 'Invalid inventory ID format' });
    } else if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  }
});

export default router;