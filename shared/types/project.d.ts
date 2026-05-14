import type { BaseViewModel } from "./base";
import type {
  ProjectStatus as OrmProjectStatus,
  ProjectMemberRole as OrmProjectMemberRole,
} from "@prisma/nuxt";
import type { ContactNoteType } from "./contact";

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectStatus:
 *       type: string
 *       enum: [DRAFT, ACTIVE, ARCHIVED]
 *       description: Status of a project
 */
export type ProjectStatus = OrmProjectStatus;

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectMemberRole:
 *       type: string
 *       enum: [MANAGER, MEMBER]
 *       description: Role of a project member (MANAGER can edit, MEMBER can only view)
 */
export type ProjectMemberRole = OrmProjectMemberRole;

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectNoteViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: A note associated with a project
 *           properties:
 *             type:
 *               $ref: '#/components/schemas/ContactNoteType'
 *             timestamp:
 *               type: string
 *               format: date-time
 *               nullable: true
 *             content:
 *               type: string
 *           required:
 *             - type
 *             - timestamp
 *             - content
 */
export interface ProjectNoteViewModel extends BaseViewModel {
  type: ContactNoteType;
  timestamp: string | null;
  content: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectMemberViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: A member of a project with their role
 *           properties:
 *             role:
 *               $ref: '#/components/schemas/ProjectMemberRole'
 *             userId:
 *               type: string
 *               format: uuid
 *             userEmail:
 *               type: string
 *             userDisplayName:
 *               type: string
 *               nullable: true
 *           required:
 *             - role
 *             - userId
 *             - userEmail
 *             - userDisplayName
 */
export interface ProjectMemberViewModel extends BaseViewModel {
  role: ProjectMemberRole;
  userId: string;
  userEmail: string;
  userDisplayName: string | null;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: A project with members, notes and optional company relation
 *           properties:
 *             name:
 *               type: string
 *             status:
 *               $ref: '#/components/schemas/ProjectStatus'
 *             description:
 *               type: string
 *               nullable: true
 *             companyId:
 *               type: string
 *               format: uuid
 *               nullable: true
 *             companyName:
 *               type: string
 *               nullable: true
 *             members:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectMemberViewModel'
 *             notes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectNoteViewModel'
 *           required:
 *             - name
 *             - status
 *             - description
 *             - companyId
 *             - companyName
 *             - members
 *             - notes
 */
export interface ProjectViewModel extends BaseViewModel {
  name: string;
  status: ProjectStatus;
  description: string | null;
  companyId: string | null;
  companyName: string | null;
  members: ProjectMemberViewModel[];
  notes: ProjectNoteViewModel[];
}
