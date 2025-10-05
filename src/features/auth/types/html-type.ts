import { HTML_PATH } from 'src/common/constants/email-constants';

export type HtmlType =
  | {
      filename: typeof HTML_PATH.AUTH_CODE_EMAIL;
      values: {
        authCode: string;
      };
    }
  | {
      filename: typeof HTML_PATH.PASSWD_RESET;
      values: {
        redirectUrl: string;
      };
    };
