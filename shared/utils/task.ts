import type { TaskViewModel, TaskType } from "../types/task";
import type { Task } from "~~/lib/prisma.server";
import { z } from "zod";

export const taskTypeValidator = z.enum(['CALL', 'MAIL', 'ACTION', 'OTHER']);

export const TaskTypes: TaskType[] = [
  'CALL',
  'MAIL',
  'ACTION',
  'OTHER'
];

export const taskToViewModel = (item: Task): TaskViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    type: item.type,
    name: item.name,
    content: item.content,
    startAt: item.startAt ? (new Date(item.startAt)).toISOString() : null,
    dueDateAt: item.dueDateAt ? (new Date(item.dueDateAt)).toISOString() : null,
    doneAt: item.doneAt ? (new Date(item.doneAt)).toISOString() : null,
    userId: item.userId,
    companyId: item.companyId,
    personId: item.personId,
    leadId: item.leadId,
    opportunityId: item.opportunityId,
  };
}
