import { useAnalytics } from '@components/hooks/use-analytics';
import { CardBrandLogo } from '@components/partials/card-brand-logo/card-brand-logo';
import { StripeCardForm } from '@components/partials/stripe-card-form/stripe-card-form';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { DD_MESSAGES } from '@constants/dd-messages';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlan } from '@hooks/common/use-plan';
import { usePaymentMethodSuspenseQuery, useUpsertStripeCardMutation } from '@hooks/data/billing';
import { billingQueryKeys } from '@hooks/data/billing/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { getMonthDateDisplayString } from '@libs/monthInfo';
import { Button, Card, IcoWarningFill, Text, useToast } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { Suspense, useEffect, useState, type ComponentProps } from 'react';
import { useForm } from 'react-hook-form';
import Skeleton from 'react-loading-skeleton';
import { z } from 'zod';

export const paymentMethodSchema = z.object({
  cardholderName: z.string().min(1),
  billingAddress: z.string().min(1),
  city: z.string().min(1),
  zipCode: z
    .string()
    .min(3)
    .max(10)
    .refine((value) => /^[a-z0-9][a-z0-9\- ]{1,8}[a-z0-9]$/i.test(value), {
      message: 'Invalid zip code',
    }),
});

export type PaymentMethodData = z.infer<typeof paymentMethodSchema>;

type Props = Omit<ComponentProps<'div'>, 'ref'> & {
  mandatory?: boolean;
};

const Fallback = () => {
  return (
    <Card className={css({ p: 8 })}>
      <Stack gap={8}>
        <HStack alignItems="center" justifyContent="space-between">
          <Text.H4 fontWeight="semibold">Payment Method</Text.H4>
        </HStack>
        <Stack gap={8}>
          <Skeleton count={3} height={24} width={200} />
          <Skeleton count={3} height={24} width={200} />
        </Stack>
      </Stack>
    </Card>
  );
};

const Resolved = ({ mandatory = false, ...rest }: Props) => {
  const { createToast } = useToast();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { plan } = usePlan({
    teamId: userInfo.teamId,
  });

  const { data: paymentMethod } = usePaymentMethodSuspenseQuery(
    billingQueryKeys.paymentMethod({
      userId: userInfo.id,
    }),
  );
  const [isEdit, setIsEdit] = useState(mandatory && !paymentMethod);
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
        error as Error,
      );
      createToast({
        message: 'Failed to add payment method',
        variant: 'error',
      });
    },
  });

  const {
    handleSubmit,
    setError,
    register,
    formState: { isSubmitting, errors },
    setValue,
  } = useForm<PaymentMethodData>({
    resolver: zodResolver(paymentMethodSchema),
  });

  const onSubmit = handleSubmit(async (formData) => {
    trackAction(ANALYTICS_ACTION_NAMES.CLICK_SAVE_TO_UPDATE_PAYMENT_METHOD);

    try {
      await upsertStripeCard(formData);

      setIsEdit(false);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  });

  useEffect(() => {
    if (isEdit) {
      setValue('cardholderName', paymentMethod?.name ?? '');
      setValue('billingAddress', paymentMethod?.billingAddress?.address ?? '');
      setValue('city', paymentMethod?.billingAddress?.city ?? '');
      setValue('zipCode', paymentMethod?.billingAddress?.postalCode ?? '');
    }
  }, [isEdit, paymentMethod, setValue]);

  return (
    <Card {...rest}>
      <Stack gap={8}>
        <HStack justifyContent="space-between">
          <Text.H4 fontWeight="semibold">Payment Method</Text.H4>
          {isEdit ? (
            <HStack justifyContent="end" gap={4}>
              {(!mandatory || paymentMethod) && (
                <Button variant="text" label="Cancel" onPress={() => setIsEdit(false)} disabled={isSubmitting} />
              )}
              <Button label="Save" onPress={() => onSubmit()} disabled={isSubmitting} validating={isSubmitting} />
            </HStack>
          ) : (
            <Button variant="text" label="Edit" onPress={() => setIsEdit(true)} />
          )}
        </HStack>
        {plan.payment.status !== 'OK' && (
          <HStack gap={4} bg="negative.lightest" p={4} rounded="2xl">
            <IcoWarningFill width={24} height={24} color={token('colors.negative.darker')} />
            <Text variant="error">
              <b>Payment failed.</b> Update your payment method{' '}
              {plan.payment.finalAttemptData && (
                <>
                  by <b>{getMonthDateDisplayString(plan.payment.finalAttemptData)}</b>
                </>
              )}{' '}
              to maintain service.{' '}
              {plan.payment.nextAttemptDate && (
                <>Next automated billing attempt: {getMonthDateDisplayString(plan.payment.nextAttemptDate)}.</>
              )}
            </Text>
          </HStack>
        )}

        {isEdit && <StripeCardForm register={register} errors={errors} disabled={isSubmitting} />}
        {!isEdit && paymentMethod && (
          <Stack gap={8}>
            <Stack gap={2}>
              <Text size="sm" fontColor="text.tertiary" fontWeight="medium">
                Card details
              </Text>
              <Text>{paymentMethod?.name ?? '(Untitled)'}</Text>
              <HStack alignItems="center" gap={3}>
                <Text size="sm">••• {paymentMethod.lastFourDigits}</Text>
                <CardBrandLogo cardBrand={paymentMethod.cardBrand} />
              </HStack>
            </Stack>
            <Stack gap={2}>
              <Text size="sm" fontColor="text.tertiary" fontWeight="medium">
                Billing address
              </Text>
              <Text>{paymentMethod.billingAddress.address}</Text>
              <Text>
                {paymentMethod.billingAddress.city}, {paymentMethod.billingAddress.postalCode}
              </Text>
            </Stack>
          </Stack>
        )}
        {!isEdit && !paymentMethod && <Text fontColor="text.tertiary">No payment method on file</Text>}
      </Stack>
    </Card>
  );
};

export const PaymentMethodCard = (props: Props) => {
  return (
    <Suspense fallback={<Fallback />}>
      <Resolved {...props} />
    </Suspense>
  );
};
