import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { Role } from './validations/user.schema';

interface LowStockAlert {
    inventoryId: string;
    name: string;
    currentStock: number;
    lowStockThreshold: number;
    unit: string;
    timestamp: Date;
}

interface OrderUpdate {
    orderId: string;
    userId: string;
    status: string;
    totalPrice: number;
    orderTime: Date;
    updatedAt: Date;
    type: 'created' | 'status_updated' | 'items_updated' | 'deleted';
    message: string;
}

interface AuthenticatedSocket {
    userId: string;
    role: Role;
    email: string;
}

let io: SocketIOServer | null = null;
const lowStockQueue: LowStockAlert[] = [];
const orderQueue: OrderUpdate[] = [];
const MAX_QUEUE_SIZE = 100;
const MAX_ORDER_QUEUE_SIZE = 50;

export const initializeWebSocket = (server: Server): SocketIOServer => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*", // Configure based on your frontend URL in production
            methods: ["GET", "POST"]
        }
    });

    // Authentication middleware for WebSocket connections
    io.use((socket: any, next: any) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const secret = process.env.SECRET;
            if (!secret) {
                return next(new Error('Server configuration error'));
            }

            const decoded = jwt.verify(token, secret) as AuthenticatedSocket;
            
            // Allow admin, cook, and customer roles for order notifications
            if (decoded.role !== Role.ADMIN && decoded.role !== Role.COOK && decoded.role !== Role.CUSTOMER) {
                return next(new Error('Authentication error: Insufficient permissions'));
            }

            socket.data = decoded;
            next();
        } catch (error) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket: any) => {
        const user = socket.data as AuthenticatedSocket;
        console.log(`User connected: ${user.email} (${user.role})`);

        // Send existing low stock alerts in FIFO order when client connects (admin/cook only)
        if (user.role === Role.ADMIN || user.role === Role.COOK) {
            socket.emit('lowStockQueue', lowStockQueue);
            socket.join('inventory-alerts');
        }

        // Send existing order queue in FIFO order when client connects
        socket.emit('orderQueue', orderQueue);
        
        // Join appropriate rooms based on role
        if (user.role === Role.ADMIN || user.role === Role.COOK) {
            socket.join('order-management'); // Can see all orders
        } else if (user.role === Role.CUSTOMER) {
            socket.join(`customer-${user.userId}`); // Can only see their own orders
        }

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.email}`);
        });

        // Handle request for current low stock items (admin/cook only)
        socket.on('requestLowStockUpdate', () => {
            if (user.role === Role.ADMIN || user.role === Role.COOK) {
                socket.emit('lowStockQueue', lowStockQueue);
            }
        });

        // Handle request for current order queue
        socket.on('requestOrderUpdate', () => {
            socket.emit('orderQueue', orderQueue);
        });

        // Handle clearing specific alert from queue (admin/cook only)
        socket.on('clearLowStockAlert', (inventoryId: string) => {
            if (user.role === Role.ADMIN || user.role === Role.COOK) {
                const index = lowStockQueue.findIndex(alert => alert.inventoryId === inventoryId);
                if (index > -1) {
                    lowStockQueue.splice(index, 1);
                    // Broadcast updated queue to all connected admins
                    io?.to('inventory-alerts').emit('lowStockQueue', lowStockQueue);
                }
            }
        });

        // Handle clearing all alerts (admin/cook only)
        socket.on('clearAllLowStockAlerts', () => {
            if (user.role === Role.ADMIN || user.role === Role.COOK) {
                lowStockQueue.length = 0;
                io?.to('inventory-alerts').emit('lowStockQueue', lowStockQueue);
            }
        });

        // Handle clearing specific order from queue (admin/cook only)
        socket.on('clearOrderUpdate', (orderId: string) => {
            if (user.role === Role.ADMIN || user.role === Role.COOK) {
                const index = orderQueue.findIndex(order => order.orderId === orderId);
                if (index > -1) {
                    orderQueue.splice(index, 1);
                    // Broadcast updated queue to all connected users
                    io?.emit('orderQueue', orderQueue);
                }
            }
        });

        // Handle clearing all order updates (admin only)
        socket.on('clearAllOrderUpdates', () => {
            if (user.role === Role.ADMIN) {
                orderQueue.length = 0;
                io?.emit('orderQueue', orderQueue);
            }
        });
    });

    return io;
};

export const broadcastLowStockAlert = (alert: LowStockAlert): void => {
    if (!io) {
        console.warn('WebSocket not initialized. Cannot broadcast low stock alert.');
        return;
    }

    // Check if alert for this inventory item already exists in queue
    const existingIndex = lowStockQueue.findIndex(
        existingAlert => existingAlert.inventoryId === alert.inventoryId
    );

    if (existingIndex > -1) {
        // Update existing alert with new stock level and timestamp
        lowStockQueue[existingIndex] = alert;
    } else {
        // Add new alert to the front of the queue (FIFO)
        lowStockQueue.unshift(alert);
        
        // Maintain maximum queue size
        if (lowStockQueue.length > MAX_QUEUE_SIZE) {
            lowStockQueue.pop();
        }
    }

    // Broadcast to all connected admins and cooks
    io.to('inventory-alerts').emit('lowStockAlert', alert);
    io.to('inventory-alerts').emit('lowStockQueue', lowStockQueue);
};

export const broadcastOrderUpdate = (orderUpdate: OrderUpdate): void => {
    if (!io) {
        console.warn('WebSocket not initialized. Cannot broadcast order update.');
        return;
    }

    // Add to order queue (FIFO)
    orderQueue.unshift(orderUpdate);
    
    // Maintain maximum queue size
    if (orderQueue.length > MAX_ORDER_QUEUE_SIZE) {
        orderQueue.pop();
    }

    // Broadcast to admin/cook rooms (they see all orders)
    io.to('order-management').emit('orderUpdate', orderUpdate);
    io.to('order-management').emit('orderQueue', orderQueue);

    // Also broadcast to specific customer if it's their order
    io.to(`customer-${orderUpdate.userId}`).emit('orderUpdate', orderUpdate);
    
    // Broadcast updated queue to all connected users
    io.emit('orderQueue', orderQueue);
};

export const getWebSocketServer = (): SocketIOServer | null => {
    return io;
};

export const disconnectAllClients = (): void => {
    if (io) {
        io.disconnectSockets();
    }
};

export { LowStockAlert, OrderUpdate, AuthenticatedSocket };