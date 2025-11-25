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

interface AuthenticatedSocket {
    userId: string;
    role: Role;
    email: string;
}

let io: SocketIOServer | null = null;
const lowStockQueue: LowStockAlert[] = [];
const MAX_QUEUE_SIZE = 100;

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
            
            // Only allow admin and cook roles for inventory notifications
            if (decoded.role !== Role.ADMIN && decoded.role !== Role.COOK) {
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
        console.log(`Admin/Cook connected: ${user.email} (${user.role})`);

        // Send existing low stock alerts in FIFO order when client connects
        socket.emit('lowStockQueue', lowStockQueue);

        // Join admin room for inventory notifications
        socket.join('inventory-alerts');

        socket.on('disconnect', () => {
            console.log(`Admin/Cook disconnected: ${user.email}`);
        });

        // Handle request for current low stock items
        socket.on('requestLowStockUpdate', () => {
            socket.emit('lowStockQueue', lowStockQueue);
        });

        // Handle clearing specific alert from queue
        socket.on('clearLowStockAlert', (inventoryId: string) => {
            const index = lowStockQueue.findIndex(alert => alert.inventoryId === inventoryId);
            if (index > -1) {
                lowStockQueue.splice(index, 1);
                // Broadcast updated queue to all connected admins
                io?.to('inventory-alerts').emit('lowStockQueue', lowStockQueue);
            }
        });

        // Handle clearing all alerts
        socket.on('clearAllLowStockAlerts', () => {
            lowStockQueue.length = 0;
            io?.to('inventory-alerts').emit('lowStockQueue', lowStockQueue);
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

export const getWebSocketServer = (): SocketIOServer | null => {
    return io;
};

export const disconnectAllClients = (): void => {
    if (io) {
        io.disconnectSockets();
    }
};

export { LowStockAlert, AuthenticatedSocket };