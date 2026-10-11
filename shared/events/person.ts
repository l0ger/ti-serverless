import { z } from 'zod';

export const PERSON_CREATED_EVENT = 'person-created-event';

export const PersonCreatedEvent = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  address: z.object({
    street: z.string(),
    houseNumber: z.string(),
    postalCode: z.string(),
    city: z.string(),
    country: z.string(),
  }),
});

export type PersonCreatedEvent = z.infer<typeof PersonCreatedEvent>;

export const personEvents = {
  [PERSON_CREATED_EVENT]: PersonCreatedEvent,
} as const;

export type PersonEvents = { [TName in keyof typeof personEvents]: z.infer<(typeof personEvents)[TName]> };
