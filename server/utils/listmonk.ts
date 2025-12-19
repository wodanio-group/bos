import { useRuntimeConfig, filterString } from "#imports";
import { ofetch } from "ofetch";
import { uuid } from "zod";

export const getBaseConfig = (): ({ url: string } | null) => {
  const runtimeConfig = useRuntimeConfig(),
        url           = filterString(runtimeConfig.listmonk.url);
  return url ? { url } : null;
};

export const getImportListIds = (): string[] => {
  const runtimeConfig = useRuntimeConfig(),
        listIds = (filterString(runtimeConfig.listmonk.importListIds) ?? '')
          .split(/[,;]/)
          .map(s => filterString(s))
          .filter(s => s !== null)
          .filter(s => uuid().safeParse(s).success);
  return listIds;
};

export const addSubscription = async (listIds: string[], email: string, name?: string): Promise<void> => {
  const config = getBaseConfig();
  if (!config)
    throw new Error('listmonk config required');
  await ofetch<any>('/api/public/subscription', {
    baseURL: config.url,
    method: 'POST',
    body: {
      email, name,
      list_uuids: listIds,
    },
  });
};
