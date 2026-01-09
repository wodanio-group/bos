
export enum GotenborgPaperFormat {
  Letter = 'Letter',
  Legal = 'Legal',
  Tabloid = 'Tabloid',
  Ledger = 'Ledger',
  A0 = 'A0',
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
  A5 = 'A5',
  A6 = 'A6',
}

export interface GotenborgPaperDimensions {
  paperWidth: number;
  paperHeight: number;
}

export const GotenborgPaperFormatDimensions: Record<GotenborgPaperFormat, GotenborgPaperDimensions> = {
  [GotenborgPaperFormat.Letter]: { paperWidth: 8.5, paperHeight: 11 },
  [GotenborgPaperFormat.Legal]: { paperWidth: 8.5, paperHeight: 14 },
  [GotenborgPaperFormat.Tabloid]: { paperWidth: 11, paperHeight: 17 },
  [GotenborgPaperFormat.Ledger]: { paperWidth: 17, paperHeight: 11 },
  [GotenborgPaperFormat.A0]: { paperWidth: 33.1102, paperHeight: 46.811 },
  [GotenborgPaperFormat.A1]: { paperWidth: 23.3858, paperHeight: 33.1102 },
  [GotenborgPaperFormat.A2]: { paperWidth: 16.5354, paperHeight: 23.3858 },
  [GotenborgPaperFormat.A3]: { paperWidth: 11.6929, paperHeight: 16.5354 },
  [GotenborgPaperFormat.A4]: { paperWidth: 8.2677, paperHeight: 11.6929 },
  [GotenborgPaperFormat.A5]: { paperWidth: 5.8268, paperHeight: 8.2677 },
  [GotenborgPaperFormat.A6]: { paperWidth: 4.1339, paperHeight: 5.8268 },
};

export interface GotenbergRenderedHtml {
  html: string;
  header?: string;
  footer?: string;
}

export interface GotenbergGenerationOptions {
  format: GotenborgPaperFormat;
  marginTop?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  marginRight?: string | number;
  preferCSSPageSize?: boolean;
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  landscape?: boolean;
  scale?: number;
  metadata?: Record<string, string>;
}

export const getGotenbergCredentials = (): ({ url: string, username?: string, password?: string } | null) => {
  const runtimeConfig = useRuntimeConfig();
  const url = filterString(runtimeConfig.gotenberg.url),
        username = filterString(runtimeConfig.gotenberg.username),
        password = filterString(runtimeConfig.gotenberg.password);
  return url !== null
    ? { url, username: username ?? undefined, password: password ?? undefined }
    : null;
};

export const generatePdfFromHtml = async (
  html: GotenbergRenderedHtml,
  options?: GotenbergGenerationOptions,
): Promise<Uint8Array> => {
  const credentials = getGotenbergCredentials();
  if (!credentials)
    throw new Error('No Gotenberg credentials given!');

  const paperFormat     = options?.format ?? GotenborgPaperFormat.A4,
        paperDimensions = GotenborgPaperFormatDimensions[paperFormat];
  const finalOptions    = {
    ...options,
    ...paperDimensions,
  };

  try {
    const formData = new FormData();

    formData.append('files', new Blob([html.html], { type: 'text/html' }), 'index.html');
    if (html.header && options?.displayHeaderFooter)
      formData.append('files', new Blob([html.header], { type: 'text/html' }), 'header.html');
    if (html.footer && options?.displayHeaderFooter)
      formData.append('files', new Blob([html.footer], { type: 'text/html' }), 'footer.html');

    const internalOptionKeys = [
      'format',
      'displayHeaderFooter',
      'headerTemplate',
      'footerTemplate',
    ];
    for (const [key, value] of Object.entries(finalOptions)) {
      if (!internalOptionKeys.includes(key) && value !== undefined) {
        if (key === 'metadata') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {};

    if (credentials.username && credentials.password) {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    const response = await $fetch<ArrayBuffer>('/forms/chromium/convert/html', {
      baseURL: credentials.url,
      method: 'POST',
      headers,
      body: formData,
      responseType: 'arrayBuffer',
    });

    return new Uint8Array(response);
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: `PDF generation failed: ${e.message}`,
    });
  }
};
