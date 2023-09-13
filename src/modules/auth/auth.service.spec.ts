import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { sign } from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let badToken: string = '';
  let mockToken: string = '';
  const deleteMock = jest.fn();
  const setMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            getOrThrow: jest.fn((arg) => {
              if (arg === 'JWT_SECRET') return 'jwt_secret';
              return '5h';
            }),
          };
        }

        if (token === CACHE_MANAGER) {
          return {
            set: setMock,
            del: deleteMock,
            get: jest.fn().mockReturnValue(mockToken),
          };
        }
      })
      .compile();

    service = module.get<AuthService>(AuthService);
    badToken = sign(
      {
        email: 'str@ifdsf.ng',
        id: 2,
        login: 'string',
      },
      'jwt_secret',
      { expiresIn: '5h' },
    );
    mockToken = sign(
      {
        email: 'str@ifdsf.ng',
        id: 1,
        login: 'string',
      },
      'jwt_secret',
      { expiresIn: '5h' },
    );
  });

  it('should decode token', () => {
    const decoded = service.decodeToken(mockToken);

    expect(decoded.email).toBe('str@ifdsf.ng');
    expect(decoded.id).toBe(1);
    expect(decoded.login).toBe('string');
  });

  it('should validate token', async () => {
    const validToken = await service.isValidRefreshToken(1, mockToken);

    expect(validToken).toBeTruthy();

    const invalidToken = await service.isValidRefreshToken(1, badToken);
    expect(invalidToken).toBeFalsy();
  });

  it('should delete tokens', async () => {
    await service.deleteTokens(1);

    expect(deleteMock).toBeCalledTimes(2);
  });

  it('should create tokens', async () => {
    const tokens = await service.createTokens({
      id: 1,
      email: 'email',
      login: 'login',
    });

    expect(setMock).toHaveBeenNthCalledWith(1, 'access_1', tokens.accessToken, {
      ttl: 18000,
    });
    expect(setMock).toHaveBeenNthCalledWith(
      2,
      'refresh_1',
      tokens.refreshToken,
      { ttl: 18000 },
    );
  });
});
