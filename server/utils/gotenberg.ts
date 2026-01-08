export const getGotenbergCredentials = (): ({ url: string, username?: string, password?: string } | null) => {
  const runtimeConfig = useRuntimeConfig();
  const url = filterString(runtimeConfig.gotenberg.url),
        username = filterString(runtimeConfig.gotenberg.username),
        password = filterString(runtimeConfig.gotenberg.password);
  return url !== null
    ? { url, username: username ?? undefined, password: password ?? undefined }
    : null;
};

export const generatePdfFromHtml = async (html: string, opts?: {
  filename?: string,
  paperWidth?: number,
  paperHeight?: number,
  marginTop?: number,
  marginBottom?: number,
  marginLeft?: number,
  marginRight?: number,
  preferCssPageSize?: boolean,
  printBackground?: boolean,
  landscape?: boolean,
  scale?: number,
  nativePageRanges?: string,
}): Promise<Uint8Array> => {
  const credentials = getGotenbergCredentials();
  if (!credentials)
    throw new Error('No Gotenberg credentials given!');

  try {
    // Erstelle FormData für Gotenberg
    const formData = new FormData();

    // HTML als index.html hinzufügen (Gotenberg erwartet diesen Namen)
    const htmlBlob = new Blob([html], { type: 'text/html' });
    formData.append('files', htmlBlob, 'index.html');

    // Optionale Chromium-Optionen hinzufügen
    if (opts?.paperWidth) formData.append('paperWidth', opts.paperWidth.toString());
    if (opts?.paperHeight) formData.append('paperHeight', opts.paperHeight.toString());
    if (opts?.marginTop) formData.append('marginTop', opts.marginTop.toString());
    if (opts?.marginBottom) formData.append('marginBottom', opts.marginBottom.toString());
    if (opts?.marginLeft) formData.append('marginLeft', opts.marginLeft.toString());
    if (opts?.marginRight) formData.append('marginRight', opts.marginRight.toString());
    if (opts?.preferCssPageSize !== undefined) formData.append('preferCssPageSize', opts.preferCssPageSize.toString());
    if (opts?.printBackground !== undefined) formData.append('printBackground', opts.printBackground.toString());
    if (opts?.landscape !== undefined) formData.append('landscape', opts.landscape.toString());
    if (opts?.scale) formData.append('scale', opts.scale.toString());
    if (opts?.nativePageRanges) formData.append('nativePageRanges', opts.nativePageRanges);

    // Request-Header vorbereiten
    const headers: Record<string, string> = {};

    // Basic Auth wenn Credentials vorhanden
    if (credentials.username && credentials.password) {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    // PDF generieren via Gotenberg Chromium API
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

export const generatePdfFromUrl = async (url: string, opts?: {
  filename?: string,
  paperWidth?: number,
  paperHeight?: number,
  marginTop?: number,
  marginBottom?: number,
  marginLeft?: number,
  marginRight?: number,
  preferCssPageSize?: boolean,
  printBackground?: boolean,
  landscape?: boolean,
  scale?: number,
  nativePageRanges?: string,
  waitDelay?: string,
  waitForExpression?: string,
}): Promise<Uint8Array> => {
  const credentials = getGotenbergCredentials();
  if (!credentials)
    throw new Error('No Gotenberg credentials given!');

  try {
    const formData = new FormData();

    // URL hinzufügen
    formData.append('url', url);

    // Optionale Chromium-Optionen hinzufügen
    if (opts?.paperWidth) formData.append('paperWidth', opts.paperWidth.toString());
    if (opts?.paperHeight) formData.append('paperHeight', opts.paperHeight.toString());
    if (opts?.marginTop) formData.append('marginTop', opts.marginTop.toString());
    if (opts?.marginBottom) formData.append('marginBottom', opts.marginBottom.toString());
    if (opts?.marginLeft) formData.append('marginLeft', opts.marginLeft.toString());
    if (opts?.marginRight) formData.append('marginRight', opts.marginRight.toString());
    if (opts?.preferCssPageSize !== undefined) formData.append('preferCssPageSize', opts.preferCssPageSize.toString());
    if (opts?.printBackground !== undefined) formData.append('printBackground', opts.printBackground.toString());
    if (opts?.landscape !== undefined) formData.append('landscape', opts.landscape.toString());
    if (opts?.scale) formData.append('scale', opts.scale.toString());
    if (opts?.nativePageRanges) formData.append('nativePageRanges', opts.nativePageRanges);
    if (opts?.waitDelay) formData.append('waitDelay', opts.waitDelay);
    if (opts?.waitForExpression) formData.append('waitForExpression', opts.waitForExpression);

    // Request-Header vorbereiten
    const headers: Record<string, string> = {};

    // Basic Auth wenn Credentials vorhanden
    if (credentials.username && credentials.password) {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    // PDF generieren via Gotenberg Chromium API
    const response = await $fetch<ArrayBuffer>('/forms/chromium/convert/url', {
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
