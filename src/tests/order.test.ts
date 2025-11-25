import request from 'supertest';
import mongoose from 'mongoose';
import app, { server } from '../app';
import Order from '../models/order.model';
import Menu from '../models/menu.model';
import Inventory from '../models/inventory.model';
import Recipe from '../models/recipe.model';
import User from '../models/user.model';
import { Role } from '../utils/validations/user.schema';
import { OrderStatus } from '../utils/validations/order.schema';
import config from '../utils/config';
import { disconnectAllClients } from '../utils/websocket';

describe('Order Routes and Inventory Management', () => {
  let userId: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    // Clear all collections
    await Order.deleteMany({});
    await User.deleteMany({});
    await Menu.deleteMany({});
    await Inventory.deleteMany({});
    await Recipe.deleteMany({});

    // Create a test user
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '+1234567890',
        role: Role.CUSTOMER
      });
    
    userId = userResponse.body.id;

    // Login to get token (for future WebSocket authentication)
    await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    // Create test menu item
    await Menu.create({
      _id: 'menu-burger-american',
      name: 'American Burger',
      description: 'Classic burger',
      price: 195.00,
      category: 'burger',
      isAvailable: true
    });

    // Create test inventory items
    await Inventory.insertMany([
      {
        _id: 'inv-beef-patty',
        name: 'Beef Patty',
        unit: 'pieces',
        currentStock: 100,
        lowStockThreshold: 20
      },
      {
        _id: 'inv-american-cheese-slices',
        name: 'American Cheese Slices',
        unit: 'pieces',
        currentStock: 150,
        lowStockThreshold: 25
      }
    ]);

    // Create test recipe
    await Recipe.create({
      _id: 'recipe-menu-burger-american',
      menuItemId: 'menu-burger-american',
      ingredientsUsed: [
        { inventoryId: 'inv-beef-patty', quantityUsed: 1 },
        { inventoryId: 'inv-american-cheese-slices', quantityUsed: 1 }
      ]
    });
  });

  afterAll(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
    await Menu.deleteMany({});
    await Inventory.deleteMany({});
    await Recipe.deleteMany({});
    disconnectAllClients();
    server.close();
    await mongoose.connection.close();
  });

  describe('POST /api/orders', () => {
    it('should create a new order with correct price calculation', async () => {
      const orderData = {
        userId,
        items: [
          {
            menuItemId: 'menu-burger-american',
            name: 'American Burger',
            price: 195.00, // This will be recalculated
            quantity: 2,
            notes: 'Extra sauce'
          }
        ],
        totalPrice: 390.00, // This will be recalculated
        deliveryAddress: '123 Test Street'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.userId).toBe(userId);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].price).toBe(390.00); // 195 * 2
      expect(response.body.totalPrice).toBe(390.00);
      expect(response.body.status).toBe(OrderStatus.PENDING);
    });

    it('should reject order with insufficient inventory', async () => {
      // Update inventory to have insufficient stock
      await Inventory.findByIdAndUpdate('inv-beef-patty', { currentStock: 1 });

      const orderData = {
        userId,
        items: [
          {
            menuItemId: 'menu-burger-american',
            name: 'American Burger',
            price: 195.00,
            quantity: 5, // Requires 5 beef patties, but only 1 available
            notes: ''
          }
        ],
        totalPrice: 975.00,
        deliveryAddress: '123 Test Street'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('Insufficient stock');
      expect(response.body.error).toContain('Beef Patty');
    });

    it('should reject order with unavailable menu item', async () => {
      await Menu.findByIdAndUpdate('menu-burger-american', { isAvailable: false });

      const orderData = {
        userId,
        items: [
          {
            menuItemId: 'menu-burger-american',
            name: 'American Burger',
            price: 195.00,
            quantity: 1,
            notes: ''
          }
        ],
        totalPrice: 195.00,
        deliveryAddress: '123 Test Street'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('currently unavailable');
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create test orders
      await Order.insertMany([
        {
          userId,
          items: [{ menuItemId: 'menu-burger-american', name: 'American Burger', price: 195, quantity: 1 }],
          totalPrice: 195,
          status: OrderStatus.PENDING,
          deliveryAddress: '123 Test Street',
          orderTime: new Date()
        },
        {
          userId,
          items: [{ menuItemId: 'menu-burger-american', name: 'American Burger', price: 390, quantity: 2 }],
          totalPrice: 390,
          status: OrderStatus.CONFIRMED,
          deliveryAddress: '456 Test Avenue',
          orderTime: new Date()
        }
      ]);
    });

    it('should get all orders with pagination', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body.orders).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter orders by userId', async () => {
      const response = await request(app)
        .get(`/api/orders?userId=${userId}`)
        .expect(200);

      expect(response.body.orders).toHaveLength(2);
      expect(response.body.orders[0].userId).toBe(userId);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get(`/api/orders?status=${OrderStatus.PENDING}`)
        .expect(200);

      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0].status).toBe(OrderStatus.PENDING);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await Order.create({
        userId,
        items: [{ menuItemId: 'menu-burger-american', name: 'American Burger', price: 195, quantity: 1 }],
        totalPrice: 195,
        status: OrderStatus.PENDING,
        deliveryAddress: '123 Test Street',
        orderTime: new Date()
      });
      orderId = order.id;
    });

    it('should update order status and deduct inventory when preparing', async () => {
      const initialBeefStock = await Inventory.findById('inv-beef-patty');
      const initialCheeseStock = await Inventory.findById('inv-american-cheese-slices');

      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.PREPARING })
        .expect(200);

      expect(response.body.status).toBe(OrderStatus.PREPARING);

      // Check inventory was deducted
      const updatedBeefStock = await Inventory.findById('inv-beef-patty');
      const updatedCheeseStock = await Inventory.findById('inv-american-cheese-slices');

      expect(updatedBeefStock!.currentStock).toBe(initialBeefStock!.currentStock - 1);
      expect(updatedCheeseStock!.currentStock).toBe(initialCheeseStock!.currentStock - 1);
    });

    it('should prevent cancelling order in preparing status', async () => {
      // First update to preparing
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.PREPARING });

      // Try to cancel
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.CANCELLED })
        .expect(400);

      expect(response.body.error).toContain('Cannot cancel order that is already being prepared');
    });

    it('should restore inventory when cancelling confirmed order before preparing', async () => {
      // First update to confirmed
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.CONFIRMED });

      const initialStock = await Inventory.findById('inv-beef-patty');

      // Cancel the confirmed order (no inventory should be affected since it never reached preparing)
      const cancelResponse = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: OrderStatus.CANCELLED });
      
      expect(cancelResponse.status).toBe(200);

      const stockAfterCancelling = await Inventory.findById('inv-beef-patty');
      expect(stockAfterCancelling!.currentStock).toBe(initialStock!.currentStock);
    });
  });

  describe('PUT /api/orders/:id/items', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await Order.create({
        userId,
        items: [{ menuItemId: 'menu-burger-american', name: 'American Burger', price: 195, quantity: 1 }],
        totalPrice: 195,
        status: OrderStatus.PENDING,
        deliveryAddress: '123 Test Street',
        orderTime: new Date()
      });
      orderId = order.id;
    });

    it('should update order items for pending orders', async () => {
      const updateData = {
        items: [
          {
            menuItemId: 'menu-burger-american',
            name: 'American Burger',
            price: 195.00,
            quantity: 3,
            notes: 'Extra cheese'
          }
        ],
        totalPrice: 585.00
      };

      const response = await request(app)
        .put(`/api/orders/${orderId}/items`)
        .send(updateData)
        .expect(200);

      expect(response.body.items[0].quantity).toBe(3);
      expect(response.body.items[0].price).toBe(585.00); // 195 * 3
      expect(response.body.totalPrice).toBe(585.00);
    });

    it('should prevent item modification for confirmed orders', async () => {
      // Update order to confirmed status
      await Order.findByIdAndUpdate(orderId, { status: OrderStatus.CONFIRMED });

      const updateData = {
        items: [
          {
            menuItemId: 'menu-burger-american',
            name: 'American Burger',
            price: 195.00,
            quantity: 2,
            notes: ''
          }
        ],
        totalPrice: 390.00
      };

      const response = await request(app)
        .put(`/api/orders/${orderId}/items`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toContain('Cannot modify items for order with status: confirmed');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await Order.create({
        userId,
        items: [{ menuItemId: 'menu-burger-american', name: 'American Burger', price: 195, quantity: 1 }],
        totalPrice: 195,
        status: OrderStatus.PENDING,
        deliveryAddress: '123 Test Street',
        orderTime: new Date()
      });
      orderId = order.id;
    });

    it('should delete pending order', async () => {
      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body.message).toBe('Order deleted successfully');

      const deletedOrder = await Order.findById(orderId);
      expect(deletedOrder).toBeNull();
    });

    it('should prevent deletion of preparing orders', async () => {
      await Order.findByIdAndUpdate(orderId, { status: OrderStatus.PREPARING });

      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(400);

      expect(response.body.error).toContain('Cannot delete order with status: preparing');
    });

    it('should prevent deletion of delivered orders', async () => {
      await Order.findByIdAndUpdate(orderId, { status: OrderStatus.DELIVERED });

      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(400);

      expect(response.body.error).toContain('Cannot delete order with status: delivered');
    });
  });

  describe('Inventory Low Stock WebSocket Notifications', () => {
    it('should emit low stock alert when inventory falls below threshold', async () => {
      // Set low stock threshold high
      await Inventory.findByIdAndUpdate('inv-beef-patty', { 
        currentStock: 25,
        lowStockThreshold: 20 
      });

      const orderData = {
        userId,
        items: [
          {
            menuItemId: 'menu-burger-american',
            name: 'American Burger',
            price: 195.00,
            quantity: 10, // This will bring stock down to 15, below threshold
            notes: ''
          }
        ],
        totalPrice: 1950.00,
        deliveryAddress: '123 Test Street'
      };

      // Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      // Update to preparing to trigger inventory deduction
      await request(app)
        .put(`/api/orders/${orderResponse.body.id}/status`)
        .send({ status: OrderStatus.PREPARING })
        .expect(200);

      // Check if stock fell below threshold
      const updatedInventory = await Inventory.findById('inv-beef-patty');
      expect(updatedInventory!.currentStock).toBeLessThanOrEqual(updatedInventory!.lowStockThreshold);
    });
  });
});