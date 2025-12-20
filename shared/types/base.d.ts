/**
 * @swagger
 * components:
 *   schemas:
 *     BaseAtViewModel:
 *       type: object
 *       description: Base view model with timestamp fields
 *       properties:
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was last updated
 *       required:
 *         - createdAt
 *         - updatedAt
 */
export interface BaseAtViewModel {
  createdAt: string;
  updatedAt: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     BaseViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseAtViewModel'
 *         - type: object
 *           description: Base view model with ID and timestamp fields
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: Unique identifier (UUID)
 *           required:
 *             - id
 */
export interface BaseViewModel extends BaseAtViewModel {
  id: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Toast:
 *       type: object
 *       description: Toast notification message for UI feedback
 *       properties:
 *         type:
 *           type: string
 *           enum: [info, warning, error, success]
 *           description: Type of toast notification
 *         icon:
 *           type: string
 *           description: Optional icon name to display
 *         title:
 *           type: string
 *           description: Toast message title
 *         ttl:
 *           type: number
 *           description: Time to live in milliseconds before auto-dismissing
 *       required:
 *         - type
 *         - title
 */
export interface Toast {
  /** Type of toast notification */
  type: 'info' | 'warning' | 'error' | 'success';
  /** Optional icon name */
  icon?: string;
  /** Toast message title */
  title: string;
  /** Time to live in milliseconds */
  ttl?: number;
}
