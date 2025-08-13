import type { User } from "@prisma/client";
import type { UserViewModel, UserRole, UserRoleRight } from "../types/user";

export const UserRoleRights: {
  role: UserRole;
  rights: UserRoleRight[];
}[] = [
  { role: 'ADMIN', rights: [
    'user.all.edit',
  ] },
];

export const getRightsByUserRole = (role: UserRole): UserRoleRight[] => UserRoleRights.find(o => o.role === role)?.rights ?? [];

export const hasRoleRights = (role: UserRole, rights: UserRoleRight[]): boolean => (getRightsByUserRole(role).filter(right => rights.includes(right)).length > 0);

export const userToViewModel = (user: User): UserViewModel => {
  return {
    id: user.id,
    createdAt: (new Date(user.createdAt)).toISOString(),
    updatedAt: (new Date(user.updatedAt)).toISOString(),
    displayName: user.displayName,
    role: user.role,
    rights: getRightsByUserRole(user.role),
  };
}

