import type { User } from "@prisma/client";
import type { UserViewModel, UserRole, UserRoleRight } from "../types/user";
import { z } from "zod";

export const UserRoleRights: {
  role: UserRole;
  rights: UserRoleRight[];
}[] = [
  { role: 'ADMIN', rights: [
    'sevdesk.sync',
    'user.all.view', 'user.all.create', 'user.all.edit', 'user.all.delete',
    'timetracking.all.view', 'timetracking.all.edit', 'timetracking.all.delete',
    'contact.all.view', 'contact.all.create', 'contact.all.edit', 'contact.all.delete',
  ] },
  { role: 'USER', rights: [
    'timetracking.own.view', 'timetracking.own.create', 'timetracking.own.editnoneexported',
  ] },
  { role: 'NONE', rights: [] },
];

export const userRoleValidator = z.enum(['ADMIN', 'NONE']).default('NONE');

export const getRightsByUserRole = (role: UserRole): UserRoleRight[] => UserRoleRights.find(o => o.role === role)?.rights ?? [];

export const hasRoleRights = (role: UserRole, rights: UserRoleRight[]): boolean => (getRightsByUserRole(role).filter(right => rights.includes(right)).length > 0);

export const userToViewModel = (user: User): UserViewModel => {
  return {
    id: user.id,
    createdAt: (new Date(user.createdAt)).toISOString(),
    updatedAt: (new Date(user.updatedAt)).toISOString(),
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    rights: getRightsByUserRole(user.role),
  };
}

