import { queue } from '~~/server/utils/queue';

export default defineNitroPlugin(async (nitroApp) => {

  // queue.upsertJobScheduler('sevdesk.sync', {
  //   pattern: '0 0 */1 * * *',
  // });
  queue.removeJobScheduler('sevdesk.sync');

});
