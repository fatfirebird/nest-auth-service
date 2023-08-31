import { CACHE_TTL_METADATA } from '@nestjs/cache-manager';
import { SetMetadata } from '@nestjs/common';

const RedisCacheTTL = (redisTTL: number | { ttl: number }) => {
  const ttl = typeof redisTTL === 'number' ? { ttl: redisTTL } : redisTTL.ttl;

  return SetMetadata(CACHE_TTL_METADATA, ttl);
};

export { RedisCacheTTL };
