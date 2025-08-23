import { useRuntimeConfig } from '#imports';
import { Job, Worker } from 'bullmq';
import { redisConnection } from '../utils/redis';
import { jobHandler } from '../utils/job-handler';

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();

  const worker = new Worker(config.bullmq.sysname, async (job: Job) => jobHandler(job), {
    connection: redisConnection(),
    concurrency: 50,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  });

});
