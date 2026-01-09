import { quoteToViewModel, quoteItemCreateValidator, calculateQuoteItemTotals, calculateQuoteTotals, quoteStatusValidator } from "~~/shared/utils/quote";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { getNextAvailableQuoteId, increaseQuoteId } from "~~/server/utils/quote";
import { z } from "zod";

/**
 * @swagger
 * /api/quote:
 *   post:
 *     summary: Create a new quote
 *     description: Creates a new quote with items. Requires quote.all.create permission. The quoteId, subtotal, tax, and total fields are auto-generated.
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - quoteDate
 *               - quoteItems
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/QuoteStatus'
 *                 description: Status of the quote (default DRAFT)
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 description: Company ID receiving the quote
 *               quoteDate:
 *                 type: string
 *                 format: date
 *                 description: Quote creation date
 *               quoteValidUntil:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Date until which the quote is valid
 *               introText:
 *                 type: string
 *                 nullable: true
 *                 description: Introduction text
 *               outroText:
 *                 type: string
 *                 nullable: true
 *                 description: Closing text
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Owner user ID
 *               quoteItems:
 *                 type: array
 *                 description: Quote line items
 *                 items:
 *                   type: object
 *                   required:
 *                     - quotePosition
 *                     - title
 *                     - quantity
 *                     - price
 *                     - taxRate
 *                   properties:
 *                     quotePosition:
 *                       type: integer
 *                       description: Item position
 *                     title:
 *                       type: string
 *                       description: Item title
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       description: Item description
 *                     quantity:
 *                       type: number
 *                       format: float
 *                       description: Quantity
 *                     unit:
 *                       type: string
 *                       nullable: true
 *                       description: Unit (e.g., pieces, hours)
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: Unit price
 *                     taxRate:
 *                       type: number
 *                       format: float
 *                       description: Tax rate (e.g., 0.19 for 19%)
 *     responses:
 *       200:
 *         description: Successfully created quote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuoteViewModel'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['quote.all.create']
  });

  const body = z.object({
    status: quoteStatusValidator.optional(),
    companyId: z.string().uuid(),
    quoteDate: z.iso.date(),
    quoteValidUntil: z.iso.date().optional().nullable(),
    introText: z.string().trim().optional().nullable(),
    outroText: z.string().trim().optional().nullable(),
    ownerId: z.string().uuid().optional().nullable(),
    quoteItems: z.array(quoteItemCreateValidator).min(1),
  }).safeParse(await readBody(event));

  if (!body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body.error.flatten().fieldErrors,
    });

  // Verify company exists
  const company = await prisma.company.findUnique({ where: { id: body.data.companyId } });
  if (!company)
    throw createError({
      statusCode: 400,
      statusMessage: 'Company not found',
    });

  // Verify owner exists if provided
  if (body.data.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: body.data.ownerId } });
    if (!owner)
      throw createError({
        statusCode: 400,
        statusMessage: 'Owner user not found',
      });
  }

  // Calculate totals for each item
  const itemsWithTotals = body.data.quoteItems.map(item => {
    const totals = calculateQuoteItemTotals(item.quantity, item.price, item.taxRate);
    return {
      ...item,
      ...totals
    };
  });

  // Calculate quote totals
  const quoteTotals = calculateQuoteTotals(itemsWithTotals);

  // Generate quote ID
  const quoteId = await getNextAvailableQuoteId();

  // Create quote with items
  const item = await prisma.quote.create({
    data: {
      status: body.data.status,
      quoteId,
      quoteDate: new Date(body.data.quoteDate),
      quoteValidUntil: body.data.quoteValidUntil ? new Date(body.data.quoteValidUntil) : null,
      introText: body.data.introText,
      outroText: body.data.outroText,
      subtotal: quoteTotals.subtotal,
      tax: quoteTotals.tax,
      total: quoteTotals.total,
      companyId: body.data.companyId,
      ownerId: body.data.ownerId,
      quoteItems: {
        create: itemsWithTotals.map(item => ({
          quotePosition: item.quotePosition,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          taxRate: item.taxRate,
          subtotal: item.subtotal,
          tax: item.tax,
          total: item.total,
        }))
      }
    },
    include: {
      company: true,
      quoteItems: {
        orderBy: {
          quotePosition: 'asc'
        }
      }
    }
  });

  // Increase quote ID counter
  await increaseQuoteId();

  return quoteToViewModel(item);
});
