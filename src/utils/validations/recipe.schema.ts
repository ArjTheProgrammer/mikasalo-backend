import z from 'zod'

export interface IngredientUsed {
    inventoryId: number,
    quantityUsed: number
}

export interface Recipe {
    id: number,
    menuItemId: number,
    ingredientsUsed: IngredientUsed[]
}

export const IngredientUsedSchema = z.object({
    inventoryId: z.number(),
    quantityUsed: z.number()
})

export const NewRecipeSchema = z.object({
    menuItemId: z.number(),
    ingredientsUsed: z.array(IngredientUsedSchema)
})

export type newRecipe = z.infer<typeof NewRecipeSchema>;

export const toNewRecipe = (object: unknown): newRecipe => {
    return NewRecipeSchema.parse(object)
}