import type { UserRole as OrmUserRole } from "@prisma/client";
import type { BaseViewModel } from "./base";

export type UserRole = OrmUserRole;

export type UserRoleRight = 
  'sevdesk.sync'
  | 'user.all.view' | 'user.all.create' | 'user.all.edit' | 'user.all.delete'
  | 'timetracking.all.view' | 'timetracking.all.edit' | 'timetracking.all.delete' | 'timetracking.own.view' | 'timetracking.own.create' | 'timetracking.own.editnoneexported'
  | 'contact.all.view' | 'contact.all.create' | 'contact.all.edit' | 'contact.all.delete';

export interface UserViewModel extends BaseViewModel {
  email: string;
  displayName: string | null;
  role: string;
  rights: UserRoleRight[];
}
