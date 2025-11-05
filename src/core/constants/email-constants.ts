export const HTML_PATH = {
  AUTH_CODE_EMAIL: 'src/core/resources/templates/auth-code-email.html',
  PASSWD_RESET: 'src/core/resources/templates/passwd-reset-email.html',
} as const;

export const EMAIL_SUBJECT = {
  VALIDATE_AUTH_CODE: 'Learning Mate 이메일 인증',
  PASSWORD_RESET: 'Learning Mate 비밀번호 변경',
} as const;
