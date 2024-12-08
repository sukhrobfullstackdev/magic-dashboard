import { PLAN_NAMES, PLAN_TERMS } from '@constants/pricing';
import { InvoicesQueryKey, PaymentMethodQueryKey, PricingQueryKey, QuoteQueryKey } from '@hooks/data/billing/keys';
import { Invoice, PaymentMethod, Pricing, Quote } from '@hooks/data/billing/types';
import { getBillingInfo, getInvoices } from '@services/billing';
import { getSubscriptionPricing, getSubscriptionQuote } from '@services/teams';
import { type QueryFunction } from '@tanstack/react-query';

export const makePaymentMethodFetcher = (): QueryFunction<PaymentMethod, PaymentMethodQueryKey> => async () => {
  const response = await getBillingInfo();

  if (!response.billing_info?.last_four_digits || !response.billing_info?.brand || !response.billing_info?.funding) {
    return null;
  }

  return {
    cardBrand: response.billing_info.brand,
    lastFourDigits: response.billing_info.last_four_digits,
    funding: response.billing_info.funding,
    name: response.billing_info?.name ?? null,
    billingAddress: {
      address: response.billing_info?.address?.line1 ?? null,
      city: response.billing_info?.address?.city ?? null,
      postalCode: response.billing_info?.address?.postal_code ?? null,
    },
  };
};

export const makeInvoicesFetcher =
  (): QueryFunction<Invoice[], InvoicesQueryKey> =>
  async ({ queryKey: [, { teamId }] }) => {
    const { data } = await getInvoices(teamId);

    if (!data) {
      throw new Error('No data found');
    }

    return data.invoices.map((v) => ({
      amount: v.amount,
      smsCount: v.sms_count,
      mauCount: v.mau_count,
      monthYear: v.month_year,
    }));
  };

export const makeQuoteFetcher =
  (): QueryFunction<Quote, QuoteQueryKey> =>
  async ({ queryKey: [, { teamId, productPriceKey }] }) => {
    const response = await getSubscriptionQuote(productPriceKey, teamId);

    return {
      isTrialAvailable: response.is_trial_available,
      trialEnd: response.trial_end,
      productName: response.product_name,
      billingTerm: response.billing_term,
      billingPrice: response.billing_price,
      proratedQuote: response.prorated_quote,
      currentPeriodEnd: response.current_period_end,
      quoteId: response.quote_id,
      quoteExpiresAt: response.quote_expires_at,
    };
  };

export const makePricingFetcher = (): QueryFunction<Pricing, PricingQueryKey> => async () => {
  const response = await getSubscriptionPricing();

  const legacyPricing = response
    .find(
      (plan) => plan.product_name === PLAN_NAMES.LEGACY || plan.product_name === PLAN_NAMES.LEGACY_DEDICATED_PRO_BUNDLE,
    )
    ?.prices.filter((v) => Boolean(v.product_price_key));
  const legacyMonthlyPrice = legacyPricing?.find((price) => price.billing_term === PLAN_TERMS.MONTHLY);

  const startupPricing = response
    .find((plan) => plan.product_name === PLAN_NAMES.STARTUP)
    ?.prices.filter((v) => Boolean(v.product_price_key));

  const startupMonthlyPrice = startupPricing?.find((price) => price.billing_term === PLAN_TERMS.MONTHLY);
  const startupYearlyPrice = startupPricing?.find((price) => price.billing_term === PLAN_TERMS.YEARLY);

  const growthPricing = response
    .find((plan) => plan.product_name === PLAN_NAMES.GROWTH)
    ?.prices.filter((v) => Boolean(v.product_price_key));

  const growthMonthlyPrice = growthPricing?.find((price) => price.billing_term === PLAN_TERMS.MONTHLY);
  const growthYearlyPrice = growthPricing?.find((price) => price.billing_term === PLAN_TERMS.YEARLY);

  return {
    [PLAN_NAMES.LEGACY]: {
      [PLAN_TERMS.MONTHLY]: {
        price: legacyMonthlyPrice?.billing_price ?? 0,
        productPriceKey: legacyMonthlyPrice?.product_price_key ?? '',
      },
    },
    [PLAN_NAMES.STARTUP]: {
      [PLAN_TERMS.MONTHLY]: {
        price: startupMonthlyPrice?.billing_price ?? 0,
        productPriceKey: startupMonthlyPrice?.product_price_key ?? '',
      },
      [PLAN_TERMS.YEARLY]: {
        price: startupYearlyPrice?.billing_price ?? 0,
        productPriceKey: startupYearlyPrice?.product_price_key ?? '',
      },
    },
    [PLAN_NAMES.GROWTH]: {
      [PLAN_TERMS.MONTHLY]: {
        price: growthMonthlyPrice?.billing_price ?? 0,
        productPriceKey: growthMonthlyPrice?.product_price_key ?? '',
      },
      [PLAN_TERMS.YEARLY]: {
        price: growthYearlyPrice?.billing_price ?? 0,
        productPriceKey: growthYearlyPrice?.product_price_key ?? '',
      },
    },
  };
};
