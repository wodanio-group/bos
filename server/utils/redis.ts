import IORedis from 'ioredis';

let _redis: IORedis | null = null;

export const redisConnection = (): IORedis => {
  const config = useRuntimeConfig();
  
  if (config.redis.url.length <= 0)
    throw new Error('Redis url is empty');

  if (!_redis)
    _redis = new IORedis(config.redis.url, {
      maxRetriesPerRequest: null,
    });
  return _redis;
};
