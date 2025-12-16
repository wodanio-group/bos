import type { UserRole as OrmUserRole } from "~~/lib/prisma.server";
import type { BaseViewModel } from "./base";

export type UserRole = OrmUserRole;

export type UserRoleRight = 
  'user.all.view' | 'user.all.create' | 'user.all.edit' | 'user.all.delete'
  | 'user.token.all.view' | 'user.token.all.create' | 'user.token.all.edit' | 'user.token.all.delete'
  | 'user.token.own.view' | 'user.token.own.create' | 'user.token.own.edit' | 'user.token.own.delete'
  | 'pes.read' | 'pes.interact' | 'pes.delete'
  | 'timetracking.all.view' | 'timetracking.all.edit' | 'timetracking.all.delete' | 'timetracking.own.view' | 'timetracking.own.create' | 'timetracking.own.editnoneexported'
  | 'contact.all.view' | 'contact.all.create' | 'contact.all.edit' | 'contact.all.delete';

export interface UserViewModel extends BaseViewModel {
  email: string;
  displayName: string | null;
  role: string;
  rights: UserRoleRight[];
}

export interface UserTokenViewModel extends BaseViewModel {
  name: string | null;
  userId: string;
  token?: string | null;
  user?: {
    email: string;
    displayName: string | null;
  };
}
