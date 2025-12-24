import type { BaseViewModel } from "./base";
import type { TaskType as OrmTaskType } from "@prisma/nuxt";

/**
 * Type classification for tasks
 * @swagger
 * components:
 *   schemas:
 *     TaskType:
 *       type: string
 *       enum: [CALL, MAIL, ACTION, OTHER]
 *       description: Type classification for tasks (e.g., call, email, action item)
 */
export type TaskType = OrmTaskType;

/**
 * Represents a task or to-do item
 * @swagger
 * components:
 *   schemas:
 *     TaskViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: Represents a task or to-do item
 *           properties:
 *             type:
 *               $ref: '#/components/schemas/TaskType'
 *               description: Type of task
 *             name:
 *               type: string
 *               description: Task name or title
 *             content:
 *               type: string
 *               nullable: true
 *               description: Detailed task description or content
 *             startAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: When the task should start
 *             dueDateAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: Task due date
 *             doneAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: When the task was completed (null if not done)
 *             userId:
 *               type: string
 *               format: uuid
 *               description: ID of the user assigned to this task
 *             companyId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Associated company ID
 *             personId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Associated person ID
 *             leadId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Associated lead ID
 *             opportunityId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *               description: Associated opportunity ID
 *           required:
 *             - type
 *             - name
 *             - content
 *             - startAt
 *             - dueDateAt
 *             - doneAt
 *             - userId
 *             - companyId
 *             - personId
 *             - leadId
 *             - opportunityId
 */
export interface TaskViewModel extends BaseViewModel {
  /** Type of task */
  type: TaskType;
  /** Task name or title */
  name: string;
  /** Detailed task description or content */
  content: string | null;
  /** When the task should start */
  startAt: string | null;
  /** Task due date */
  dueDateAt: string | null;
  /** When the task was completed (null if not done) */
  doneAt: string | null;
  /** ID of the user assigned to this task */
  userId: string;
  /** Associated company ID */
  companyId: string | null;
  /** Associated person ID */
  personId: string | null;
  /** Associated lead ID */
  leadId: string | null;
  /** Associated opportunity ID */
  opportunityId: string | null;
}
