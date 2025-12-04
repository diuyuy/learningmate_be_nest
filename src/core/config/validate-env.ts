import z from 'zod';
import { ENV_KEYS } from '../constants/env-keys';

export type EnvSchema = z.infer<typeof envSchema>;

export const envSchema = z.object({
  [ENV_KEYS.DATABASE_HOST]: z.string().nonempty(),
  [ENV_KEYS.DATABASE_PORT]: z.string().nonempty(),
  [ENV_KEYS.DATABASE_USER]: z.string().nonempty(),
  [ENV_KEYS.DATABASE_PASSWORD]: z.string().nonempty(),
  [ENV_KEYS.DATABASE_NAME]: z.string().nonempty(),
  //AUTH
  [ENV_KEYS.AUTH_SECRET]: z.string().nonempty(),
  [ENV_KEYS.AUTH_EXPIRATION_MILLS]: z.string().nonempty(),
  [ENV_KEYS.AUTH_REFRESH_TOKEN_EXPIRATION_DAYS]: z.string().nonempty(),
  [ENV_KEYS.AUTH_BASE_URL]: z.string().nonempty(),
  [ENV_KEYS.AUTH_PASSWORD_RESET_URL]: z.string().nonempty(),
  [ENV_KEYS.AUTH_GOOGLE_CLIENT_ID]: z.string().nonempty(),
  [ENV_KEYS.AUTH_GOOGLE_SECRET]: z.string().nonempty(),
  [ENV_KEYS.AUTH_GOOGLE_REDIRECT_URL]: z.string().nonempty(),
  [ENV_KEYS.AUTH_COOKIE_SAME_SITE]: z.union([
    z.literal('none'),
    z.literal('lax'),
  ]),
  [ENV_KEYS.EMAIL_GOOGLE_ID]: z.string().nonempty(),
  [ENV_KEYS.EMAIL_GOOGLE_APP_PASSWD]: z.string().nonempty(),
  [ENV_KEYS.REDIS_HOST]: z.string().nonempty(),
  [ENV_KEYS.REDIS_PORT]: z.string().nonempty(),
  [ENV_KEYS.EMAIL_RESET_PASSWD_REDIRECT_URL]: z.string().nonempty(),
  [ENV_KEYS.AWS_REGION]: z.string().nonempty(),
  [ENV_KEYS.AWS_ACCESS_KEY_ID]: z.string().nonempty(),
  [ENV_KEYS.AWS_SECRET_ACCESS_KEY]: z.string().nonempty(),
  [ENV_KEYS.AWS_S3_BUCKET]: z.string().nonempty(),
  [ENV_KEYS.CLOUDFRONT_DOMAIN]: z.string().nonempty(),
  [ENV_KEYS.AUTH_NAVER_CLIENT_ID]: z.string().nonempty(),
  [ENV_KEYS.AUTH_NAVER_SECRET]: z.string().nonempty(),
  [ENV_KEYS.AUTH_NAVER_REDIRECT_URL]: z.string().nonempty(),
  [ENV_KEYS.AUTH_KAKAO_CLIENT_ID]: z.string().nonempty(),
  [ENV_KEYS.AUTH_KAKAO_SECRET]: z.string().nonempty(),
  [ENV_KEYS.AUTH_KAKAO_REDIRECT_URL]: z.string().nonempty(),
});

export const validateEnv = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) throw new Error(result.error.message);

  return result.data;
};
