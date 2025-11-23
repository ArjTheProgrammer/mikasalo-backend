import z from 'zod'

export interface IngredientUsed {
    inventoryId: string,
    quantityUsed: number
}

export interface Recipe {
    id: string,
    menuItemId: string,
    ingredientsUsed: IngredientUsed[],
    createdAt?: Date,
    updatedAt?: Date
}

export const IngredientUsedSchema = z.object({
    inventoryId: z.string(),
    quantityUsed: z.number()
})

export const NewRecipeSchema = z.object({
    id: z.string(),
    menuItemId: z.string(),
    ingredientsUsed: z.array(IngredientUsedSchema)
})

export type newRecipe = z.infer<typeof NewRecipeSchema>;

export const toNewRecipe = (object: unknown): newRecipe => {
    return NewRecipeSchema.parse(object)
}