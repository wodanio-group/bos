import yaml from "yaml";
import fs from "fs";
import path from "path";

export const getTranslationConfig = () => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public.i18n;
};

export const getTranslationFileContent = (code: string, fallbackCode?: string): any | null => {
  const readFileByCode = (code: string): string | null => {
    const filePath = path.join(process.cwd(), '/i18n/locales', `${code}.yml`);
    if (!fs.existsSync(filePath))
      return null;
    return fs.readFileSync(filePath, { encoding: 'utf8' });
  };
  const rawContent = readFileByCode(code)
    ?? (fallbackCode ? readFileByCode(fallbackCode) : null);
  return rawContent ? yaml.parse(rawContent) : null;
};

export const getTranslationLocal = (code?: string) => {
  const runtimeConfig = useRuntimeConfig(),
        config = getTranslationConfig();
  if (!config.locales.find((l: any) => l?.code === (code ?? runtimeConfig.public.local)))
    return config.defaultLocale;
  return (code ?? runtimeConfig.public.local);
};

export const getTranslation = (code?: string): ((key: string, data?: Record<string, string>) => string) => {
  const config = getTranslationConfig(),
        local = getTranslationLocal(code);
  const fileContent = getTranslationFileContent(local, config.defaultLocale) ?? {};
  return (key: string, data?: Record<string, string>): string => {
    let value = filterString(key.split('.').reduce((obj, k) => obj?.[k], fileContent)) ?? key;
    for (const [k, v] of Object.entries(data ?? {}))
      value = value.replaceAll(`{${k}}`, v);
    return value;
  };
};
