import {
  StripeCardNumberInput,
  StripeCvcInput,
  StripeExpiryInput,
  StripeInput,
} from '@components/presentation/stripe-input/stripe-input';
import { Text } from '@magiclabs/ui-components';
import { Flex, HStack, Stack } from '@styled/jsx';
import { type FieldErrors, type UseFormRegister } from 'react-hook-form';

type StripeCardFormProps = {
  register: UseFormRegister<{
    cardholderName: string;
    billingAddress: string;
    city: string;
    zipCode: string;
  }>;
  errors: FieldErrors<{
    cardholderName: string;
    billingAddress: string;
    city: string;
    zipCode: string;
  }>;
  disabled?: boolean;
};

export const StripeCardForm = ({ register, errors, disabled }: StripeCardFormProps) => {
  return (
    <form>
      <Stack gap={6} pointerEvents={disabled ? 'none' : 'auto'} opacity={disabled ? 0.5 : 1}>
        <Stack gap={2}>
          <label htmlFor="cardholder-name">
            <Text size="sm" fontWeight="medium">
              Cardholder Name
            </Text>
          </label>
          <StripeInput
            id="cardholder-name"
            type="text"
            placeholder="Cardholder name"
            disabled={disabled}
            {...register('cardholderName')}
          />
          {errors?.cardholderName && (
            <Text size="sm" variant="error">
              {errors.cardholderName.message}
            </Text>
          )}
        </Stack>

        <Stack gap={2}>
          <label htmlFor="card-number">
            <Text size="sm" fontWeight="medium">
              Card Number
            </Text>
          </label>
          <StripeCardNumberInput id="card-number" />
        </Stack>

        <HStack alignItems="center" gap={4}>
          <Stack gap={2} flex={1}>
            <label htmlFor="exp-date">
              <Text size="sm" fontWeight="medium">
                Expiration date
              </Text>
            </label>
            <StripeExpiryInput id="exp-date" />
          </Stack>
          <Stack gap={2} flex={1}>
            <label htmlFor="cvc">
              <Text size="sm" fontWeight="medium">
                CVC
              </Text>
            </label>
            <StripeCvcInput id="cvc" />
          </Stack>
        </HStack>
        <Stack gap={2} flex={1}>
          <label htmlFor="address">
            <Text size="sm" fontWeight="medium">
              Billing address
            </Text>
          </label>
          <StripeInput id="address" type="text" placeholder="Billing address" {...register('billingAddress')} />
          {errors?.billingAddress && (
            <Text size="sm" variant="error">
              {errors.billingAddress.message}
            </Text>
          )}
        </Stack>

        <Flex gap={4}>
          <Stack gap={2} flex={1}>
            <label htmlFor="city">
              <Text size="sm" fontWeight="medium">
                City
              </Text>
            </label>
            <StripeInput id="city" type="text" placeholder="City" {...register('city')} />
            {errors?.city && (
              <Text size="sm" variant="error">
                {errors.city.message}
              </Text>
            )}
          </Stack>
          <Stack gap={2} flex={1}>
            <label htmlFor="zip-code">
              <Text size="sm" fontWeight="medium">
                Zip code
              </Text>
            </label>
            <StripeInput id="zip-code" type="text" placeholder="Zip code" {...register('zipCode')} />
            {errors?.zipCode && (
              <Text size="sm" variant="error">
                {errors.zipCode.message}
              </Text>
            )}
          </Stack>
        </Flex>
      </Stack>
    </form>
  );
};
