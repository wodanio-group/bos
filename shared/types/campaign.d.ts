import type { BaseViewModel } from "./base";

/**
 * Represents a marketing campaign
 * @swagger
 * components:
 *   schemas:
 *     CampaignViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a marketing campaign
 *           properties:
 *             alias:
 *               type: string
 *               description: Unique alias/slug for the campaign
 *             name:
 *               type: string
 *               description: Campaign name
 *             shortDescription:
 *               type: string
 *               nullable: true
 *               description: Brief description of the campaign
 *             allowPublicCreation:
 *               type: boolean
 *               description: Whether public users can create leads for this campaign
 *           required:
 *             - alias
 *             - name
 *             - shortDescription
 *             - allowPublicCreation
 */
export interface CampaignViewModel extends BaseViewModel {
  /** Unique alias/slug for the campaign */
  alias: string;
  /** Campaign name */
  name: string;
  /** Brief description of the campaign */
  shortDescription: string | null;
  /** Whether public users can create leads for this campaign */
  allowPublicCreation: boolean;
}
