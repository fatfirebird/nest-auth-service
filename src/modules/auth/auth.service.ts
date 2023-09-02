import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { User } from 'src/infra/database';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
  ) {}

  async createTokens(user: User) {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');

    const accessTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const payload = { id: user.id, email: user.email, login: user.login };

    const accessToken = sign(payload, secret, {
      expiresIn: accessTokenExpiresIn,
    });

    const refreshToken = sign(payload, secret, {
      expiresIn: refreshTokenExpiresIn,
    });

    await this.cacheManager.set(`access_${payload.id}`, accessToken, {
      ttl: ms(accessTokenExpiresIn) / 1000,
    });

    await this.cacheManager.set(`refresh_${payload.id}`, refreshToken, {
      ttl: ms(refreshTokenExpiresIn) / 1000,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
