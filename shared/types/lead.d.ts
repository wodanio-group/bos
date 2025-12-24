import type { BaseViewModel } from "./base";

/**
 * Represents a lead status in the sales pipeline
 * @swagger
 * components:
 *   schemas:
 *     LeadStatusViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a lead status in the sales pipeline
 *           properties:
 *             alias:
 *               type: string
 *               description: Unique alias/slug for the status
 *             name:
 *               type: string
 *               description: Status name
 *             default:
 *               type: boolean
 *               description: Whether this is the default status for new leads
 *             order:
 *               type: number
 *               description: Display order (lower numbers appear first)
 *           required:
 *             - alias
 *             - name
 *             - default
 *             - order
 */
export interface LeadStatusViewModel extends BaseViewModel {
  /** Unique alias/slug for the status */
  alias: string;
  /** Status name */
  name: string;
  /** Whether this is the default status for new leads */
  default: boolean;
  /** Display order (lower numbers appear first) */
  order: number;
}

/**
 * Represents a sales lead
 * @swagger
 * components:
 *   schemas:
 *     LeadViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a sales lead
 *           properties:
 *             firstname:
 *               type: string
 *               nullable: true
 *               description: Lead's first name
 *             familyname:
 *               type: string
 *               nullable: true
 *               description: Lead's family name
 *             companyName:
 *               type: string
 *               nullable: true
 *               description: Lead's company name
 *             jobTitle:
 *               type: string
 *               nullable: true
 *               description: Lead's job title
 *             email:
 *               type: string
 *               format: email
 *               nullable: true
 *               description: Lead's email address
 *             phoneNumber:
 *               type: string
 *               nullable: true
 *               description: Lead's phone number
 *             mobileNumber:
 *               type: string
 *               nullable: true
 *               description: Lead's mobile number
 *             attrs:
 *               type: object
 *               description: Additional custom attributes (JSON)
 *             note:
 *               type: string
 *               nullable: true
 *               description: Public notes about the lead
 *             internalNote:
 *               type: string
 *               nullable: true
 *               description: Internal notes (not visible to lead)
 *             ownerId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: ID of the user who owns this lead
 *             leadStatusId:
 *               type: string
 *               format: uuid
 *               description: Current status of the lead
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
 *             campaignId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Source campaign ID
 *           required:
 *             - firstname
 *             - familyname
 *             - companyName
 *             - jobTitle
 *             - email
 *             - phoneNumber
 *             - mobileNumber
 *             - attrs
 *             - note
 *             - internalNote
 *             - ownerId
 *             - leadStatusId
 *             - companyId
 *             - personId
 *             - campaignId
 */
export interface LeadViewModel extends BaseViewModel {
  /** Lead's first name */
  firstname: string | null;
  /** Lead's family name */
  familyname: string | null;
  /** Lead's company name */
  companyName: string | null;
  /** Lead's job title */
  jobTitle: string | null;
  /** Lead's email address */
  email: string | null;
  /** Lead's phone number */
  phoneNumber: string | null;
  /** Lead's mobile number */
  mobileNumber: string | null;
  /** Additional custom attributes (JSON) */
  attrs: Record<string, any>;
  /** Public notes about the lead */
  note: string | null;
  /** Internal notes (not visible to lead) */
  internalNote: string | null;
  /** ID of the user who owns this lead */
  ownerId: string | null;
  /** Current status of the lead */
  leadStatusId: string;
  /** Associated company contact ID */
  companyId: string | null;
  /** Associated person contact ID */
  personId: string | null;
  /** Source campaign ID */
  campaignId: string | null;
}
