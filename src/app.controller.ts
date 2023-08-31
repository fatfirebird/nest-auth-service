import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { RedisCacheTTL } from './core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseInterceptors(CacheInterceptor)
  @RedisCacheTTL(333)
  @CacheKey('test key')
  @Get()
  async getHello() {
    return this.appService.getHello();
  }
}
