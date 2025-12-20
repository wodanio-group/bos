import type { BaseViewModel } from "./base";

/**
 * @swagger
 * components:
 *   schemas:
 *     TimeTrackingActivityViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: View model representing a time tracking activity entry that tracks the time spent by a user on a specific task or activity
 *           properties:
 *             user:
 *               type: string
 *               format: uuid
 *               description: The ID or identifier of the user who performed the tracked activity
 *             from:
 *               type: string
 *               format: date-time
 *               description: The start timestamp of the time tracking activity (ISO 8601 format)
 *             to:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: The end timestamp of the time tracking activity (ISO 8601 format), null if activity is still ongoing
 *             duration:
 *               type: number
 *               description: The total duration of the activity in seconds
 *             description:
 *               type: string
 *               nullable: true
 *               description: Optional description or notes about the tracked activity
 *             company:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: The ID of the company associated with this activity, null if not linked to a company
 *             exportedAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: Timestamp when this activity was exported (ISO 8601 format), null if not yet exported
 *           required:
 *             - user
 *             - from
 *             - to
 *             - duration
 *             - description
 *             - company
 *             - exportedAt
 */
export interface TimeTrackingActivityViewModel extends BaseViewModel {
  /** The ID or identifier of the user who performed the tracked activity */
  user: string;
  /** The start timestamp of the time tracking activity (ISO 8601 format) */
  from: string;
  /** The end timestamp of the time tracking activity (ISO 8601 format), null if activity is still ongoing */
  to: string | null;
  /** The total duration of the activity in seconds */
  duration: number;
  /** Optional description or notes about the tracked activity */
  description: string | null;
  /** The ID of the company associated with this activity, null if not linked to a company */
  company: string | null;
  /** Timestamp when this activity was exported (ISO 8601 format), null if not yet exported */
  exportedAt: string | null;
}
