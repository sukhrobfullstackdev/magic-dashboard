import { DEFAULT_RQ_SUSPENSE_CONFIG } from '@constants/react-query-conf';
import {
  makeInvoicesFetcher,
  makePaymentMethodFetcher,
  makePricingFetcher,
  makeQuoteFetcher,
} from '@hooks/data/billing/fetcher';
import {
  billingQueryKeys,
  InvoicesQueryKey,
  PaymentMethodQueryKey,
  PricingQueryKey,
  QuoteQueryKey,
} from '@hooks/data/billing/keys';
import type { Invoice, PaymentMethod, Pricing, Quote, UpsertStripeCardParams } from '@hooks/data/billing/types';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { userQueryKeys } from '@hooks/data/user/keys';
import { type UserInfo } from '@hooks/data/user/types';
import { getClientSecret } from '@services/billing';
import { type GetTeamPlanInfo } from '@services/teams';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
} from '@tanstack/react-query';

// QUERY HOOKS
export const usePaymentMethodSuspenseQuery = (
  queryKey: PaymentMethodQueryKey,
  config?: Omit<
    UseSuspenseQueryOptions<PaymentMethod, Error, PaymentMethod, PaymentMethodQueryKey>,
    'queryKey' | 'queryFn'
  >,
) => {
  const fetcher = makePaymentMethodFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useInvoicesSuspenseQuery = (
  queryKey: InvoicesQueryKey,
  config?: Omit<UseSuspenseQueryOptions<Invoice[], Error, Invoice[], InvoicesQueryKey>, 'queryKey' | 'queryFn'>,
) => {
  const fetcher = makeInvoicesFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useQuoteSuspenseQuery = (
  queryKey: QuoteQueryKey,
  config?: Omit<UseSuspenseQueryOptions<Quote, Error, Quote, QuoteQueryKey>, 'queryKey' | 'queryFn'>,
) => {
  const fetcher = makeQuoteFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    gcTime: 1000 * 60 * 3,
    ...config,
  });
};

export const usePricingSuspenseQuery = (
  queryKey: PricingQueryKey,
  config?: Omit<UseSuspenseQueryOptions<Pricing, Error, Pricing, PricingQueryKey>, 'queryKey' | 'queryFn'>,
) => {
  const fetcher = makePricingFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

// MUTATIONS
export const useUpsertStripeCardMutation = (
  config?: Omit<UseMutationOptions<void, Error, UpsertStripeCardParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();

  return useMutation({
    mutationFn: async (params: UpsertStripeCardParams) => {
      const userInfo = queryClient.getQueryData<UserInfo>(userQueryKeys.info());
      if (!userInfo) {
        throw new Error('User info not found.');
      }

      if (!stripe || !elements) {
        throw new Error('Stripe is not initialized.');
      }

      const cardNumberElement = elements.getElement(CardNumberElement);

      if (!cardNumberElement) {
        throw new Error('Card number is not initialized.');
      }

      const token = await stripe.createToken(cardNumberElement);
      if (token.error) {
        throw new Error(token.error.message);
      }

      const { client_secret: clientSecret } = await getClientSecret();
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: params.cardholderName,
            address: {
              city: params.city,
              line1: params.billingAddress,
              postal_code: params.zipCode,
            },
          },
        },
      });

      if (result.error) {
        throw new Error('Failed to confirm card setup.');
      }

      queryClient.setQueryData(
        teamQueryKeys.planInfo({
          teamId: userInfo.teamId,
        }),
        (prev: GetTeamPlanInfo) => ({
          ...prev,
          is_cc_attached: true,
        }),
      );

      await queryClient.refetchQueries({
        queryKey: billingQueryKeys.paymentMethod({ userId: userInfo.id }),
      });
    },
    ...config,
  });
};
