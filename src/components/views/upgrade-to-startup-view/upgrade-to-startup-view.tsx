'use client';

import { useAnalytics } from '@components/hooks/use-analytics';
import { ChangePlan } from '@components/partials/change-plan';
import { AnnualBillingToggle } from '@components/partials/checkout-card/annual-billing-toggle';
import { CloseButton } from '@components/partials/close-button';
import {
  PaymentMethodCard,
  paymentMethodSchema,
  type PaymentMethodData,
} from '@components/partials/payment-method-card/payment-method-card';
import { FeatureList } from '@components/partials/plan-tier-cards/feature-list/feature-list';
import { StripeCardForm } from '@components/partials/stripe-card-form/stripe-card-form';
import { PassportTooltipInfo } from '@components/views/billing-view/plan-info-card';
import { useStartupButtonCopy } from '@components/views/upgrade-to-startup-view/use-startup-button-copy';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { DD_MESSAGES } from '@constants/dd-messages';
import { PLAN_NAMES, PLAN_TERMS } from '@constants/pricing';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { usePlan } from '@hooks/common/use-plan';
import {
  usePaymentMethodSuspenseQuery,
  usePricingSuspenseQuery,
  useQuoteSuspenseQuery,
  useUpsertStripeCardMutation,
} from '@hooks/data/billing';
import { billingQueryKeys } from '@hooks/data/billing/keys';
import { useUpdateTeamPlanMutation } from '@hooks/data/teams';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { toUSD } from '@libs/to-usd';
import { Button, Card, Text, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Divider, Flex, HStack, Stack, VStack } from '@styled/jsx';
import { flex } from '@styled/patterns';
import { add, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

export const UpgradeToStartupView = () => {
  const { push } = useRouter();
  const { trackAction } = useAnalytics();
  const { createToast } = useToast();
  const { currentTeam } = useCurrentTeam();

  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { data: paymentMethod } = usePaymentMethodSuspenseQuery(
    billingQueryKeys.paymentMethod({
      userId: userInfo.id,
    }),
  );

  const { data: pricing } = usePricingSuspenseQuery(billingQueryKeys.pricing());

  const { data: monthlyQuote } = useQuoteSuspenseQuery(
    billingQueryKeys.quote({
      teamId: userInfo.teamId,
      productPriceKey: pricing[PLAN_NAMES.STARTUP][PLAN_TERMS.MONTHLY].productPriceKey,
    }),
  );
  const { data: yearlyQuote } = useQuoteSuspenseQuery(
    billingQueryKeys.quote({
      teamId: userInfo.teamId,
      productPriceKey: pricing[PLAN_NAMES.STARTUP][PLAN_TERMS.YEARLY].productPriceKey,
    }),
  );

  const { mutateAsync: upsertStripeCard } = useUpsertStripeCardMutation({
    onSuccess: () => {
      trackAction('payment method added');
    },
    onError: (error) => {
      logger.error(DD_MESSAGES.FAILED_TO_UPSERT_PAYMENT_METHOD, {}, error);
      createToast({
        message: 'Failed to add payment method',
        variant: 'error',
      });
    },
  });

  const { mutateAsync: updateTeamPlan } = useUpdateTeamPlanMutation({
    onSuccess: (_, params) => {
      trackAction('team plan updated', {
        params,
      });

      createToast({
        message: 'Plan Upgraded',
        variant: 'success',
      });
    },
    onError: (error, params, context) => {
      logger.error(DD_MESSAGES.FAILED_TO_UPDATE_TEAM_PLAN, { params, context }, error);

      createToast({
        message: 'Failed to upgrade plan',
        variant: 'error',
      });
    },
  });

  const {
    plan: { planName, planTerm, isCanceled, endedAt },
  } = usePlan({
    teamId: userInfo.teamId,
  });

  const [isToggle, setIsToggle] = useState(
    (planName === PLAN_NAMES.STARTUP && planTerm === PLAN_TERMS.YEARLY) || planName === PLAN_NAMES.GROWTH,
  );

  const { startupButtonCopy } = useStartupButtonCopy();

  const isToggleDisabled = useMemo(() => {
    return planName === PLAN_NAMES.GROWTH || planName === PLAN_NAMES.ENTERPRISE;
  }, [planName]);

  const isDisabled = useMemo(() => {
    if (planName === PLAN_NAMES.STARTUP && isCanceled) {
      return false;
    }
    if (planName === PLAN_NAMES.LEGACY && isCanceled) {
      return false;
    }

    return planName === PLAN_NAMES.ENTERPRISE || planName === PLAN_NAMES.GROWTH || planName === PLAN_NAMES.STARTUP;
  }, [planName, isCanceled]);

  const {
    handleSubmit,
    setError,
    register,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<PaymentMethodData>({
    resolver: zodResolver(paymentMethodSchema),
  });

  const onSubmit = handleSubmit(async (formData) => {
    trackAction(ANALYTICS_ACTION_NAMES.CLICK_TO_PURCHASE_START_UP_PLAN);

    try {
      if (!paymentMethod) {
        await upsertStripeCard(formData);
      }

      await updateTeamPlan({
        teamId: currentTeam.teamId,
        productPriceKey: isToggle
          ? pricing[PLAN_NAMES.STARTUP][PLAN_TERMS.YEARLY].productPriceKey
          : pricing[PLAN_NAMES.STARTUP][PLAN_TERMS.MONTHLY].productPriceKey,
        quoteId: isToggle ? yearlyQuote.quoteId : monthlyQuote.quoteId,
      });

      push('/account/billing');
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  });

  const handleClose = useCallback(() => {
    push('/account/billing');
  }, [push]);

  useEffect(() => {
    if (paymentMethod) {
      setValue('cardholderName', paymentMethod.name ?? '');
      setValue('billingAddress', paymentMethod.billingAddress.address ?? '');
      setValue('city', paymentMethod.billingAddress.city ?? '');
      setValue('zipCode', paymentMethod.billingAddress.postalCode ?? '');
    }
  }, [paymentMethod, setValue]);

  const handleToggleAnnualBilling = () => {
    setIsToggle((prev) => !prev);
  };

  return (
    <VStack gap={8}>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Stack gap={2} maxW="855px">
          <Text.H3>Upgrade to Startup</Text.H3>
          <Text size="lg" fontColor="text.tertiary">
            For professional developers and small teams who need higher usage limits and advanced features and support.
          </Text>
        </Stack>
        <CloseButton onClick={handleClose} />
      </Flex>

      <Flex w="full" justifyContent="center" gap={6} mdDown={{ flexDirection: 'column' }}>
        {/* payment method card */}
        {paymentMethod ? (
          <PaymentMethodCard className={css({ p: 8, flex: 1, maxW: '466px', mdDown: { maxW: 'full' } })} />
        ) : (
          <Card className={css({ p: 8, flex: 1, maxW: '466px', mdDown: { maxW: 'full' } })}>
            <Stack gap={8}>
              <Text.H4 fontWeight="semibold">Payment Method</Text.H4>
              <StripeCardForm register={register} errors={errors} disabled={isSubmitting} />
            </Stack>
          </Card>
        )}

        {/* checkout card */}
        <Card
          className={flex({
            direction: 'column',
            h: 'fit-content',
            w: '100%',
            maxWidth: '368px',
            mdDown: { maxW: 'full' },
          })}
          gapType="none"
          paddingType="none"
          expand
        >
          <Stack gap={6} p={8} pb={6}>
            <HStack justifyContent="space-between">
              <Text.H4 fontWeight="semibold">Startup</Text.H4>
              <ChangePlan />
            </HStack>
            <FeatureList
              gap="lg"
              features={[
                {
                  description: 'Up to 5,000 Monthly Active Wallets',
                  tooltip: (
                    <>
                      First 5,000 MAWs are free, then each additional MAW costs 5¢.
                      <PassportTooltipInfo />
                    </>
                  ),
                },
                {
                  description: 'Up to 100 text messages each month',
                },
              ]}
            />
            <AnnualBillingToggle
              checked={isToggle}
              onPress={handleToggleAnnualBilling}
              disabled={isDisabled || isSubmitting || isToggleDisabled}
            />
          </Stack>

          <Divider color="neutral.tertiary" />

          <Stack gap={6} p={8} pt={6}>
            <Stack gap={4}>
              <HStack justifyContent="space-between">
                <Text size="sm" fontColor="text.tertiary">
                  Total due on{' '}
                  {format(
                    isCanceled && endedAt
                      ? endedAt
                      : add(new Date(), {
                          days: 30,
                        }),
                    'MMM do',
                  )}
                </Text>
                <Text.H4 fontWeight="normal">
                  {isToggle
                    ? `${toUSD(pricing[PLAN_NAMES.STARTUP][PLAN_TERMS.YEARLY].price)}/year`
                    : `${toUSD(pricing[PLAN_NAMES.STARTUP][PLAN_TERMS.MONTHLY].price)}/mo`}
                </Text.H4>
              </HStack>
              {!isCanceled && (
                <HStack justifyContent="space-between">
                  <Text size="sm" fontColor="text.tertiary">
                    Total due today
                  </Text>
                  <Text.H4 fontWeight="semibold">
                    {isToggle ? `${toUSD(yearlyQuote.proratedQuote)}` : `${toUSD(monthlyQuote.proratedQuote)}`}
                  </Text.H4>
                </HStack>
              )}
            </Stack>
            <Button
              label={startupButtonCopy}
              onPress={() => onSubmit()}
              disabled={isDisabled || isSubmitting}
              validating={isSubmitting}
              expand
            />
          </Stack>
        </Card>
      </Flex>
    </VStack>
  );
};
