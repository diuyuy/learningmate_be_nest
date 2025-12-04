FROM node:22-alpine AS builder

WORKDIR /app

# Corepack 활성화
RUN corepack enable

RUN corepack prepare yarn@latest --activate

# 의존성 파일 복사
COPY package.json yarn.lock .yarnrc.yml ./

# 의존성 설치
RUN yarn install --immutable

# 소스 코드 복사
COPY . .

# 임시 환경 변수 추가
ENV DATABASE_URL="mysql://user:password@localhost:3306/dummydb"

# prisma generate
RUN yarn db:gen

# NestJS 빌드
RUN yarn build

# =============================================
# 2. 배포 단계 (Production Stage)
# =============================================
FROM node:22-alpine AS production

WORKDIR /app

# Corepack 활성화
RUN corepack enable

RUN corepack prepare yarn@latest --activate

# package 파일 복사
COPY package.json yarn.lock .yarnrc.yml ./

# Prisma schema 파일 복사
COPY --from=builder /app/prisma ./prisma

# 프로덕션 의존성 설치
RUN yarn workspaces focus --production

# 빌더에서 생성된 파일들 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

# 비-root 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

# 비-root 사용자로 전환
USER nestjs

# 포트 노출 (애플리케이션 포트에 맞게 조정)
EXPOSE 8080

# 애플리케이션 실행
CMD ["node", "dist/src/main.js"]