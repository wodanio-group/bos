import type { UserRole as OrmUserRole } from "@prisma/client";
import type { BaseViewModel } from "./base";

export type UserRole = OrmUserRole;

export type UserRoleRight = 
  'user.all.view' | 'user.all.create' | 'user.all.edit' | 'user.all.delete';

export interface UserViewModel extends BaseViewModel {
  email: string;
  displayName: string | null;
  role: string;
  rights: UserRoleRight[];
}
