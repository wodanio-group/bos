import { Job } from "bullmq";
import * as listmonk from "../utils/listmonk";
import { prisma } from "~~/lib/prisma.server";
import { queue } from "../utils/queue";

export const importContacts = async (job: Job): Promise<void> => {
  const config = listmonk.getBaseConfig();
  if (!config)
    return;
  const listIds = listmonk.getImportListIds();
  if (listIds.length <= 0)
    return;
  const contacts: { email: string, name: string | null }[] = [
    ...((await prisma.company.findMany({
      include: { contactCommunicationWays: { where: { type: 'EMAIL' } } } 
    }))
      .map(o => o.contactCommunicationWays
        .map(oo => oo.value)
        .filter(email => email !== null)
        .map(email => ({
          email,
          name: companyDisplayName(o),
        }))
      ))
      .flat(),
    ...((await prisma.person.findMany({
      include: { contactCommunicationWays: { where: { type: 'EMAIL' } } } 
    }))
      .map(o => o.contactCommunicationWays
        .map(oo => oo.value)
        .filter(email => email !== null)
        .map(email => ({
          email,
          name: personDisplayName(o),
        }))
      ))
      .flat(),
  ];
  for (const contact of contacts) {
    await queue.add('listmonk.subscription.add', {
      ...contact,
      listIds,
    });
  }
};

export const addSubscription = async (job: Job<{ listIds: string[], email: string, name?: string }>): Promise<void> => {
  if (!Array.isArray(job.data.listIds) || job.data.listIds.length <= 0)
    return;
  await listmonk.addSubscription(job.data.listIds, job.data.email, job.data.name);
};
