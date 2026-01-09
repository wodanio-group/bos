import { Queue } from 'bullmq';
import { useRuntimeConfig } from '#imports';
import { redisConnectionOptions } from './redis';

export const queue = new Queue(useRuntimeConfig().bullmq.sysname, {
  connection: redisConnectionOptions(),
});

