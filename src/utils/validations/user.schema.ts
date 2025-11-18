import z from 'zod';

export enum Role {
    CUSTOMER = 'customer',
    ADMIN = 'admin',
    COOK = 'cook'
} 

export interface User {
    id: number,
    email: string,
    passwordHash: string,
    name: string,
    phoneNumber: string,
    role: Role
}

export const NewUserSchema = z.object({
    email: z.string(),
    password: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    role: z.enum(Role)
})

export type newUser = z.infer<typeof NewUserSchema>;

export const toNewUser =  (object: unknown): newUser => {
    return NewUserSchema.parse(object)
}