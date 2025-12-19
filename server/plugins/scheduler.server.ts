import { queue } from '~~/server/utils/queue';

export default defineNitroPlugin(async (nitroApp) => {

  queue.upsertJobScheduler('pes.customer.sync', {
    pattern: '0 0 */1 * * *',
  });

  queue.upsertJobScheduler('listmonk.contacts.import', {
    pattern: '0 0 */12 * * *',
  });

});
