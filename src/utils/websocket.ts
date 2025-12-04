import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { Role } from './validations/user.schema';
import config from './config';

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
    role: Role | 'guest';
    email: string;
}

interface TransactionUpdate {
    transactionId: string;
    userId: string;
    orderId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    timestamp: Date;
    type: 'created' | 'status_updated' | 'refund_processed';
    message: string;
}

let io: SocketIOServer | null = null;
const lowStockQueue: LowStockAlert[] = [];
const orderQueue: OrderUpdate[] = [];
const transactionQueue: TransactionUpdate[] = [];
const MAX_QUEUE_SIZE = 100;
const MAX_ORDER_QUEUE_SIZE = 50;
const MAX_TRANSACTION_QUEUE_SIZE = 50;

export const initializeWebSocket = (server: Server): SocketIOServer => {
    try {
        io = new SocketIOServer(server, {
            cors: {
                origin: "*", // Configure based on your frontend URL in production
                methods: ["GET", "POST"]
            },
            allowEIO3: true, // Allow Engine.IO v3 clients
            transports: ['websocket', 'polling'], // Enable both transports
            pingTimeout: 60000,
            pingInterval: 25000
        });

        console.log('WebSocket server initialized successfully');
    } catch (error: any) {
        console.error('Failed to initialize WebSocket server:', error.message);
        throw error;
    }

    // Authentication middleware for WebSocket connections
    io.use((socket: any, next: any) => {
        try {
            const token = socket.handshake.auth?.token;
            
            // Allow connections without token for now, but limit functionality
            if (!token) {
                console.log('WebSocket connection without token - limited access');
                socket.data = { 
                    userId: 'anonymous', 
                    role: 'guest' as const, 
                    email: 'anonymous' 
                };
                return next();
            }

            const secret = config.SECRET;
            if (!secret) {
                console.error('Missing SECRET environment variable');
                return next(new Error('Server configuration error'));
            }

            const decoded = jwt.verify(token, secret) as any; // Use any for now
            
            // Map id to userId for consistency
            const authenticatedSocket: AuthenticatedSocket = {
                userId: decoded.id || decoded.userId, // Accept both formats
                role: decoded.role,
                email: decoded.email
            };
            
            // Validate decoded token structure
            if (!authenticatedSocket.userId || !authenticatedSocket.role || !authenticatedSocket.email) {
                console.error('Invalid token structure:', decoded);
                return next(new Error('Authentication error: Invalid token structure'));
            }
            
            socket.data = authenticatedSocket;
            console.log(`WebSocket authentication successful for user: ${authenticatedSocket.email}`);
            next();
        } catch (error: any) {
            console.error('WebSocket authentication error:', error.message);
            return next(new Error(`Authentication error: ${error.message}`));
        }
    });

    io.on('connection', (socket: any) => {
        try {
            const user = socket.data as AuthenticatedSocket;
            console.log(`User connected: ${user?.email || 'anonymous'} (${user?.role || 'guest'})`);

            // Handle guest connections
            if (!user || user.role === 'guest') {
                console.log('Guest connection established - limited functionality');
                socket.emit('connectionStatus', { status: 'connected', role: 'guest' });
                
                socket.on('disconnect', (reason: string) => {
                    console.log(`Guest user disconnected - Reason: ${reason}`);
                });
                
                socket.on('error', (error: any) => {
                    console.error('Guest socket error:', error.message);
                });
                
                return;
            }

            // Send existing low stock alerts in FIFO order when client connects (admin/cook only)
            if (user.role === Role.ADMIN || user.role === Role.COOK) {
                socket.emit('lowStockQueue', lowStockQueue);
                socket.join('inventory-alerts');
            }

            // Send existing order queue in FIFO order when client connects
            socket.emit('orderQueue', orderQueue);

            // Send existing transaction queue when client connects
            socket.emit('transactionQueue', transactionQueue);
            
            // Join appropriate rooms based on role
            if (user.role === Role.ADMIN || user.role === Role.COOK) {
                socket.join('order-management'); // Can see all orders
            } else if (user.role === Role.CUSTOMER) {
                socket.join(`customer-${user.userId}`); // Can only see their own orders
                socket.join(`customer-transactions-${user.userId}`); // Can only see their own transactions
            }

            // Send connection success status
            socket.emit('connectionStatus', { status: 'connected', role: user.role });

            // Set up event handlers for authenticated users
            socket.on('disconnect', (reason: string) => {
                try {
                    console.log(`User disconnected: ${user?.email || 'anonymous'} - Reason: ${reason}`);
                } catch (error: any) {
                    console.error('Error in disconnect handler:', error.message);
                }
            });

            socket.on('error', (error: any) => {
                console.error('Socket error:', error.message);
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

            // Handle request for current transaction queue
            socket.on('requestTransactionUpdate', () => {
                if (user.role === Role.ADMIN) {
                    socket.emit('transactionQueue', transactionQueue);
                } else if (user.role === Role.CUSTOMER) {
                    // Filter transactions for this customer only
                    const customerTransactions = transactionQueue.filter(
                        transaction => transaction.userId === user.userId
                    );
                    socket.emit('transactionQueue', customerTransactions);
                }
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

            // Handle clearing specific transaction from queue (admin only)
            socket.on('clearTransactionUpdate', (transactionId: string) => {
                if (user.role === Role.ADMIN) {
                    const index = transactionQueue.findIndex(transaction => transaction.transactionId === transactionId);
                    if (index > -1) {
                        transactionQueue.splice(index, 1);
                        io?.to('transaction-management').emit('transactionQueue', transactionQueue);
                    }
                }
            });

            // Handle clearing all transaction updates (admin only)
            socket.on('clearAllTransactionUpdates', () => {
                if (user.role === Role.ADMIN) {
                    transactionQueue.length = 0;
                    io?.emit('transactionQueue', transactionQueue);
                }
            });

        } catch (error: any) {
            console.error('Error in connection handler:', error.message);
            socket.emit('connectionError', { message: 'Connection setup failed' });
        }
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

export const broadcastTransactionUpdate = (transactionUpdate: TransactionUpdate): void => {
    if (!io) {
        console.warn('WebSocket not initialized. Cannot broadcast transaction update.');
        return;
    }

    // Add to transaction queue (FIFO)
    transactionQueue.unshift(transactionUpdate);
    
    // Maintain maximum queue size
    if (transactionQueue.length > MAX_TRANSACTION_QUEUE_SIZE) {
        transactionQueue.pop();
    }

    // Broadcast to admin room (they see all transactions)
    io.to('transaction-management').emit('transactionUpdate', transactionUpdate);
    io.to('transaction-management').emit('transactionQueue', transactionQueue);

    // Also broadcast to specific customer if it's their transaction
    io.to(`customer-transactions-${transactionUpdate.userId}`).emit('transactionUpdate', transactionUpdate);
};

export const getWebSocketServer = (): SocketIOServer | null => {
    return io;
};

export const disconnectAllClients = (): void => {
    if (io) {
        io.disconnectSockets();
    }
};

export { LowStockAlert, OrderUpdate, AuthenticatedSocket, TransactionUpdate };