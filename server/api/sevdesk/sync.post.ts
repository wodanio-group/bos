import { authMiddleware } from "#imports";
import { queue } from "~~/server/utils/queue";

export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['sevdesk.sync'] 
  });
  queue.add('sevdesk.sync', {});
  return { message: 'OK' };
});
