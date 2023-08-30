import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getHello() {
    this.cacheManager.set('cached_item', { key: 78 }, 10000);
    const data = await this.cacheManager.get('cached_item');
    console.log(data);
    return data;
  }
}
