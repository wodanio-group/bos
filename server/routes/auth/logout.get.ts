import { z } from "zod";

export default defineEventHandler(async (event) => {
  const query = z.object({
      r: z.string().optional().nullable()
    }).safeParse(getQuery(event));
  event.node.res.setHeader('Set-Cookie', [
    'token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
  ]);
  return sendRedirect(event, query.data?.r ?? '/');
});
