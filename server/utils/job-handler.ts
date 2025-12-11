import { Job } from "bullmq";
import * as pesJobs from '../jobs/pes';

export const jobHandler = async (job: Job) => { try { switch (job.name) {

  case 'pes.customer.sync':
    return (await pesJobs.customerSync(job));
  case 'pes.customer.upsert':
    return (await pesJobs.customerUpsert(job));
  case 'pes.customer.delete':
    return (await pesJobs.customerDelete(job));

} } catch (e) {
  console.error(e);
  throw e;
} };
