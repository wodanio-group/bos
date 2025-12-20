/**
 * @swagger
 * /api/ip:
 *   get:
 *     summary: Get client IP address
 *     description: Retrieves the IP address of the requesting client by checking X-Forwarded-For header, request IP, or socket remote address
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Successfully retrieved IP address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 value:
 *                   type: string
 *                   nullable: true
 *                   description: The IP address of the client, or null if unable to determine
 *                   example: "192.168.1.100"
 *       500:
 *         description: Internal server error
 */
export default defineEventHandler(async (event) => {
  return {
    value: event.node.req.headers['x-forwarded-for'] 
      || getRequestIP(event) 
      || event.node.req.socket.remoteAddress 
      || null
  };
});
