import z from 'zod'

export enum Unit {
    
    // Weight units
    GRAMS = 'grams',
    KILOGRAMS = 'kilograms',
    POUNDS = 'pounds',
    OUNCES = 'ounces',
    
    // Count units
    PIECES = 'pieces',
    DOZEN = 'dozen',
    
    // Volume units
    LITERS = 'liters',
    MILLILITERS = 'milliliters',
    
    // Package units
    BOXES = 'boxes',
    BAGS = 'bags',
    TRAYS = 'trays',
    CONTAINERS = 'containers'
}

export interface Inventory {
    id: string,
    name: string,
    unit: Unit,
    currentStock: number,
    lowStockThreshold: number
}

export const NewInventorySchema = z.object({
    id: z.string(),
    name: z.string(),
    unit: z.enum(Unit),
    currentStock: z.number(),
    lowStockThreshold: z.number()
})

export type newInventory = z.infer<typeof NewInventorySchema>;

export const UpdateInventorySchema = z.object({
    name: z.string().optional(),
    unit: z.enum(Unit).optional(),
    currentStock: z.number().optional(),
    lowStockThreshold: z.number().optional()
})

export const UpdateStockSchema = z.object({
    quantity: z.number(),
    operation: z.enum(['add', 'subtract', 'set'])
})

export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;

export const toNewInventory = (object: unknown): newInventory => {
    return NewInventorySchema.parse(object)
}

export const toUpdateInventory = (object: unknown): UpdateInventoryInput => {
    return UpdateInventorySchema.parse(object)
}

export const toUpdateStock = (object: unknown): UpdateStockInput => {
    return UpdateStockSchema.parse(object)
}