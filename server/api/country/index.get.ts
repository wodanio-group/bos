import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { countryToViewModel } from "~~/shared/utils/contact";

/**
 * @swagger
 * /api/country:
 *   get:
 *     summary: Get list of countries
 *     description: Retrieves a list of all countries ordered by ISO code in descending order
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the country
 *                   name:
 *                     type: string
 *                     description: Full name of the country
 *                   isoCode:
 *                     type: string
 *                     description: ISO country code
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the country was created
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the country was last updated
 *       500:
 *         description: Internal server error
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event);

  return (await prisma.country.findMany({
    orderBy: {
      isoCode: 'desc'
    }
  })).map(o => countryToViewModel(o));
});
