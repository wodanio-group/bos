import type { LeadStatusViewModel, LeadViewModel } from "../types/lead";
import type { LeadStatus, Lead } from "~~/lib/prisma.server";

export const leadStatusToViewModel = (item: LeadStatus): LeadStatusViewModel => {
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

export const leadToViewModel = (item: Lead): LeadViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    firstname: item.firstname,
    familyname: item.familyname,
    companyName: item.companyName,
    jobTitle: item.jobTitle,
    email: item.email,
    phoneNumber: item.phoneNumber,
    mobileNumber: item.mobileNumber,
    attrs: item.attrs as Record<string, any>,
    note: item.note,
    internalNote: item.internalNote,
    ownerId: item.ownerId,
    leadStatusId: item.leadStatusId,
    companyId: item.companyId,
    personId: item.personId,
    campaignId: item.campaignId,
  };
}

export const leadDisplayName = (item: Lead | LeadViewModel): string => {
  return [
    item.firstname,
    item.familyname,
    ...(item.companyName ? [`(${item.companyName})`] : []),
  ].filter(o => o).join(' ');
}
