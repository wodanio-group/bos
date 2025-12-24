import type { OpportunityStageViewModel, OpportunityViewModel, OpportunityStatus, OpportunityRecurringUnit } from "../types/opportunity";
import type { OpportunityStage, Opportunity } from "~~/lib/prisma.server";
import { z } from "zod";

export const opportunityStatusValidator = z.enum(['OPEN', 'WON', 'LOST']);

export const opportunityRecurringUnitValidator = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY']);

export const OpportunityStatuses: OpportunityStatus[] = [
  'OPEN',
  'WON',
  'LOST'
];

export const OpportunityRecurringUnits: OpportunityRecurringUnit[] = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'HALF_YEARLY',
  'ANNUALLY'
];

export const opportunityStageToViewModel = (item: OpportunityStage): OpportunityStageViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    alias: item.alias,
    name: item.name,
    default: item.default,
    order: item.order,
  };
}

export const opportunityToViewModel = (item: Opportunity): OpportunityViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    name: item.name,
    description: item.description,
    amount: item.amount,
    recurringAmount: item.recurringAmount,
    recurringCount: item.recurringCount,
    recurringUnit: item.recurringUnit,
    probabilityPercent: item.probabilityPercent,
    status: item.status,
    opportunityStageId: item.opportunityStageId,
    companyId: item.companyId,
    personId: item.personId,
    leadId: item.leadId,
    ownerId: item.ownerId,
  };
}
