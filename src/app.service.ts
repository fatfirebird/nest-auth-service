import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
  ) {}

  async getHello() {
    let data = await this.cacheManager.get('fff');

    console.log(data);
    if (!data) {
      await this.cacheManager.set('fff', { key: Math.random() }, { ttl: 999 });
      data = await this.cacheManager.get('fff');
    }

    // await this.cacheManager.reset();
    return data;
    // return { key: Math.random() };
  }
}
