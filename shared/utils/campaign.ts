import type { CampaignViewModel } from "../types/campaign";
import type { Campaign } from "~~/lib/prisma.server";

export const campaignToViewModel = (item: Campaign): CampaignViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    alias: item.alias,
    name: item.name,
    shortDescription: item.shortDescription,
    allowPublicCreation: item.allowPublicCreation,
  };
}
