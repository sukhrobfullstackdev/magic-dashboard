import { type CARD_BRANDS } from '@constants/card-brands';
import { PLAN_NAMES, PLAN_TERMS } from '@constants/pricing';

export type CardBrand = (typeof CARD_BRANDS)[keyof typeof CARD_BRANDS];

// RETURN TYPES
export type PaymentMethod = {
  cardBrand: CardBrand;
  lastFourDigits: string;
  funding: string;
  name: string | null;
  billingAddress: {
    address: string | null;
    city: string | null;
    postalCode: string | null;
  };
} | null;

export type Invoice = {
  amount: number;
  smsCount: number;
  mauCount: number;
  monthYear: string;
};

export type Quote = {
  isTrialAvailable: boolean;
  trialEnd: number;
  productName: string;
  billingTerm: string;
  billingPrice: number;
  proratedQuote: number;
  currentPeriodEnd: number;
  quoteId: string;
  quoteExpiresAt: number;
};

export type Pricing = {
  [PLAN_NAMES.LEGACY]: {
    [PLAN_TERMS.MONTHLY]: {
      price: number;
      productPriceKey: string;
    };
  };
  [PLAN_NAMES.STARTUP]: {
    [PLAN_TERMS.MONTHLY]: {
      price: number;
      productPriceKey: string;
    };
    [PLAN_TERMS.YEARLY]: {
      price: number;
      productPriceKey: string;
    };
  };
  [PLAN_NAMES.GROWTH]: {
    [PLAN_TERMS.MONTHLY]: {
      price: number;
      productPriceKey: string;
    };
    [PLAN_TERMS.YEARLY]: {
      price: number;
      productPriceKey: string;
    };
  };
};

// PARAMS
export type GetInvoicesParams = {
  teamId: string;
};

export type GetPaymentMethodParams = {
  userId: string;
};

export type GetQuoteParams = {
  teamId: string;
  productPriceKey: string;
};

export type UpsertStripeCardParams = {
  cardholderName: string;
  billingAddress: string;
  city: string;
  zipCode: string;
};
