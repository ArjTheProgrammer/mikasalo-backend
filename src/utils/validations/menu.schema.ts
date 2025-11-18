import z from 'zod'

export enum Category {
    Pasta = 'pasta',
    Buger = 'burger',
    Dessert = 'dessert'
}

export interface Menu {
    id: number,
    name: string,
    description: string,
    price: number,
    category: Category,
    imageUrl?: string,
    isAvailable: boolean
}

export const NewMenuSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.enum(Category),
    imageUrl: z.string().optional()
})

export type newMenu = z.infer<typeof NewMenuSchema>;

export const toNewMenu = (object: unknown): newMenu => {
    return NewMenuSchema.parse(object)
}