import { quoteToViewModel, quoteItemCreateValidator, calculateQuoteItemTotals, calculateQuoteTotals, quoteStatusValidator } from "~~/shared/utils/quote";
import { authMiddleware } from "~~/server/utils/auth";
import { prisma } from "~~/lib/prisma.server";
import { z } from "zod";

/**
 * @swagger
 * /api/quote/{id}:
 *   patch:
 *     summary: Update a quote
 *     description: Updates an existing quote and its items. Requires quote.all.edit permission. Subtotal, tax, and total are recalculated automatically.
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The quote ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/QuoteStatus'
 *                 description: Status of the quote
 *               quoteDate:
 *                 type: string
 *                 format: date
 *                 description: Quote creation date
 *               quoteValidUntil:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Date until which the quote is valid
 *               title:
 *                 type: string
 *                 nullable: true
 *                 description: Quote title
 *               introText:
 *                 type: string
 *                 nullable: true
 *                 description: Introduction text
 *               outroText:
 *                 type: string
 *                 nullable: true
 *                 description: Closing text
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 description: Company ID receiving the quote
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Owner user ID
 *               quoteItems:
 *                 type: array
 *                 description: Quote line items (replaces all existing items)
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
 *         description: Successfully updated quote
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
 *       404:
 *         description: Quote not found
 */
export default defineEventHandler(async (event) => {
  await authMiddleware(event, {
    rights: ['quote.all.edit']
  });

  const id = getValidatedParamsId(event);
  const body = z.object({
    status: quoteStatusValidator.optional(),
    quoteDate: z.iso.date().optional(),
    quoteValidUntil: z.iso.date().optional().nullable(),
    title: z.string().trim().optional().nullable(),
    introText: z.string().trim().optional().nullable(),
    outroText: z.string().trim().optional().nullable(),
    companyId: z.string().uuid().optional(),
    ownerId: z.string().uuid().optional().nullable(),
    quoteItems: z.array(quoteItemCreateValidator).min(1).optional(),
  }).safeParse(await readBody(event));

  if (!id || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: body?.error?.flatten()?.fieldErrors,
    });

  const findItem = await prisma.quote.findUnique({ where: { id } });
  if (!findItem)
    throw createError({ statusCode: 404 });

  // Verify company exists if being updated
  if (body.data.companyId) {
    const company = await prisma.company.findUnique({ where: { id: body.data.companyId } });
    if (!company)
      throw createError({
        statusCode: 400,
        statusMessage: 'Company not found',
      });
  }

  // Verify owner exists if being updated
  if (body.data.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: body.data.ownerId } });
    if (!owner)
      throw createError({
        statusCode: 400,
        statusMessage: 'Owner user not found',
      });
  }

  let quoteTotals = { subtotal: findItem.subtotal, tax: findItem.tax, total: findItem.total };

  // If items are being updated, calculate new totals
  if (body.data.quoteItems) {
    const itemsWithTotals = body.data.quoteItems.map(item => {
      const totals = calculateQuoteItemTotals(item.quantity, item.price, item.taxRate);
      return {
        ...item,
        ...totals
      };
    });

    quoteTotals = calculateQuoteTotals(itemsWithTotals);

    // Delete existing items and create new ones
    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });

    await prisma.quoteItem.createMany({
      data: itemsWithTotals.map(item => ({
        quoteId: id,
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
    });
  }

  const item = await prisma.quote.update({
    where: { id },
    data: {
      status: body.data.status,
      quoteDate: body.data.quoteDate ? new Date(body.data.quoteDate) : undefined,
      quoteValidUntil: body.data.quoteValidUntil !== undefined
        ? (body.data.quoteValidUntil ? new Date(body.data.quoteValidUntil) : null)
        : undefined,
      title: body.data.title,
      introText: body.data.introText,
      outroText: body.data.outroText,
      companyId: body.data.companyId,
      ownerId: body.data.ownerId,
      subtotal: quoteTotals.subtotal,
      tax: quoteTotals.tax,
      total: quoteTotals.total,
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

  return quoteToViewModel(item);
});
