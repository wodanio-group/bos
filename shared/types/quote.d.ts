import type { BaseViewModel } from "./base";
import type { QuoteStatus as OrmQuoteStatus } from "@prisma/nuxt";

/**
 * Status of a quote
 * @swagger
 * components:
 *   schemas:
 *     QuoteStatus:
 *       type: string
 *       enum: [DRAFT, SENT, ACCEPTED, REJECTED]
 *       description: Status of a quote
 */
export type QuoteStatus = OrmQuoteStatus;

/**
 * Represents a quote item within a quote
 * @swagger
 * components:
 *   schemas:
 *     QuoteItemViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a quote item within a quote
 *           properties:
 *             quotePosition:
 *               type: integer
 *               description: Position/order of this item within the quote
 *             title:
 *               type: string
 *               description: Title or name of the quoted item
 *             description:
 *               type: string
 *               nullable: true
 *               description: Detailed description of the quoted item
 *             quantity:
 *               type: number
 *               format: float
 *               description: Quantity of this item
 *             unit:
 *               type: string
 *               nullable: true
 *               description: Unit of measurement (e.g., pieces, hours, kg)
 *             price:
 *               type: number
 *               format: float
 *               description: Unit price for this item
 *             taxRate:
 *               type: number
 *               format: float
 *               description: Tax rate as decimal (e.g., 0.19 for 19%)
 *             subtotal:
 *               type: number
 *               format: float
 *               readOnly: true
 *               description: Subtotal before tax (quantity * price) - auto-calculated
 *             tax:
 *               type: number
 *               format: float
 *               readOnly: true
 *               description: Tax amount - auto-calculated
 *             total:
 *               type: number
 *               format: float
 *               readOnly: true
 *               description: Total amount including tax - auto-calculated
 *             quoteId:
 *               type: string
 *               format: uuid
 *               description: Reference to parent quote
 *           required:
 *             - quotePosition
 *             - title
 *             - description
 *             - quantity
 *             - unit
 *             - price
 *             - taxRate
 *             - subtotal
 *             - tax
 *             - total
 *             - quoteId
 */
export interface QuoteItemViewModel extends BaseViewModel {
  /** Position/order of this item within the quote */
  quotePosition: number;
  /** Title or name of the quoted item */
  title: string;
  /** Detailed description of the quoted item */
  description: string | null;
  /** Quantity of this item */
  quantity: number;
  /** Unit of measurement (e.g., pieces, hours, kg) */
  unit: string | null;
  /** Unit price for this item */
  price: number;
  /** Tax rate as decimal (e.g., 0.19 for 19%) */
  taxRate: number;
  /** Subtotal before tax (quantity * price) - auto-calculated */
  readonly subtotal: number;
  /** Tax amount - auto-calculated */
  readonly tax: number;
  /** Total amount including tax - auto-calculated */
  readonly total: number;
  /** Reference to parent quote */
  quoteId: string;
}

/**
 * Represents a quote/offer for a company
 * @swagger
 * components:
 *   schemas:
 *     QuoteViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a quote/offer for a company
 *           properties:
 *             status:
 *               $ref: '#/components/schemas/QuoteStatus'
 *               description: Status of the quote
 *             quoteId:
 *               type: string
 *               readOnly: true
 *               description: Business quote identifier (e.g., Q-2026-001) - auto-generated
 *             quoteDate:
 *               type: string
 *               format: date
 *               description: Date when the quote was created
 *             quoteValidUntil:
 *               type: string
 *               format: date
 *               nullable: true
 *               description: Date until which the quote is valid
 *             title:
 *               type: string
 *               nullable: true
 *               description: Title of the quote
 *             introText:
 *               type: string
 *               nullable: true
 *               description: Introduction text for the quote
 *             outroText:
 *               type: string
 *               nullable: true
 *               description: Closing text for the quote
 *             subtotal:
 *               type: number
 *               format: float
 *               readOnly: true
 *               description: Subtotal of all items before tax - auto-calculated
 *             tax:
 *               type: number
 *               format: float
 *               readOnly: true
 *               description: Total tax amount - auto-calculated
 *             total:
 *               type: number
 *               format: float
 *               readOnly: true
 *               description: Total amount including tax - auto-calculated
 *             companyId:
 *               type: string
 *               format: uuid
 *               description: Reference to the company receiving the quote
 *             ownerId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Reference to the user who owns/created the quote
 *             quoteItems:
 *               type: array
 *               description: List of items in this quote
 *               items:
 *                 $ref: '#/components/schemas/QuoteItemViewModel'
 *           required:
 *             - status
 *             - quoteId
 *             - quoteDate
 *             - quoteValidUntil
 *             - title
 *             - introText
 *             - outroText
 *             - subtotal
 *             - tax
 *             - total
 *             - companyId
 *             - ownerId
 *             - quoteItems
 */
export interface QuoteViewModel extends BaseViewModel {
  /** Status of the quote */
  status: QuoteStatus;
  /** Business quote identifier (e.g., Q-2026-001) - auto-generated */
  readonly quoteId: string;
  /** Date when the quote was created */
  quoteDate: string;
  /** Date until which the quote is valid */
  quoteValidUntil: string | null;
  /** Title of the quote */
  title: string | null;
  /** Introduction text for the quote */
  introText: string | null;
  /** Closing text for the quote */
  outroText: string | null;
  /** Subtotal of all items before tax - auto-calculated */
  readonly subtotal: number;
  /** Total tax amount - auto-calculated */
  readonly tax: number;
  /** Total amount including tax - auto-calculated */
  readonly total: number;
  /** Reference to the company receiving the quote */
  companyId: string;
  /** Reference to the user who owns/created the quote */
  ownerId: string | null;
  /** List of items in this quote */
  quoteItems: QuoteItemViewModel[];
}
