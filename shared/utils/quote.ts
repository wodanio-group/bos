import type { QuoteViewModel, QuoteItemViewModel, QuoteStatus } from "../types/quote";
import type { Quote, QuoteItem } from "~~/lib/prisma.server";
import { DateTime } from "luxon";
import { z } from "zod";

export const quoteStatusValidator = z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']).default('DRAFT');

export const QuoteStatuses: QuoteStatus[] = [
  'DRAFT',
  'SENT',
  'ACCEPTED',
  'REJECTED'
];

export const quoteItemCreateValidator = z.object({
  quotePosition: z.number().int().min(0),
  title: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
  quantity: z.number().min(0),
  unit: z.string().trim().optional().nullable(),
  price: z.number(),
  taxRate: z.number().min(0).max(1),
});

export const quoteItemToViewModel = (item: QuoteItem): QuoteItemViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    quotePosition: item.quotePosition,
    title: item.title,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    taxRate: item.taxRate,
    subtotal: item.subtotal,
    tax: item.tax,
    total: item.total,
    quoteId: item.quoteId,
  };
};

export const quoteToViewModel = (item: Quote): QuoteViewModel => {
  return {
    id: item.id,
    createdAt: (new Date(item.createdAt)).toISOString(),
    updatedAt: (new Date(item.updatedAt)).toISOString(),
    status: item.status,
    quoteId: item.quoteId,
    quoteDate: DateTime.fromJSDate(item.quoteDate).toFormat('yyyy-LL-dd'),
    quoteValidUntil: item.quoteValidUntil ? DateTime.fromJSDate(item.quoteValidUntil).toFormat('yyyy-LL-dd') : null,
    introText: item.introText,
    outroText: item.outroText,
    subtotal: item.subtotal,
    tax: item.tax,
    total: item.total,
    companyId: item.companyId,
    ownerId: item.ownerId,
    quoteItems: ((item as any)?.quoteItems ?? []).map((o: any) => quoteItemToViewModel(o)),
  };
};

export const calculateQuoteItemTotals = (
  quantity: number,
  price: number,
  taxRate: number
): { subtotal: number; tax: number; total: number } => {
  const subtotal = quantity * price;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

export const calculateQuoteTotals = (
  items: Array<{ subtotal: number; tax: number; total: number }>
): { subtotal: number; tax: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = items.reduce((sum, item) => sum + item.tax, 0);
  const total = items.reduce((sum, item) => sum + item.total, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};
