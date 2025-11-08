# Learningmate

![alt text](./README/images/image.png)

**🔗 Demo**: [https://learningmate.cloud](https://learningmate.cloud)

## 프로젝트 설명

경제 용어 학습을 돕는 AI 기반 학습 플랫폼입니다. 매일 새로운 경제 용어와 관련 학습 컨텐츠(동영상, AI 생성 아티클, 퀴즈)를 제공하여 경제 지식을 체계적으로 쌓을 수 있도록 돕습니다.

**개발 기간**: 2025.8월 ~ 2025.11월

**팀 구성**: 3명

해당 프로젝트는 기존 Spring boot로 작성되었던 코드를 NestJS로 마이그레이션 및 발전시킨 프로젝트 입니다. 작업은 혼자서 진행했습니다.

## 서버 아키텍처

![alt text](./README/images/architecture.png)

### Application Server

- NestJS기반 RESTful API 서버
- JWT 기반 인증/인가 구현

### Database

- **MySQL**: 메인 데이터베이스
- **Redis**: Refresh Token 저장 및 배치 작업 메시지 큐

### Worker Processor

- Redis Queue 기반 비동기 배치 작업 처리
- 대용량 데이터 처리 작업을 백그라운드로 분리하여 API 응답 속도 개선

### Nginx

- Reverse Proxy - API 요청을 NestJS로 전달
- Web Server - React 정적 파일 서빙
- SSL Termination Point - HTTPS 암호화 처리

## 기술 스택

- **Backend**: NestJS, TypeScript, Prisma, Passport.js, Zod
- **Database**: MySQL, Redis
- **Worker**: BullMQ, cheerio
- **External APIs**: Brave Search API, LLM API
- **Infrastructure**: Nginx, Docker, AWS EC2, AWS ECR, AWS S3

## 프로젝트 구조

## 주요 기능

## 주요 개선 사항
