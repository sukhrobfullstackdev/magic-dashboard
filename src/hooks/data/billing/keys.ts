import { GetInvoicesParams, GetPaymentMethodParams, GetQuoteParams } from '@hooks/data/billing/types';
import { type QueryKey } from '@tanstack/react-query';

// KEYS
export const billingQueryKeys = {
  base: ['billing'] as QueryKey,

  paymentMethod: (params: GetPaymentMethodParams) => [[...billingQueryKeys.base, 'paymentMethod'], params] as const,
  invoices: (params: GetInvoicesParams) => [[...billingQueryKeys.base, 'invoices'], params] as const,
  quote: (params: GetQuoteParams) => [[...billingQueryKeys.base, 'quote'], params] as const,
  pricing: () => [[...billingQueryKeys.base, 'pricing']] as const,
};

// QUERY KEYS
export type PaymentMethodQueryKey = ReturnType<typeof billingQueryKeys.paymentMethod>;

export type InvoicesQueryKey = ReturnType<typeof billingQueryKeys.invoices>;

export type QuoteQueryKey = ReturnType<typeof billingQueryKeys.quote>;

export type PricingQueryKey = ReturnType<typeof billingQueryKeys.pricing>;
