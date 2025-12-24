import type { BaseViewModel } from "./base";
import type {
  OpportunityStatus as OrmOpportunityStatus,
  OpportunityRecurringUnit as OrmOpportunityRecurringUnit
} from "@prisma/nuxt";

/**
 * Status of an opportunity in the sales pipeline
 * @swagger
 * components:
 *   schemas:
 *     OpportunityStatus:
 *       type: string
 *       enum: [OPEN, WON, LOST]
 *       description: Status of an opportunity (OPEN for active, WON for successful, LOST for unsuccessful)
 */
export type OpportunityStatus = OrmOpportunityStatus;

/**
 * Recurring time unit for opportunity revenue
 * @swagger
 * components:
 *   schemas:
 *     OpportunityRecurringUnit:
 *       type: string
 *       enum: [DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, ANNUALLY]
 *       description: Time unit for recurring revenue calculations
 */
export type OpportunityRecurringUnit = OrmOpportunityRecurringUnit;

/**
 * Represents an opportunity stage in the sales pipeline
 * @swagger
 * components:
 *   schemas:
 *     OpportunityStageViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents an opportunity stage in the sales pipeline
 *           properties:
 *             alias:
 *               type: string
 *               description: Unique alias/slug for the stage
 *             name:
 *               type: string
 *               description: Stage name
 *             default:
 *               type: boolean
 *               description: Whether this is the default stage for new opportunities
 *             order:
 *               type: number
 *               description: Display order (lower numbers appear first)
 *           required:
 *             - alias
 *             - name
 *             - default
 *             - order
 */
export interface OpportunityStageViewModel extends BaseViewModel {
  /** Unique alias/slug for the stage */
  alias: string;
  /** Stage name */
  name: string;
  /** Whether this is the default stage for new opportunities */
  default: boolean;
  /** Display order (lower numbers appear first) */
  order: number;
}

/**
 * Represents a sales opportunity
 * @swagger
 * components:
 *   schemas:
 *     OpportunityViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a sales opportunity
 *           properties:
 *             name:
 *               type: string
 *               description: Opportunity name
 *             description:
 *               type: string
 *               nullable: true
 *               description: Detailed description of the opportunity
 *             amount:
 *               type: number
 *               format: float
 *               description: One-time deal amount
 *             recurringAmount:
 *               type: number
 *               format: float
 *               description: Recurring revenue amount per period
 *             recurringCount:
 *               type: number
 *               format: float
 *               description: Number of recurring periods
 *             recurringUnit:
 *               $ref: '#/components/schemas/OpportunityRecurringUnit'
 *               nullable: true
 *               description: Time unit for recurring revenue
 *             probabilityPercent:
 *               type: number
 *               format: float
 *               description: Probability of closing (0-100)
 *             status:
 *               $ref: '#/components/schemas/OpportunityStatus'
 *               description: Current status of the opportunity
 *             opportunityStageId:
 *               type: string
 *               format: uuid
 *               description: Current stage in the sales pipeline
 *             companyId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Associated company contact ID
 *             personId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Associated person contact ID
 *             leadId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Source lead ID
 *             ownerId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: ID of the user who owns this opportunity
 *           required:
 *             - name
 *             - description
 *             - amount
 *             - recurringAmount
 *             - recurringCount
 *             - recurringUnit
 *             - probabilityPercent
 *             - status
 *             - opportunityStageId
 *             - companyId
 *             - personId
 *             - leadId
 *             - ownerId
 */
export interface OpportunityViewModel extends BaseViewModel {
  /** Opportunity name */
  name: string;
  /** Detailed description of the opportunity */
  description: string | null;
  /** One-time deal amount */
  amount: number;
  /** Recurring revenue amount per period */
  recurringAmount: number;
  /** Number of recurring periods */
  recurringCount: number;
  /** Time unit for recurring revenue */
  recurringUnit: OpportunityRecurringUnit | null;
  /** Probability of closing (0-100) */
  probabilityPercent: number;
  /** Current status of the opportunity */
  status: OpportunityStatus;
  /** Current stage in the sales pipeline */
  opportunityStageId: string;
  /** Associated company contact ID */
  companyId: string | null;
  /** Associated person contact ID */
  personId: string | null;
  /** Source lead ID */
  leadId: string | null;
  /** ID of the user who owns this opportunity */
  ownerId: string | null;
}
