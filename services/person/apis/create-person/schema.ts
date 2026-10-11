import { z } from 'zod';

export const CreatePersonRequest = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phoneNumber: z.e164(),
  address: z.object({
    street: z.string().trim().min(1).max(200),
    houseNumber: z.string().trim().min(1).max(20),
    postalCode: z.string().trim().min(1).max(20),
    city: z.string().trim().min(1).max(100),
    country: z.string().trim().length(2).toUpperCase(),
  }),
}) ;

export type CreatePersonRequest = z.infer<typeof CreatePersonRequest>;
