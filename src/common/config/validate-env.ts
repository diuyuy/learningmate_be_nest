import z from 'zod';
import { ENV_KEYS } from '../constants/env-keys';

export const envSchema = z.object({
  [ENV_KEYS.AUTH_SECRET]: z.string().nonempty(),
  [ENV_KEYS.AUTH_EXPIRATION_MILLS]: z.string().nonempty(),
  [ENV_KEYS.AUTH_BASE_URL]: z.string().nonempty(),
  [ENV_KEYS.AUTH_PASSWORD_RESET_URL]: z.string().nonempty(),
  [ENV_KEYS.AUTH_GOOGLE_CLIENT_ID]: z.string().nonempty(),
  [ENV_KEYS.AUTH_GOOGLE_SECRET]: z.string().nonempty(),
  [ENV_KEYS.AUTH_GOOGLE_REDIRECT_URL]: z.string().nonempty(),
  [ENV_KEYS.AUTH_COOKIE_SAME_SITE]: z.string().nonempty(),
});

export const validateEnv = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) throw new Error(result.error.message);

  return result.data;
};
