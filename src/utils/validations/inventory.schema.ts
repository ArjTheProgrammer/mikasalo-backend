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
    id: number,
    name: string,
    unit: Unit,
    currentStock: number,
    lowStockThreshold: number
}

export const NewInventorySchema = z.object({
    name: z.string(),
    unit: z.enum(Unit),
    currentStock: z.number(),
    lowStockThreshold: z.number()
})

export type newInventory = z.infer<typeof NewInventorySchema>;

export const toNewInventory = (object: unknown): newInventory => {
    return NewInventorySchema.parse(object)
}