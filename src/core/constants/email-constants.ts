import { join } from 'path';

const templatesDir = join(__dirname, '..', 'resources', 'templates');

export const HTML_PATH = {
  AUTH_CODE_EMAIL: join(templatesDir, 'auth-code-email.html'),
  PASSWD_RESET: join(templatesDir, 'passwd-reset-email.html'),
} as const;

export const EMAIL_SUBJECT = {
  VALIDATE_AUTH_CODE: 'Learning Mate 이메일 인증',
  PASSWORD_RESET: 'Learning Mate 비밀번호 변경',
} as const;
