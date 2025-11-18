import z from 'zod'

export enum Category {
    Pasta = 'pasta',
    Buger = 'burger',
    Dessert = 'dessert'
}

export interface MenuItem {
    id: number,
    name: string,
    description: string,
    price: number,
    category: Category
}

export const NewMenuSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.enum(Category)
})

export type newMenu = z.infer<typeof NewMenuSchema>;

export const toNewUser = (object: unknown): newMenu => {
    return NewMenuSchema.parse(object)
}