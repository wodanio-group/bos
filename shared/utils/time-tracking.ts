import type { TimeTrackingActivity } from "~~/lib/prisma.server";
import type { TimeTrackingActivityViewModel } from "../types/time-tracking";

export const timeTrackingActivityToViewModel = (item: TimeTrackingActivity): TimeTrackingActivityViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    user: item.userId,
    from: (new Date(item.from)).toISOString(),
    to: item.to ? (new Date(item.to)).toISOString() : null,
    duration: item.to ? ((new Date(item.to)).getTime() - (new Date(item.from)).getTime()) : -1,
    description: item.description ?? null,
    company: item.companyId ?? null,
    exportedAt: item.exportedAt ? (new Date(item.exportedAt)).toISOString() : null,
  };
}


