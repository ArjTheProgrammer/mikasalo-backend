import { z } from 'zod';

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PREPARING = 'preparing',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

// Order item schema for embedded items array
const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  name: z.string().min(1, 'Item name is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  notes: z.string().optional()
});

// Main order schema
export const createOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  totalPrice: z.number().positive('Total price must be positive'),
  status: z.enum(OrderStatus).default(OrderStatus.PENDING),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  orderTime: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export const updateOrderSchema = z.object({
  status: z.enum(OrderStatus).optional(),
  updatedAt: z.date().default(() => new Date())
});

export const updateOrderItemsSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  totalPrice: z.number().positive('Total price must be positive').optional(),
  updatedAt: z.date().default(() => new Date()).optional()
});

export const orderQuerySchema = z.object({
  userId: z.string().optional(),
  status: z.enum(OrderStatus).optional(),
  page: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive().max(100)).optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderItemsInput = z.infer<typeof updateOrderItemsSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

export const toNewOrder = (object: unknown): CreateOrderInput => {
    return createOrderSchema.parse(object);
};

export const toUpdateOrder = (object: unknown): UpdateOrderInput => {
    return updateOrderSchema.parse(object);
};

export const toUpdateOrderItems = (object: unknown): UpdateOrderItemsInput => {
    return updateOrderItemsSchema.parse(object);
};