# Learningmate

![alt text](./README/images/image.png)

**🔗 Demo**: [https://learningmate.cloud](https://learningmate.cloud)

## 프로젝트 설명

경제 용어 학습을 돕는 AI 기반 학습 플랫폼입니다. 매일 새로운 경제 용어와 관련 학습 컨텐츠(동영상, AI 생성 아티클, 퀴즈)를 제공하여 경제 지식을 체계적으로 쌓을 수 있도록 돕습니다.

**개발 기간**: 2025.8월 ~ 2025.11월

**팀 구성**: 3명

해당 프로젝트는 기존 3인 팀으로 개발했던 Spring Boot 코드를 기반으로 마이그레이션 한 프로젝트이며, NestJS로의 마이그레이션 및 기능 확장은 모두 혼자서 진행했습니다.

## 서버 아키텍처

![alt text](./README/images/architecture.png)

### Application Server

- NestJS기반 RESTful API 서버
- JWT 기반 인증/인가 구현

### Database

- **MySQL**: 메인 데이터베이스
- **Redis**:
  - Refresh Token 저장
  - 데이터 캐싱
  - 메시지 큐 (BullMQ)

### Worker Processor

- Redis Queue 기반 비동기 배치 작업 처리

### Nginx

- Reverse Proxy - API 요청을 NestJS로 전달
- Web Server - React 정적 파일 서빙
- SSL Termination Point - HTTPS 암호화 처리

### AWS S3 & AWS CloudFront

- 객체 스토리지
- CDN

## 기술 스택

- **Backend**: NestJS, TypeScript, Prisma, Passport.js, Zod, Swagger
- **Database**: MySQL, Redis
- **Worker**: BullMQ, cheerio
- **External APIs**: Brave Search API, LLM API
- **Infrastructure**: Nginx, Docker, AWS EC2, AWS ECR, AWS S3

## 프로젝트 구조

```text
src/
├── core/                      # 핵심 공통 기능
│   ├── config/               # 환경 변수 검증 등 설정
│   ├── constants/            # 상수 정의
│   ├── types/                # 공통 타입 정의
│   ├── api-response/         # API 응답 포맷
│   ├── exception/            # 예외 처리
│   ├── infrastructure/       # 인프라 레이어
│   │   ├── ai/              # LLM API 통합
│   │   ├── io-redis/        # Redis 클라이언트
│   │   ├── prisma-module/   # Prisma ORM
│   │   ├── s3/              # AWS S3
│   │   ├── email/           # 이메일 서비스
│   │   └── cookie/          # 쿠키 관리
│   ├── pipes/                # 검증 파이프
│   ├── interceptors/         # 인터셉터
│   └── resources/            # 리소스 (프롬프트, 이메일 템플릿)
├── features/                  # 기능별 모듈
│   ├── admin/               # 관리자 및 배치 작업
│   ├── article/             # 뉴스 아티클
│   ├── auth/                # 인증/인가
│   ├── keyword/             # 경제 키워드
│   ├── member/              # 회원 관리
│   ├── quiz/                # 퀴즈
│   ├── review/              # 학습 리뷰
│   ├── statistic/           # 통계
│   ├── study/               # 학습 기록
│   └── video/               # 유튜브 영상
├── app.module.ts             # 루트 모듈
└── main.ts                   # 애플리케이션 진입점
```

## 주요 기능

### 학습 기능

- **일일 경제 키워드 제공**: 매일 새로운 경제 용어와 설명을 제공
- **다양한 학습 컨텐츠**: 키워드 관련 유튜브 영상, AI 생성 뉴스 아티클 제공
- **인터랙티브 퀴즈**: 학습한 내용을 확인할 수 있는 퀴즈 시스템
- **학습 리뷰 작성**: 학습한 키워드에 대한 개인 리뷰 작성

### 회원 기능

- **회원가입/로그인**: JWT 기반 인증 시스템
- **학습 기록 추적**: 개인별 학습 진도 및 히스토리 관리
- **학습 통계**: 학습 달성률, 진행 상황 시각화

### 관리자 기능

- **컨텐츠 관리**: 경제 키워드, 아티클, 퀴즈 관리
- **배치 작업**: 일일 컨텐츠 생성

## 주요 기술적 의사 결정

### Redis를 활용한 성능 최적화

- 동일한 키워드, 아티클 그리고 키워드에 대한 반복적인 DB 조회를 줄이고자 Redis 캐시를 적용해 동일한 데이터에 대한 반복적인 조회를 감소시켰습니다.
- 아티클 및 퀴즈를 생성하는 배치 작업을 메인 API 서버와 같은 프로세스에서 실행시킬 시 Node.js는 싱글 스레드인 관계로 작업하는 동안 API 서버 성능 저하 문제를 일으킬 수 있다고 판단했습니다. 따라서 BullMQ 라이브러리를 사용해 배치 작업을 별도의 프로세스에서 비동기로 실행하게 함으로써 배치 작업 기간 동안의 API 서버 성능 저하를 감소시켰습니다.

###
