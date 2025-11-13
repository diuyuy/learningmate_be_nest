/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { CookieService } from './cookie.service';

describe('CookieService', () => {
  let cookieService: CookieService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        CookieService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    cookieService = moduleRef.get(CookieService);
    configService = moduleRef.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined.', () => {
    expect(cookieService).toBeDefined();
  });

  describe('getAccessTokenCookieOption', () => {
    it('should return correct cookie options for access token', () => {
      const authExpirationMillis = 3600000; // 1 hour
      const sameSite = 'lax' as const;

      configService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_EXPIRATION_MILLS') return authExpirationMillis;
        if (key === 'AUTH_COOKIE_SAME_SITE') return sameSite;
        return undefined;
      });

      const result = cookieService.getAccessTokenCookieOption();

      expect(result).toEqual({
        httpOnly: true,
        secure: true,
        maxAge: authExpirationMillis,
        sameSite: sameSite,
      });
      expect(configService.get).toHaveBeenCalledWith('AUTH_EXPIRATION_MILLS');
      expect(configService.get).toHaveBeenCalledWith('AUTH_COOKIE_SAME_SITE');
    });
  });

  describe('getRefreshTokenCookieOption', () => {
    it('should return correct cookie options for refresh token', () => {
      const expirationDays = 7;
      const sameSite = 'lax' as const;

      configService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_REFRESH_TOKEN_EXPIRATION_DAYS') return expirationDays;
        if (key === 'AUTH_COOKIE_SAME_SITE') return sameSite;
        return undefined;
      });

      const beforeCallTime = new Date();
      const result = cookieService.getRefreshTokenCookieOption();
      const afterCallTime = new Date();

      expect(result.httpOnly).toBe(true);
      expect(result.secure).toBe(true);
      expect(result.sameSite).toBe(sameSite);
      expect(result.expires).toBeDefined();

      const expectedMinDate = new Date(beforeCallTime);
      expectedMinDate.setDate(expectedMinDate.getDate() + expirationDays);
      const expectedMaxDate = new Date(afterCallTime);
      expectedMaxDate.setDate(expectedMaxDate.getDate() + expirationDays);

      expect(result.expires!.getTime()).toBeGreaterThanOrEqual(
        expectedMinDate.getTime(),
      );
      expect(result.expires!.getTime()).toBeLessThanOrEqual(
        expectedMaxDate.getTime(),
      );

      expect(configService.get).toHaveBeenCalledWith(
        'AUTH_REFRESH_TOKEN_EXPIRATION_DAYS',
      );
      expect(configService.get).toHaveBeenCalledWith('AUTH_COOKIE_SAME_SITE');
    });

    it('should calculate correct expiration date', () => {
      const expirationDays = 30;
      const sameSite = 'none' as const;

      configService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_REFRESH_TOKEN_EXPIRATION_DAYS') return expirationDays;
        if (key === 'AUTH_COOKIE_SAME_SITE') return sameSite;
        return undefined;
      });

      const now = new Date();
      const result = cookieService.getRefreshTokenCookieOption();

      const daysDifference = Math.floor(
        (result.expires!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      expect(daysDifference).toBeGreaterThanOrEqual(expirationDays - 1);
      expect(daysDifference).toBeLessThanOrEqual(expirationDays);
    });
  });

  describe('getSignOutOptions', () => {
    it('should return correct cookie options for sign out', () => {
      const sameSite = 'lax' as const;

      configService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_COOKIE_SAME_SITE') return sameSite;
        return undefined;
      });

      const result = cookieService.getSignOutOptions();

      expect(result).toEqual({
        httpOnly: true,
        secure: true,
        maxAge: 0,
        sameSite: sameSite,
      });
      expect(configService.get).toHaveBeenCalledWith('AUTH_COOKIE_SAME_SITE');
    });

    it('should have maxAge of 0 to clear the cookie', () => {
      const sameSite = 'none' as const;

      configService.get.mockImplementation((key: string) => {
        if (key === 'AUTH_COOKIE_SAME_SITE') return sameSite;
        return undefined;
      });

      const result = cookieService.getSignOutOptions();

      expect(result.maxAge).toBe(0);
    });
  });
});
