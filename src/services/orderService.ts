import Order from "../models/order.model";
import Recipe from "../models/recipe.model";
import Menu from "../models/menu.model";
import inventoryService from "./inventoryService";
import { CreateOrderInput, UpdateOrderInput, UpdateOrderItemsInput, OrderQueryInput, OrderStatus, OrderItem } from "../utils/validations/order.schema";

interface RequiredIngredient {
    inventoryId: string;
    quantity: number;
}

const getAllOrders = async (query?: OrderQueryInput) => {
    const filter: any = {};
    
    if (query?.userId) {
        filter.userId = query.userId;
    }
    
    if (query?.status) {
        filter.status = query.status;
    }
    
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(filter)
        .sort({ orderTime: -1 })
        .skip(skip)
        .limit(limit);
    
    const total = await Order.countDocuments(filter);
    
    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const getOrderById = async (id: string) => {
    const order = await Order.findById(id);
    return order;
};

const validateMenuItemsAndCalculatePrice = async (items: OrderItem[]): Promise<{ validItems: OrderItem[], totalPrice: number, errors: string[] }> => {
    const validItems: OrderItem[] = [];
    const errors: string[] = [];
    let totalPrice = 0;
    
    for (const item of items) {
        const menuItem = await Menu.findById(item.menuItemId);
        
        if (!menuItem) {
            errors.push(`Menu item not found: ${item.menuItemId}`);
            continue;
        }
        
        if (!menuItem.isAvailable) {
            errors.push(`Menu item '${menuItem.name}' is currently unavailable`);
            continue;
        }
        
        // Calculate actual price (menu price × quantity)
        const calculatedPrice = menuItem.price * item.quantity;
        totalPrice += calculatedPrice;
        
        validItems.push({
            ...item,
            name: menuItem.name,
            price: calculatedPrice
        });
    }
    
    return { validItems, totalPrice, errors };
};

const getRequiredIngredientsForOrder = async (items: OrderItem[]): Promise<RequiredIngredient[]> => {
    const requiredIngredients: Map<string, number> = new Map();
    
    for (const item of items) {
        const recipe = await Recipe.findOne({ menuItemId: item.menuItemId });
        
        if (!recipe) {
            throw new Error(`Recipe not found for menu item: ${item.menuItemId}`);
        }
        
        for (const ingredient of recipe.ingredientsUsed) {
            const totalRequired = ingredient.quantityUsed * item.quantity;
            const currentRequired = requiredIngredients.get(ingredient.inventoryId) || 0;
            requiredIngredients.set(ingredient.inventoryId, currentRequired + totalRequired);
        }
    }
    
    return Array.from(requiredIngredients.entries()).map(([inventoryId, quantity]) => ({
        inventoryId,
        quantity
    }));
};

const createOrder = async (orderData: CreateOrderInput) => {
    // Validate menu items and calculate correct pricing
    const { validItems, totalPrice, errors } = await validateMenuItemsAndCalculatePrice(orderData.items);
    
    if (errors.length > 0) {
        throw new Error(`Order validation failed: ${errors.join(', ')}`);
    }
    
    // Get required ingredients for all items
    const requiredIngredients = await getRequiredIngredientsForOrder(validItems);
    
    // Validate stock availability (but don't deduct yet)
    const stockErrors = await inventoryService.validateStockForItems(requiredIngredients);
    
    if (stockErrors.length > 0) {
        const errorMessages = stockErrors.map(error => 
            `${error.name}: Required ${error.required}, Available ${error.available}`
        );
        throw new Error(`Insufficient stock for order: ${errorMessages.join(', ')}`);
    }
    
    // Create order with validated items and calculated total
    const order = new Order({
        ...orderData,
        items: validItems,
        totalPrice,
        status: OrderStatus.PENDING
    });
    
    const savedOrder = await order.save();
    return savedOrder;
};

const updateOrderStatus = async (id: string, updateData: UpdateOrderInput) => {
    const order = await Order.findById(id);
    
    if (!order) {
        throw new Error('Order not found');
    }
    
    // Check if order can be cancelled
    if (updateData.status === OrderStatus.CANCELLED && order.status === OrderStatus.PREPARING) {
        throw new Error('Cannot cancel order that is already being prepared');
    }
    
    const previousStatus = order.status;
    
    // If changing to PREPARING status, deduct inventory
    if (updateData.status === OrderStatus.PREPARING && previousStatus !== OrderStatus.PREPARING) {
        const requiredIngredients = await getRequiredIngredientsForOrder(order.items.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || undefined
        })));
        
        // Validate stock again before deduction
        const stockErrors = await inventoryService.validateStockForItems(requiredIngredients);
        if (stockErrors.length > 0) {
            const errorMessages = stockErrors.map(error => 
                `${error.name}: Required ${error.required}, Available ${error.available}`
            );
            throw new Error(`Cannot prepare order - Insufficient stock: ${errorMessages.join(', ')}`);
        }
        
        // Deduct inventory
        for (const ingredient of requiredIngredients) {
            await inventoryService.deductStock(ingredient.inventoryId, ingredient.quantity);
        }
    }
    
    // If cancelling from a status before PREPARING, restore inventory if it was deducted
    if (updateData.status === OrderStatus.CANCELLED && previousStatus === OrderStatus.PREPARING) {
        const requiredIngredients = await getRequiredIngredientsForOrder(order.items.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || undefined
        })));
        
        // Restore inventory
        for (const ingredient of requiredIngredients) {
            await inventoryService.restoreStock(ingredient.inventoryId, ingredient.quantity);
        }
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { 
            status: updateData.status,
            updatedAt: new Date()
        },
        { new: true }
    );
    
    return updatedOrder;
};

const updateOrderItems = async (id: string, updateData: UpdateOrderItemsInput) => {
    const order = await Order.findById(id);
    
    if (!order) {
        throw new Error('Order not found');
    }
    
    // Check if order can be modified
    if (order.status === OrderStatus.CONFIRMED || 
        order.status === OrderStatus.PREPARING || 
        order.status === OrderStatus.DELIVERED || 
        order.status === OrderStatus.CANCELLED) {
        throw new Error(`Cannot modify items for order with status: ${order.status}`);
    }
    
    // Validate new menu items and calculate pricing
    const { validItems, totalPrice, errors } = await validateMenuItemsAndCalculatePrice(updateData.items);
    
    if (errors.length > 0) {
        throw new Error(`Order update validation failed: ${errors.join(', ')}`);
    }
    
    // Get required ingredients for new items
    const requiredIngredients = await getRequiredIngredientsForOrder(validItems);
    
    // Validate stock availability for new items
    const stockErrors = await inventoryService.validateStockForItems(requiredIngredients);
    
    if (stockErrors.length > 0) {
        const errorMessages = stockErrors.map(error => 
            `${error.name}: Required ${error.required}, Available ${error.available}`
        );
        throw new Error(`Insufficient stock for updated order: ${errorMessages.join(', ')}`);
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
            items: validItems,
            totalPrice,
            updatedAt: new Date()
        },
        { new: true }
    );
    
    return updatedOrder;
};

const deleteOrder = async (id: string) => {
    const order = await Order.findById(id);
    
    if (!order) {
        throw new Error('Order not found');
    }
    
    // Check if order can be deleted
    if (order.status === OrderStatus.PREPARING || order.status === OrderStatus.DELIVERED) {
        throw new Error(`Cannot delete order with status: ${order.status}`);
    }
    
    // Note: If we reach this point, the order is not in PREPARING or DELIVERED status,
    // so no inventory restoration is needed for deletion
    
    const deletedOrder = await Order.findByIdAndDelete(id);
    return deletedOrder;
};

export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateOrderItems,
    deleteOrder,
    validateMenuItemsAndCalculatePrice,
    getRequiredIngredientsForOrder
};
