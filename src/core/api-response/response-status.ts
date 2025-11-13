import { HttpStatus } from '@nestjs/common';

export enum ResponseCode {
  OK = 'OK',
  CREATED = 'CREATED',
  MEMBER_CREATED = 'MEMBER_CREATED',
  REVIEW_CREATED = 'REVIEW_CREATED',

  // 400 Bad Request
  BAD_REQUEST = 'BAD_REQUEST',
  AUTH_CODE_INVALID = 'AUTH_CODE_INVALID',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  DUPLICATE_NICKNAME = 'DUPLICATE_NICKNAME',
  FILE_NAME_NOT_EXISTS = 'FILE_NAME_NOT_EXISTS',
  INVALID_FILE_EXTENSION = 'INVALID_FILE_EXTENSION',
  PROFILE_IMG_TOO_BIG = 'PROFILE_IMG_TOO_BIG',
  INVALID_MEMBER_ID = 'INVALID_MEMBER_ID',
  REQUEST_ID_TYPE_INVALID = 'REQUEST_ID_TYPE_INVALID',
  INVALID_MONTH_VALUE = 'INVALID_MONTH_VALUE',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_IMAGE = 'INAVLID_IMAGE',

  // 401 Unauthorized
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  INVALID_PIN = 'INVALID_PIN',
  INVALID_AUTH_FORMAT = 'INVALID_AUTH_FORMAT',
  INVALID_TOKEN = 'INVALID_TOKEN',
  ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
  GOOGLE_OAUTH_FAILURE = 'GOOGLE_OAUTH_FAILURE',
  NAVER_OAUTH_FAILURE = 'NAVER_OAUTH_FAILURE',
  KAKAO_OAUTH_FAILURE = 'KAKAO_OAUTH_FAILURE',

  // 403 Forbidden
  FORBIDDEN = 'FORBIDDEN',

  // 404 Not Found
  NOT_FOUND = 'NOT_FOUND',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  ARTICLE_NOT_FOUND = 'ARTICLE_NOT_FOUND',
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  KEYWORD_NOT_FOUND = 'KEYWORD_NOT_FOUND',
  KEYWORD_LIST_NOT_FOUND = 'KEYWORD_LIST_NOT_FOUND',
  QUIZ_LIST_NOT_FOUND = 'QUIZ_LIST_NOT_FOUND',
  VIDEO_BY_KEYWORD_ID_NOT_FOUND = 'VIDEO_BY_KEYWORD_ID_NOT_FOUND',
  QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
  ARTICLE_BY_KEYWORD_ID_NOT_FOUND = 'ARTICLE_BY_KEYWORD_ID_NOT_FOUND',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  TERM_NOT_FOUND = 'TERM_NOT_FOUND',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',

  // 409 Conflict
  DUPLICATE_REVIEW = 'DUPLICATE_REVIEW',

  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SEND_EMAIL_FAIL = 'SEND_EMAIL_FAIL',
  LOAD_IMAGE_FAIL = 'LOAD_IMAGE_FAIL',
  SAVE_IMAGE_FAIL = 'SAVE_IMAGE_FAIL',
  DELETE_IMAGE_FAIL = 'DELETE_IMAGE_FAIL',
  CREATE_JOB_FAIL = 'CREATE_JOB_FAIL',
}

export class ResponseStatus {
  readonly status: number;
  readonly message: string;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
  }
}

export class ResponseStatusFactory {
  private static readonly statusMap = {
    [ResponseCode.OK]: {
      status: HttpStatus.OK,
      message: '요청이 성공적으로 처리되었습니다.',
    },

    [ResponseCode.CREATED]: {
      status: HttpStatus.CREATED,
      message: '요청이 성공적으로 처리되었습니다.',
    },

    [ResponseCode.MEMBER_CREATED]: {
      status: HttpStatus.CREATED,
      message: '회원가입이 성공적으로 완료되었습니다.',
    },

    [ResponseCode.REVIEW_CREATED]: {
      status: HttpStatus.CREATED,
      message: '리뷰가 성공적으로 작성되었습니다.',
    },

    // 400 Bad Request
    [ResponseCode.BAD_REQUEST]: {
      status: HttpStatus.BAD_REQUEST,
      message: '잘못된 요청 형식입니다.',
    },

    [ResponseCode.AUTH_CODE_INVALID]: {
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 인증코드 입니다.',
    },

    [ResponseCode.AUTH_TOKEN_INVALID]: {
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 인증코드 입니다.',
    },
    [ResponseCode.DUPLICATE_NICKNAME]: {
      status: HttpStatus.BAD_REQUEST,
      message: '중복된 닉네임 입니다.',
    },
    [ResponseCode.FILE_NAME_NOT_EXISTS]: {
      status: HttpStatus.BAD_REQUEST,
      message: '파일명이 존재하지 않습니다.',
    },
    [ResponseCode.INVALID_FILE_EXTENSION]: {
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 파일 확장자 입니다.',
    },
    [ResponseCode.PROFILE_IMG_TOO_BIG]: {
      status: HttpStatus.BAD_REQUEST,
      message: '프로필 이미지의 사이즈는 1MB 보다 작아야 합니다.',
    },
    [ResponseCode.INVALID_MEMBER_ID]: {
      status: HttpStatus.BAD_REQUEST,
      message: '해당 아이디를 가진 사용자가 존재하지 않습니다.',
    },

    [ResponseCode.REQUEST_ID_TYPE_INVALID]: {
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 ID 타입입니다.',
    },

    [ResponseCode.INVALID_MONTH_VALUE]: {
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 달 입니다.',
    },

    [ResponseCode.INVALID_EMAIL]: {
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 이메일 형식입니다.',
    },

    [ResponseCode.INVALID_IMAGE]: {
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 이미지 형식입니다.',
    },

    // 401 Unauthorized
    [ResponseCode.UNAUTHORIZED]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '인증이 필요합니다.',
    },
    [ResponseCode.INVALID_PASSWORD]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '비밀번호가 올바르지 않습니다.',
    },
    [ResponseCode.INVALID_REFRESH_TOKEN]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '유효하지 않은 Refresh Token입니다.',
    },
    [ResponseCode.INVALID_PIN]: {
      status: HttpStatus.UNAUTHORIZED,
      message: 'PIN 번호가 올바르지 않습니다.',
    },
    [ResponseCode.INVALID_AUTH_FORMAT]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '유효하지 않은 인증 요청 형식입니다.',
    },
    [ResponseCode.INVALID_TOKEN]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '유효하지 않은 토큰입니다.',
    },
    [ResponseCode.ACCESS_TOKEN_EXPIRED]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '액세스 토큰이 만료 됐습니다.',
    },
    [ResponseCode.GOOGLE_OAUTH_FAILURE]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '구글 로그인 인증이 실패했습니다.',
    },
    [ResponseCode.NAVER_OAUTH_FAILURE]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '네이버 로그인 인증이 실패했습니다.',
    },
    [ResponseCode.KAKAO_OAUTH_FAILURE]: {
      status: HttpStatus.UNAUTHORIZED,
      message: '카카오 로그인 인증이 실패했습니다.',
    },

    // 403 Forbidden
    [ResponseCode.FORBIDDEN]: {
      status: HttpStatus.FORBIDDEN,
      message: '요청 권한이 없습니다.',
    },

    // 404 Not Found
    [ResponseCode.NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '존재하지 않는 자원입니다.',
    },
    [ResponseCode.MEMBER_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '존재하지 않는 회원입니다.',
    },
    [ResponseCode.ARTICLE_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '존재하지 않는 기사입니다.',
    },
    [ResponseCode.REVIEW_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '존재하지 않는 리뷰입니다.',
    },
    [ResponseCode.KEYWORD_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '존재하지 않는 키워드입니다.',
    },
    [ResponseCode.KEYWORD_LIST_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '해당 기간의 키워드가 존재하지 않습니다.',
    },
    [ResponseCode.QUIZ_LIST_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '퀴즈 목록이 존재하지 않습니다.',
    },
    [ResponseCode.VIDEO_BY_KEYWORD_ID_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '해당 키워드와 연관된 영상이 존재하지 않습니다.',
    },
    [ResponseCode.QUIZ_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '퀴즈가 존재하지 않습니다.',
    },
    [ResponseCode.ARTICLE_BY_KEYWORD_ID_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '해당 키워드와 연관된 기사가 존재하지 않습니다.',
    },
    [ResponseCode.EMAIL_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '해당 이메일을 가진 사용자가 존재하지 않습니다.',
    },
    [ResponseCode.CATEGORY_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '존재하지 않는 카테고리 입니다.',
    },
    [ResponseCode.TERM_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '존재하지 않는 용어 입니다.',
    },
    [ResponseCode.JOB_NOT_FOUND]: {
      status: HttpStatus.NOT_FOUND,
      message: '존재하지 않는 배치 작업입니다.',
    },

    // 409 Conflict
    [ResponseCode.DUPLICATE_REVIEW]: {
      status: HttpStatus.CONFLICT,
      message: '기사에 대한 리뷰를 이미 작성했습니다.',
    },

    // 500 Internal Server Error
    [ResponseCode.INTERNAL_SERVER_ERROR]: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버내부 오류입니다.',
    },
    [ResponseCode.SEND_EMAIL_FAIL]: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '이메일 발송을 실패했습니다.',
    },
    [ResponseCode.LOAD_IMAGE_FAIL]: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '이미지 로드를 실패했습니다.',
    },
    [ResponseCode.SAVE_IMAGE_FAIL]: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '이미지 저장을 실패했습니다.',
    },
    [ResponseCode.DELETE_IMAGE_FAIL]: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '이미지 삭제를 실패했습니다.',
    },
    [ResponseCode.CREATE_JOB_FAIL]: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '배치 작업 생성을 실패했습니다.',
    },
  } as const;

  static create(code: ResponseCode, customMessage?: string): ResponseStatus {
    const config = this.statusMap[code];
    return new ResponseStatus(config.status, customMessage ?? config.message);
  }
}
