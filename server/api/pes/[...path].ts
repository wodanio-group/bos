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

/**
 * @swagger
 * /api/pes/{path}:
 *   get:
 *     summary: Proxy GET request to PES API
 *     description: Forwards GET requests to the PES (Product Engineering System) API with authentication and authorization
 *     tags: [PES]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The PES API endpoint path to call
 *         example: "customers"
 *       - in: query
 *         name: query
 *         schema:
 *           type: object
 *         description: Query parameters to forward to PES API
 *     responses:
 *       200:
 *         description: Successfully proxied request to PES API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Response from PES API (varies by endpoint)
 *       401:
 *         description: Unauthorized - User does not have pes.read permission
 *       500:
 *         description: Internal server error or PES API error
 *   post:
 *     summary: Proxy POST request to PES API
 *     description: Forwards POST requests to the PES API with authentication and authorization
 *     tags: [PES]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The PES API endpoint path to call
 *         example: "customers"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Request body to forward to PES API (varies by endpoint)
 *     responses:
 *       200:
 *         description: Successfully proxied request to PES API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Response from PES API (varies by endpoint)
 *       401:
 *         description: Unauthorized - User does not have pes.interact permission
 *       500:
 *         description: Internal server error or PES API error
 *   patch:
 *     summary: Proxy PATCH request to PES API
 *     description: Forwards PATCH requests to the PES API with authentication and authorization
 *     tags: [PES]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The PES API endpoint path to call
 *         example: "customers/123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Request body to forward to PES API (varies by endpoint)
 *     responses:
 *       200:
 *         description: Successfully proxied request to PES API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Response from PES API (varies by endpoint)
 *       401:
 *         description: Unauthorized - User does not have pes.interact permission
 *       500:
 *         description: Internal server error or PES API error
 *   put:
 *     summary: Proxy PUT request to PES API
 *     description: Forwards PUT requests to the PES API with authentication and authorization
 *     tags: [PES]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The PES API endpoint path to call
 *         example: "customers/123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Request body to forward to PES API (varies by endpoint)
 *     responses:
 *       200:
 *         description: Successfully proxied request to PES API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Response from PES API (varies by endpoint)
 *       401:
 *         description: Unauthorized - User does not have pes.interact permission
 *       500:
 *         description: Internal server error or PES API error
 *   delete:
 *     summary: Proxy DELETE request to PES API
 *     description: Forwards DELETE requests to the PES API with authentication and authorization
 *     tags: [PES]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The PES API endpoint path to call
 *         example: "customers/123"
 *     responses:
 *       200:
 *         description: Successfully proxied request to PES API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Response from PES API (varies by endpoint)
 *       401:
 *         description: Unauthorized - User does not have pes.delete permission
 *       500:
 *         description: Internal server error or PES API error
 */
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
