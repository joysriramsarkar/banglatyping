import 'server-only';
import { z } from 'zod';

/**
 * Validated server-only environment. Importing this module from client
 * code fails at build time thanks to `server-only`.
 * NEVER add a NEXT_PUBLIC_ prefix to these values.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_KEY: z.string().min(20),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function loadServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  });
}

export const serverEnv: ServerEnv = loadServerEnv();
