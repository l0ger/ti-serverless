import type { z } from 'zod';

export function loadEnv<TSchema extends z.ZodType>(schema: TSchema): z.output<TSchema> {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment variables:\n${problems.join('\n')}`);
  }
  return parsed.data;
}
