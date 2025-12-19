import { Job } from "bullmq";
import * as pesJobs from '../jobs/pes';
import * as listmonkJobs from '../jobs/listmonk';

export const jobHandler = async (job: Job) => { try { switch (job.name) {

  case 'pes.customer.sync':
    return (await pesJobs.customerSync(job));
  case 'pes.customer.upsert':
    return (await pesJobs.customerUpsert(job));
  case 'pes.customer.delete':
    return (await pesJobs.customerDelete(job));

  case 'listmonk.contacts.import':
    return (await listmonkJobs.importContacts(job));
  case 'listmonk.subscription.add':
    return (await listmonkJobs.addSubscription(job));

} } catch (e) {
  console.error(e);
  throw e;
} };
