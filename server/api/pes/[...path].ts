import { authMiddleware } from '../../utils/auth';
import { pesBaseRequest } from '../../utils/pes';
import { filterString } from '#imports';
import type { HTTPMethod } from 'h3';
import type { UserRoleRight } from '~~/shared/types/user';

const rightHttpMethodMap = new Map<HTTPMethod, UserRoleRight>([
  ['GET', 'pes.read'],
  ['POST', 'pes.interact'],
  ['PATCH', 'pes.interact'],
  ['PUT', 'pes.interact'],
  ['DELETE', 'pes.delete'],
]);

export default defineEventHandler(async (event) => {
  const user = await authMiddleware(event);
  const requiredRight = rightHttpMethodMap.get(event.method);
  if (!requiredRight || !hasRoleRights(user.role, [requiredRight]))
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'No rights to access this endpoint!',
    });
  const path = filterString(getRouterParams(event).path) ?? '/',
        query = getQuery(event),
        body = (['POST', 'PATCH', 'PUT'].includes(event.method)) ? (await readBody(event)) : undefined;
  return (await pesBaseRequest<any>(path, event.method, {
    query, body,
  }));
});
