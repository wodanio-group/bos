import type { UserRole as OrmUserRole } from "@prisma/client";
import type { BaseViewModel } from "./base";

export type UserRole = OrmUserRole;

export type UserRoleRight = 
  'user.all.edit';

export interface UserViewModel extends BaseViewModel {
  displayName: string | null;
  role: string;
  rights: UserRoleRight[];
}
