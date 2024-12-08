'use client';

import { useAnalytics } from '@components/hooks/use-analytics';
import { ChangePlan } from '@components/partials/change-plan';
import { CloseButton } from '@components/partials/close-button';
import {
  paymentMethodSchema,
  type PaymentMethodData,
} from '@components/partials/payment-method-card/payment-method-card';
import { FeatureList } from '@components/partials/plan-tier-cards/feature-list/feature-list';
import { StripeCardForm } from '@components/partials/stripe-card-form/stripe-card-form';
import { PassportTooltipInfo } from '@components/views/billing-view/plan-info-card';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { DD_MESSAGES } from '@constants/dd-messages';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpsertStripeCardMutation } from '@hooks/data/billing';
import { logger } from '@libs/datadog';
import { Button, Card, Text, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Divider, Flex, HStack, Stack, VStack } from '@styled/jsx';
import { flex } from '@styled/patterns';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

export const GetStartedWithFreeView = () => {
  const { push } = useRouter();
  const { createToast } = useToast();
  const { trackAction } = useAnalytics();

  const { mutateAsync: upsertStripeCard } = useUpsertStripeCardMutation({
    onSuccess: () => {
      trackAction('payment method added');
    },
    onError: (error, params, context) => {
      logger.error(
        DD_MESSAGES.FAILED_TO_UPSERT_PAYMENT_METHOD,
        {
          params,
          context,
        },
        error,
      );
      createToast({
        message: 'Failed to add payment method',
        variant: 'error',
      });
    },
  });

  // TODO: Check if a user is from pricing page
  const isFromPricingPage = false;

  const {
    handleSubmit,
    setError,
    register,
    formState: { isSubmitting, errors },
  } = useForm<PaymentMethodData>({
    resolver: zodResolver(paymentMethodSchema),
  });

  const onSubmit = handleSubmit(async (formData) => {
    trackAction(ANALYTICS_ACTION_NAMES.CLICK_START_WITH_FREE);

    try {
      await upsertStripeCard(formData);

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

  return (
    <VStack gap={8}>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Stack gap={2} maxW="855px">
          <Text.H3>Get Started with Developer</Text.H3>
          <Text size="lg" fontColor="text.tertiary">
            Basic access for individual developers, ideal for small-scale projects with essential features and limited
            support.
          </Text>
        </Stack>
        <CloseButton onClick={handleClose} />
      </Flex>

      <Flex w="full" justifyContent="center" gap={6} mdDown={{ flexDirection: 'column' }}>
        <Card className={css({ p: 8, flex: 1, maxW: '466px', mdDown: { maxW: 'full' } })}>
          <Stack gap={8}>
            <Text.H4 fontWeight="semibold">Payment Method</Text.H4>
            <StripeCardForm register={register} errors={errors} disabled={isSubmitting} />
          </Stack>
        </Card>

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
              <Text.H4 fontWeight="semibold">Developer</Text.H4>
              <ChangePlan />
            </HStack>
            <FeatureList
              gap="lg"
              features={[
                {
                  description: 'Up to 1,000 Monthly Active Wallets',
                  tooltip: (
                    <>
                      First 1,000 MAWs are free, then each additional MAW costs 5¢.
                      <PassportTooltipInfo />
                    </>
                  ),
                },
                {
                  description: 'Up to 100 text messages each month',
                },
              ]}
            />
          </Stack>

          <Divider color="neutral.tertiary" />

          <Stack gap={6} p={8} pt={6}>
            <Stack gap={4}>
              <HStack justifyContent="space-between">
                <Text size="sm" fontColor="text.tertiary">
                  Total due today
                </Text>
                <Text.H4 fontWeight="semibold">$0</Text.H4>
              </HStack>
            </Stack>
            <Button
              label="Start with Developer"
              onPress={() => onSubmit()}
              disabled={isSubmitting}
              validating={isSubmitting}
              expand
            />
            {isFromPricingPage && <Button variant="text" size="sm" label="Skip for now" onPress={handleClose} />}
          </Stack>
        </Card>
      </Flex>
    </VStack>
  );
};
