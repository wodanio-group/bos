import type { User, UserToken } from "~~/lib/prisma.server";
import type { UserViewModel, UserTokenViewModel, UserRole, UserRoleRight } from "../types/user";
import { z } from "zod";

export const UserRoleRights: {
  role: UserRole;
  rights: UserRoleRight[];
}[] = [
  { role: 'ADMIN', rights: [
    'user.all.view', 'user.all.create', 'user.all.edit', 'user.all.delete',
    'user.token.all.view', 'user.token.all.create', 'user.token.all.edit', 'user.token.all.delete',
    'pes.read', 'pes.interact', 'pes.delete',
    'timetracking.all.view', 'timetracking.all.edit', 'timetracking.all.delete',
    'contact.all.view', 'contact.all.create', 'contact.all.edit', 'contact.all.delete',
  ] },
  { role: 'USER', rights: [
    'timetracking.own.view', 'timetracking.own.create', 'timetracking.own.editnoneexported',
    'contact.all.view',
  ] },
  { role: 'NONE', rights: [] },
];

export const userRoleValidator = z.enum(['ADMIN', 'USER', 'NONE']).default('NONE');

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

export const userTokenToViewModel = (userToken: UserToken & { user?: User }, token?: string): UserTokenViewModel => {
  return {
    id: userToken.id,
    createdAt: (new Date(userToken.createdAt)).toISOString(),
    updatedAt: (new Date(userToken.updatedAt)).toISOString(),
    name: userToken.name,
    userId: userToken.userId,
    token,
    user: userToken.user ? {
      email: userToken.user.email,
      displayName: userToken.user.displayName,
    } : undefined,
  };
}

