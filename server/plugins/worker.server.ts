import { useRuntimeConfig } from '#imports';
import { Job, Worker } from 'bullmq';
import { redisConnectionOptions } from '../utils/redis';
import { jobHandler } from '../utils/job-handler';

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();

  const worker = new Worker(config.bullmq.sysname, async (job: Job) => {
    try {
      await jobHandler(job);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, {
    connection: redisConnectionOptions(),
    concurrency: 50,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  });

});
