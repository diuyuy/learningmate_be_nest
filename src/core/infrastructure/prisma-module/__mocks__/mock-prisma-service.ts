import { PrismaClient } from 'generated/prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

export type MockPrisma = DeepMockProxy<PrismaClient>;

export const createMockPrisma = (): MockPrisma => mockDeep<PrismaClient>();
