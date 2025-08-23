import { Queue } from 'bullmq';
import { useRuntimeConfig } from '#imports';
import { redisConnection } from './redis';

export const queue = new Queue(useRuntimeConfig().bullmq.sysname, {
  connection: redisConnection(),
});

