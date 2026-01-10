import type { User, UserToken } from "~~/lib/prisma.server";
import type { UserViewModel, UserTokenViewModel, UserRole, UserRoleRight } from "../types/user";
import { z } from "zod";

export const UserRoleRights: {
  role: UserRole;
  rights: UserRoleRight[];
}[] = [
  { role: 'ADMIN', rights: [
    'option.all.view', 'option.all.edit',
    'user.all.view', 'user.all.create', 'user.all.edit', 'user.all.delete',
    'user.token.all.view', 'user.token.all.create', 'user.token.all.edit', 'user.token.all.delete',
    'task.all.view', 'task.all.create', 'task.all.edit', 'task.all.delete',
    'campaign.all.view', 'campaign.all.create', 'campaign.all.edit', 'campaign.all.delete',
    'leadstatus.all.view', 'leadstatus.all.create', 'leadstatus.all.edit', 'leadstatus.all.delete',
    'lead.all.view', 'lead.all.create', 'lead.all.edit', 'lead.all.delete',
    'opportunitystage.all.view', 'opportunitystage.all.create', 'opportunitystage.all.edit', 'opportunitystage.all.delete',
    'opportunity.all.view', 'opportunity.all.create', 'opportunity.all.edit', 'opportunity.all.delete',
    'quote.all.view', 'quote.all.create', 'quote.all.edit', 'quote.all.delete',
    'pes.read', 'pes.interact', 'pes.delete',
    'timetracking.all.view', 'timetracking.all.edit', 'timetracking.all.delete',
    'contact.all.view', 'contact.all.create', 'contact.all.edit', 'contact.all.delete',
  ] },
  { role: 'SALES', rights: [
    'task.all.view', 'task.all.create', 'task.all.edit', 'task.all.delete',
    'campaign.all.view',
    'lead.all.view', 'lead.all.create', 'lead.all.edit', 'lead.all.delete',
    'leadstatus.all.view',
    'opportunity.all.view', 'opportunity.all.create', 'opportunity.all.edit', 'opportunity.all.delete',
    'opportunitystage.all.view',
    'quote.all.view', 'quote.all.create', 'quote.all.edit', 'quote.all.delete',
    'contact.all.view', 'contact.all.create', 'contact.all.edit', 'contact.all.delete',
    'timetracking.own.view', 'timetracking.own.create', 'timetracking.own.editnoneexported',
  ] },
  { role: 'EMPLOYEE', rights: [
    'task.own.view', 'task.own.create', 'task.own.edit', 'task.own.delete',
    'timetracking.own.view', 'timetracking.own.create', 'timetracking.own.editnoneexported',
  ] },
  { role: 'USER', rights: [] },
  { role: 'NONE', rights: [] },
];

export const userRoleValidator = z.enum(['ADMIN', 'USER', 'SALES', 'EMPLOYEE', 'NONE']).default('NONE');

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

export const userDisplayName = (user: User | UserViewModel | { displayName?: string | null; email?: string | null }): string => {
  return user.displayName || user.email || '-';
}

