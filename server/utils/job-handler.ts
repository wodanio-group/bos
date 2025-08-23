import { Job } from "bullmq";
import { useSevdesk } from "./sevdesk";

export const jobHandler = async (job: Job) => { switch (job.name) {
  
  case 'sevdesk.sync':
    const sevdesk = useSevdesk();
    await sevdesk.sync();
    return;

} };
