import type { HTTPMethod } from 'h3';

export const getPesCredentials = (): ({ url: string, apiToken: string } | null) => {
  const runtimeConfig = useRuntimeConfig();
  const url = filterString(runtimeConfig.pes.url),
        apiToken = filterString(runtimeConfig.pes.apiToken);
  return (url !== null && apiToken !== null)
    ? { url, apiToken }
    : null;
};

export const pesBaseRequest = async <T = any>(path: string, method: HTTPMethod = 'GET', opts?: {
  query?: Record<string, any>,
  body?: any,
}): Promise<T> => {
  const credentials = getPesCredentials();
  if (!credentials)
    throw new Error('No PES credentials given!');
  try {
    return (await $fetch<T>(path, {
      baseURL: credentials.url,
      method,
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`
      },
      query: opts?.query ?? undefined,
      body: opts?.body ?? undefined,
    }));
  } catch (e: any) {
    throw e;
  }
};

