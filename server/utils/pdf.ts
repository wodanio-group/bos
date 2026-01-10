import { generatePdfFromHtml, GotenborgPaperFormat } from "./gotenberg";
import type { GotenbergGenerationOptions, GotenbergRenderedHtml } from "./gotenberg";
import path from "path";
import fs from "fs";
import { DateTime } from "luxon";
import Handlebars from "handlebars";
import juice from 'juice';
import { marked } from 'marked';
import { getTranslation } from "./i18n";

export enum PdfTemplateKey {
  QUOTE
};

export type PdfTemplateGenerationOptions = GotenbergGenerationOptions;

export interface PdfTemplate {
  templateName: string;
  headerTemplateName?: string;
  footerTemplateName?: string;
  styleName?: string;
  options?: PdfTemplateGenerationOptions;
};

export const PdfTemplates: Record<PdfTemplateKey, PdfTemplate> = {
  [PdfTemplateKey.QUOTE]: {
    templateName: 'quote',
    headerTemplateName: 'header',
    footerTemplateName: 'footer',
    styleName: 'style',
    options: {
      format: GotenborgPaperFormat.A4,
      marginTop: '180px',
      marginBottom: '140px',
      marginLeft: '0',
      marginRight: '0',
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      printBackground: true,
    },
  },
};

Handlebars.registerHelper('formatDate', function(date: string | Date) {
  if (!date)
    return '';
  const t = getTranslation();
  return DateTime.fromJSDate(new Date(date)).toFormat(t('format.date'));
});

Handlebars.registerHelper('formatNumber', function(num: number) {
  if (num === undefined || num === null) return '';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
});

Handlebars.registerHelper('formatPercent', function(rate: number) {
  if (rate === undefined || rate === null) return '';
  return (rate * 100).toFixed(0);
});

Handlebars.registerHelper('inc', function(value: number) {
  return value + 1;
});

Handlebars.registerHelper('or', function(...args: any[]) {
  args.pop();
  return args.some(arg => !!arg);
});

Handlebars.registerHelper('markdownToHtml', (html: any) => {
  return marked.parse(String(html), {
    breaks: true
  });
});

Handlebars.registerHelper('t', (key: string, data?: Record<string, string>) => {
  const t = getTranslation();
  return t(key, data);
});

const convertImageUrlToDataUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/png';
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Failed to convert image to data URL:', url, error);
    return url; // Return original URL on error
  }
};

const convertAssetsToDataUrls = async (html: string): Promise<string> => {
  // Find all src attributes with http/https URLs
  const srcRegex = /src=["'](https?:\/\/[^"']+)["']/gi;
  const matches = [...html.matchAll(srcRegex)];

  if (matches.length === 0) {
    return html;
  }

  // Convert all URLs to data URLs in parallel
  const conversions = await Promise.all(
    matches.map(async (match) => ({
      original: match[1],
      dataUrl: await convertImageUrlToDataUrl(match[1]!)
    }))
  );

  // Replace all URLs with data URLs
  let result = html;
  for (const { original, dataUrl } of conversions) {
    result = result.replace(new RegExp(original!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dataUrl);
  }

  return result;
};

export const generatePdfHtml = async (key: PdfTemplateKey, data?: any): Promise<GotenbergRenderedHtml> => {
  const basePath = path.join(process.cwd(), '/templates/pdf');
  const template = PdfTemplates[key];

  const html        = fs.readFileSync(path.join(basePath, `${template.templateName}.handlebars`), { encoding: 'utf-8' }),
        headerHtml  = (template.headerTemplateName && template.options?.displayHeaderFooter) 
          ? fs.readFileSync(path.join(basePath, `${template.headerTemplateName}.handlebars`), { encoding: 'utf-8' }) : null,
        footerHtml  = (template.footerTemplateName && template.options?.displayHeaderFooter) 
          ? fs.readFileSync(path.join(basePath, `${template.footerTemplateName}.handlebars`), { encoding: 'utf-8' }) : null,
        styleCss    = (template.styleName) 
          ? fs.readFileSync(path.join(basePath, `${template.styleName}.css`), { encoding: 'utf-8' }) : null;

  const compileHtml = (html: string, data?: any): string => {
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
    return Handlebars.compile(Handlebars.compile(html)(data))(data);
  };    

  const inlineCss = (html: string) => styleCss
    ? juice.inlineContent(html, styleCss, {
        applyStyleTags: true,
        removeStyleTags: true,
        preserveMediaQueries: true,
      })
    : html;

  return {
    html: inlineCss(compileHtml(html, data)),
    header: headerHtml ? await convertAssetsToDataUrls(inlineCss(compileHtml(headerHtml, data))) : undefined,
    footer: footerHtml ? await convertAssetsToDataUrls(inlineCss(compileHtml(footerHtml, data))) : undefined,
  };
};

export const generatePdf = async (key: PdfTemplateKey, data?: any, metadata?: Record<string, string>) => {
  const template = PdfTemplates[key];
  const html = await generatePdfHtml(key, data);
  return (await generatePdfFromHtml(html, { ...template.options!, metadata }));
};
