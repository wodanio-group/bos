import type { UserRole as OrmUserRole } from "~~/lib/prisma.server";
import type { BaseViewModel } from "./base";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: string
 *       enum: [ADMINISTRATOR, USER]
 *       description: User role determining base permissions (ADMINISTRATOR has full access, USER has limited access based on rights)
 */
export type UserRole = OrmUserRole;

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRoleRight:
 *       type: string
 *       enum:
 *         - option.all.view
 *         - option.all.edit
 *         - user.all.view
 *         - user.all.create
 *         - user.all.edit
 *         - user.all.delete
 *         - user.token.all.view
 *         - user.token.all.create
 *         - user.token.all.edit
 *         - user.token.all.delete
 *         - user.token.own.view
 *         - user.token.own.create
 *         - user.token.own.edit
 *         - user.token.own.delete
 *         - pes.read
 *         - pes.interact
 *         - pes.delete
 *         - timetracking.all.view
 *         - timetracking.all.edit
 *         - timetracking.all.delete
 *         - timetracking.own.view
 *         - timetracking.own.create
 *         - timetracking.own.editnoneexported
 *         - contact.all.view
 *         - contact.all.create
 *         - contact.all.edit
 *         - contact.all.delete
 *       description: |
 *         Granular permission rights for role-based access control.
 *         Format: {resource}.{scope}.{action}
 *         - resource: option, user, user.token, pes, timetracking, contact
 *         - scope: all (all records), own (user's own records)
 *         - action: view, create, edit, delete, read, interact, editnoneexported
 */
export type UserRoleRight =
  'option.all.view' | 'option.all.edit'
  | 'user.all.view' | 'user.all.create' | 'user.all.edit' | 'user.all.delete'
  | 'user.token.all.view' | 'user.token.all.create' | 'user.token.all.edit' | 'user.token.all.delete'
  | 'user.token.own.view' | 'user.token.own.create' | 'user.token.own.edit' | 'user.token.own.delete'
  | 'pes.read' | 'pes.interact' | 'pes.delete'
  | 'timetracking.all.view' | 'timetracking.all.edit' | 'timetracking.all.delete' | 'timetracking.own.view' | 'timetracking.own.create' | 'timetracking.own.editnoneexported'
  | 'contact.all.view' | 'contact.all.create' | 'contact.all.edit' | 'contact.all.delete';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: User account view model
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: User email address (used for login)
 *             displayName:
 *               type: string
 *               nullable: true
 *               description: Display name for the user
 *             role:
 *               type: string
 *               enum: [ADMINISTRATOR, USER]
 *               description: User role (ADMINISTRATOR or USER)
 *             rights:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of permission rights granted to this user
 *           required:
 *             - email
 *             - displayName
 *             - role
 *             - rights
 */
export interface UserViewModel extends BaseViewModel {
  email: string;
  displayName: string | null;
  role: string;
  rights: UserRoleRight[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserTokenViewModel:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseViewModel'
 *         - type: object
 *           description: API token view model for programmatic authentication
 *           properties:
 *             name:
 *               type: string
 *               nullable: true
 *               description: Token name/description
 *             userId:
 *               type: string
 *               format: uuid
 *               description: ID of the user who owns this token
 *             token:
 *               type: string
 *               nullable: true
 *               description: The actual token value (only shown on creation)
 *             user:
 *               type: object
 *               description: Basic user information
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User email address
 *                 displayName:
 *                   type: string
 *                   nullable: true
 *                   description: User display name
 *           required:
 *             - name
 *             - userId
 */
export interface UserTokenViewModel extends BaseViewModel {
  name: string | null;
  userId: string;
  token?: string | null;
  user?: {
    email: string;
    displayName: string | null;
  };
}
