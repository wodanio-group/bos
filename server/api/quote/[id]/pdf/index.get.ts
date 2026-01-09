import { prisma } from "~~/lib/prisma.server";
import type { ContactAddress } from "~~/lib/prisma.server";
import { getValidatedParamsId } from "~~/shared/utils/default";
import { authMiddleware } from "~~/server/utils/auth";
import { generateQuotePdf } from "~~/server/utils/quote";
import { setResponseHeader } from "h3";

/**
 * @swagger
 * /api/quote/{id}/pdf:
 *   get:
 *     summary: Generate and download quote PDF
 *     description: Generates a PDF document for the specified quote. Requires quote.all.view permission.
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
 *     responses:
 *       200:
 *         description: PDF document
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
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
    rights: ['quote.all.view']
  });

  const id = getValidatedParamsId(event);
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
    });

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      company: {
        include: {
          contactAddresses: true,
        }
      },
      owner: true,
      quoteItems: true,
    }
  });

  if (!quote)
    throw createError({
      statusCode: 404,
      statusMessage: 'Quote not found'
    });

  // Generate PDF
  const pdfBuffer = await generateQuotePdf({
    ...quote,
    company: {
      ...quote.company,
      contactAddresses: ((quote.company.contactAddresses.length > 0) ? [
        (quote.company.contactAddresses.find(o => o.category === 'INVOICE')
          ?? quote.company.contactAddresses.find(o => o.category === 'HEADQUARTER')
          ?? quote.company.contactAddresses.find(o => o.category === 'WORK')
          ?? quote.company.contactAddresses[0]) as ContactAddress
      ] : []),
    },
  }); 

  // Set response headers
  setResponseHeader(event, 'Content-Type', 'application/pdf');
  setResponseHeader(event, 'Content-Disposition', `inline; filename="${quote.quoteId}.pdf"`);
  setResponseHeader(event, 'Content-Length', pdfBuffer.length);

  return pdfBuffer;
});
