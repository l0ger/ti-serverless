import { z } from 'zod';

// Runtime environment schema
export const PersonEnvironment = z.object({
  TABLE_NAME: z.string().min(1),
  PLATFORM_EVENT_BUS_NAME: z.string().min(1),
  SERVICE_NAME: z.string().min(1),
});

export type PersonEnvironment = z.infer<typeof PersonEnvironment>;
