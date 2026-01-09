import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';

export const redisConnectionOptions = (): RedisOptions => {
  const config = useRuntimeConfig();
  
  if (config.redis.url.length <= 0)
    throw new Error('Redis url is empty');

  const url = new URL(config.redis.url);
  return {
    host: url.hostname,
    port: parseInt(url.port) || 6379,
    password: url.password || undefined,
    username: url.username || undefined,
    db: parseInt(url.pathname.slice(1)) || 0,
    maxRetriesPerRequest: null,
  };
};

export const redisConnection = (): Redis => {
  const config = useRuntimeConfig();
  
  if (config.redis.url.length <= 0)
    throw new Error('Redis url is empty');

  return (new Redis(redisConnectionOptions()));
};
