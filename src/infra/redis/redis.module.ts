import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      useFactory: async (configService: ConfigService) => {
        return {
          isGlobal: true,
          store: await redisStore({
            url: configService.get('REDIS_URL'),
          }),
        };
      },
    }),
  ],
})
export class RedisModule {}
