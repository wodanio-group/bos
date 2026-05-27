import type { ProjectViewModel, ProjectMemberViewModel, ProjectNoteViewModel, ProjectStatus, ProjectMemberRole } from "../types/project";
import type { Project, ProjectMember, ProjectNote, User, Company } from "~~/lib/prisma.server";
import { z } from "zod";
import { contactNoteTypeValidator } from "./contact";

export const projectStatusValidator = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT');

export const projectMemberRoleValidator = z.enum(['MANAGER', 'MEMBER']).default('MEMBER');

export const projectNoteValidator = z.object({
  type: contactNoteTypeValidator,
  timestamp: z.iso.datetime().optional().nullable(),
  content: z.string().trim(),
});

export const ProjectStatuses: ProjectStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

export const ProjectMemberRoles: ProjectMemberRole[] = ['MANAGER', 'MEMBER'];

export const projectNoteToViewModel = (note: ProjectNote): ProjectNoteViewModel => ({
  id: note.id,
  createdAt: new Date(note.createdAt).toISOString(),
  updatedAt: new Date(note.updatedAt).toISOString(),
  type: note.type,
  timestamp: note.timestamp ? new Date(note.timestamp).toISOString() : null,
  content: note.content,
});

export const projectMemberToViewModel = (member: ProjectMember & { user: User }): ProjectMemberViewModel => ({
  id: member.id,
  createdAt: new Date(member.createdAt).toISOString(),
  updatedAt: new Date(member.updatedAt).toISOString(),
  role: member.role,
  userId: member.userId,
  userEmail: member.user.email,
  userDisplayName: member.user.displayName,
});

export const projectToViewModel = (
  project: Project & { members: (ProjectMember & { user: User })[]; notes: ProjectNote[]; company?: Company | null }
): ProjectViewModel => ({
  id: project.id,
  createdAt: new Date(project.createdAt).toISOString(),
  updatedAt: new Date(project.updatedAt).toISOString(),
  name: project.name,
  status: project.status,
  description: project.description,
  companyId: project.companyId,
  companyName: project.company?.name ?? null,
  members: project.members.map(projectMemberToViewModel),
  notes: project.notes.map(projectNoteToViewModel),
});

export const projectDisplayName = (project: { name: string }): string => project.name;
