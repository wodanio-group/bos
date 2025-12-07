import { getRouterParams, H3Event } from "h3";
import { z } from "zod";

export const stringToAlias = (str: string): string => {
  return str.trim().toLowerCase()
    .replaceAll(/\s/g, '-')
    .replaceAll('_', '-')
    .replaceAll('ä', 'ae')
    .replaceAll('ü', 'ue')
    .replaceAll('ö', 'oe')
    .split('')
    .filter(l => l.charCodeAt(0) === 45 || (l.charCodeAt(0) >= 48 && l.charCodeAt(0) <= 57) || (l.charCodeAt(0) >= 97 && l.charCodeAt(0) <= 122))
    .join('')
    .replaceAll(/-{2,}/g, '-');
}

export const getValidatedParamsId = (event: H3Event, validator?: z.ZodString): string | null => {
  const params = z.object({
    id: (validator ?? z.string().uuid())
  }).safeParse(getRouterParams(event));
  if (!params.success)
    return null;
  return params.data.id;
};

export const filterString = (str: string | string[] | null | undefined): string | null => {
  return filterStringExtended(str) ?? null;
};

export const filterStringExtended = (str: string | string[] | null | undefined): string | null | undefined => {
  if (str === undefined || str === 'undefined') return undefined;
  if (str === null || str === 'null') return null;
  if (Array.isArray(str)) str = str.join('');
  str = str.trim();
  return (str.length > 0) ? str : null;
};

