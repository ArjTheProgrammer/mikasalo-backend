import express, { Request, Response } from 'express';
import orderService from '../services/orderService';
import { CreateOrderInput, UpdateOrderInput, UpdateOrderItemsInput } from '../utils/validations/order.schema';
import { newOrderParser, updateOrderParser, updateOrderItemsParser } from '../utils/middlewareParser';

const router = express.Router();

// GET /api/orders - Get all orders with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = {
      userId: req.query.userId as string,
      status: req.query.status as any,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };
    
    const result = await orderService.getAllOrders(query);
    return res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json(order);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    } else if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
  }
});

// POST /api/orders - Create new order
router.post('/', newOrderParser, async (req: Request<unknown, unknown, CreateOrderInput>, res: Response) => {
  try {
    const savedOrder = await orderService.createOrder(req.body);
    return res.status(201).json(savedOrder);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Insufficient stock') || 
          error.message.includes('validation failed') ||
          error.message.includes('unavailable')) {
        return res.status(400).json({ 
          error: error.message,
          type: 'VALIDATION_ERROR'
        });
      } else {
        return res.status(400).json({ error: error.message });
      }
    } else {
      return res.status(500).json({ error: 'Failed to create order' });
    }
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', updateOrderParser, async (req: Request<{ id: string }, unknown, UpdateOrderInput>, res: Response) => {
  try {
    const updatedOrder = await orderService.updateOrderStatus(req.params.id, req.body);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json(updatedOrder);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Order not found')) {
        return res.status(404).json({ error: error.message });
      } else if (error.message.includes('Cannot cancel') || 
                 error.message.includes('Insufficient stock')) {
        return res.status(400).json({ 
          error: error.message,
          type: 'STATUS_CHANGE_ERROR'
        });
      } else {
        return res.status(400).json({ error: error.message });
      }
    } else {
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  }
});

// PUT /api/orders/:id/items - Update order items (only for pending orders)
router.put('/:id/items', updateOrderItemsParser, async (req: Request<{ id: string }, unknown, UpdateOrderItemsInput>, res: Response) => {
  try {
    const updatedOrder = await orderService.updateOrderItems(req.params.id, req.body);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json(updatedOrder);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Order not found')) {
        return res.status(404).json({ error: error.message });
      } else if (error.message.includes('Cannot modify items') || 
                 error.message.includes('Insufficient stock') ||
                 error.message.includes('validation failed')) {
        return res.status(400).json({ 
          error: error.message,
          type: 'MODIFICATION_ERROR'
        });
      } else {
        return res.status(400).json({ error: error.message });
      }
    } else {
      return res.status(500).json({ error: 'Failed to update order items' });
    }
  }
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedOrder = await orderService.deleteOrder(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json({ 
      message: 'Order deleted successfully',
      deletedOrder 
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Order not found')) {
        return res.status(404).json({ error: error.message });
      } else if (error.message.includes('Cannot delete')) {
        return res.status(400).json({ 
          error: error.message,
          type: 'DELETION_ERROR'
        });
      } else {
        return res.status(400).json({ error: error.message });
      }
    } else {
      return res.status(500).json({ error: 'Failed to delete order' });
    }
  }
});

export default router;