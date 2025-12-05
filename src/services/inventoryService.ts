import Inventory from "../models/inventory.model";
import { newInventory, UpdateInventoryInput } from "../utils/validations/inventory.schema";
import { broadcastLowStockAlert } from "../utils/websocket";

interface StockCheckResult {
    isAvailable: boolean;
    currentStock: number;
    required: number;
    inventoryId: string;
    name: string;
}

interface StockError {
    inventoryId: string;
    name: string;
    required: number;
    available: number;
}

const getAllInventory = async () => {
    const inventory = await Inventory.find({});
    return inventory;
}

const createInventory = async (inventoryData: newInventory) => {
    const inventory = new Inventory(inventoryData);
    const savedInventory = await inventory.save();
    return savedInventory;
}

const createManyInventoryItems = async (inventoryItems: newInventory[]) => {
    const inventories = await Inventory.insertMany(inventoryItems);
    return inventories;
}

const checkStockAvailability = async (inventoryId: string, requiredQuantity: number): Promise<StockCheckResult> => {
    const inventory = await Inventory.findById(inventoryId);
    
    if (!inventory) {
        throw new Error(`Inventory item not found: ${inventoryId}`);
    }

    return {
        isAvailable: inventory.currentStock >= requiredQuantity,
        currentStock: inventory.currentStock,
        required: requiredQuantity,
        inventoryId,
        name: inventory.name
    };
}

const deductStock = async (inventoryId: string, quantity: number): Promise<void> => {
    const result = await Inventory.findOneAndUpdate(
        { 
            _id: inventoryId,
            currentStock: { $gte: quantity }
        },
        { 
            $inc: { currentStock: -quantity },
            $set: { updatedAt: new Date() }
        },
        { new: true }
    );

    if (!result) {
        const inventory = await Inventory.findById(inventoryId);
        if (!inventory) {
            throw new Error(`Inventory item not found: ${inventoryId}`);
        }
        throw new Error(`Insufficient stock for ${inventory.name}. Required: ${quantity}, Available: ${inventory.currentStock}`);
    }

    // Check if stock fell below threshold and emit WebSocket notification
    if (result.currentStock <= result.lowStockThreshold) {
        broadcastLowStockAlert({
            inventoryId: result._id,
            name: result.name,
            currentStock: result.currentStock,
            lowStockThreshold: result.lowStockThreshold,
            unit: result.unit,
            timestamp: new Date()
        });
    }
}

const restoreStock = async (inventoryId: string, quantity: number): Promise<void> => {
    const result = await Inventory.findOneAndUpdate(
        { _id: inventoryId },
        { 
            $inc: { currentStock: quantity },
            $set: { updatedAt: new Date() }
        },
        { new: true }
    );

    if (!result) {
        throw new Error(`Inventory item not found: ${inventoryId}`);
    }
}

const validateStockForItems = async (requiredItems: Array<{ inventoryId: string; quantity: number }>): Promise<StockError[]> => {
    const stockErrors: StockError[] = [];
    
    for (const item of requiredItems) {
        try {
            const stockCheck = await checkStockAvailability(item.inventoryId, item.quantity);
            if (!stockCheck.isAvailable) {
                stockErrors.push({
                    inventoryId: item.inventoryId,
                    name: stockCheck.name,
                    required: item.quantity,
                    available: stockCheck.currentStock
                });
            }
        } catch (error) {
            stockErrors.push({
                inventoryId: item.inventoryId,
                name: 'Unknown Item',
                required: item.quantity,
                available: 0
            });
        }
    }
    
    return stockErrors;
}

const getLowStockItems = async () => {
    const lowStockItems = await Inventory.find({
        $expr: { $lte: ["$currentStock", "$lowStockThreshold"] }
    });
    return lowStockItems;
}

const getInventoryById = async (id: string) => {
    const inventory = await Inventory.findById(id);
    return inventory;
}

const updateInventory = async (id: string, updateData: UpdateInventoryInput) => {
    const updatedInventory = await Inventory.findByIdAndUpdate(
        id, 
        { 
            ...updateData,
            updatedAt: new Date()
        }, 
        { 
            new: true,
            runValidators: true
        }
    );
    return updatedInventory;
}

const updateStock = async (id: string, operation: 'add' | 'subtract' | 'set', quantity: number) => {
    const inventory = await Inventory.findById(id);
    
    if (!inventory) {
        throw new Error(`Inventory item not found: ${id}`);
    }
    
    let newStock: number;
    
    switch (operation) {
        case 'add':
            newStock = inventory.currentStock + quantity;
            break;
        case 'subtract':
            newStock = inventory.currentStock - quantity;
            if (newStock < 0) {
                throw new Error(`Cannot subtract ${quantity} from current stock of ${inventory.currentStock}. Result would be negative.`);
            }
            break;
        case 'set':
            newStock = quantity;
            if (newStock < 0) {
                throw new Error(`Stock cannot be set to a negative value: ${quantity}`);
            }
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }
    
    const updatedInventory = await Inventory.findByIdAndUpdate(
        id,
        { 
            currentStock: newStock,
            updatedAt: new Date()
        },
        { new: true }
    );
    
    // Check if stock fell below threshold and emit WebSocket notification
    if (updatedInventory && updatedInventory.currentStock <= updatedInventory.lowStockThreshold) {
        broadcastLowStockAlert({
            inventoryId: updatedInventory._id,
            name: updatedInventory.name,
            currentStock: updatedInventory.currentStock,
            lowStockThreshold: updatedInventory.lowStockThreshold,
            unit: updatedInventory.unit,
            timestamp: new Date()
        });
    }
    
    return updatedInventory;
}

const deleteInventory = async (id: string) => {
    const deletedInventory = await Inventory.findByIdAndDelete(id);
    return deletedInventory;
}

export default {
    getAllInventory,
    getInventoryById,
    createInventory,
    createManyInventoryItems,
    updateInventory,
    updateStock,
    deleteInventory,
    checkStockAvailability,
    deductStock,
    restoreStock,
    validateStockForItems,
    getLowStockItems
}