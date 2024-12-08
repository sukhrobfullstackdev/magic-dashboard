'use client';

import { HideRecaptchaBadge } from '@components/common/hide-recaptcha-badge';
import { UserDropdown } from '@components/layout/app-layout/user-dropdown';
import { ErrorBoundary } from '@components/partials/error-boundary/error-boundary';
import { MagicLogoButton } from '@components/partials/magic-logo-button/magic-logo-button';
import { stripePromise } from '@libs/stripe-sdk';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { Elements } from '@stripe/react-stripe-js';
import { Center, Flex, HStack, VStack } from '@styled/jsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, type ComponentProps } from 'react';

type Props = ComponentProps<'div'> & {
  payable?: boolean;
  iconOnly?: boolean;
};

const Resolved = ({ className, payable, iconOnly, children }: Props) => {
  return (
    <>
      <HideRecaptchaBadge />
      <Flex backgroundColor="surface.primary" direction="column" minH="100dvh" w="full" gap={0}>
        <HStack
          boxSizing="border-box"
          justifyContent="space-between"
          py={0}
          px={6}
          h={14}
          w="full"
          boxShadow={iconOnly ? 'none' : '0px 1px 0px 0px rgba(219, 217, 222, 0.50)'}
        >
          <MagicLogoButton />
          {!iconOnly && <UserDropdown />}
        </HStack>
        <VStack className={className} flex={1}>
          <Suspense
            fallback={
              <Center h="50vh">
                <LoadingSpinner />
              </Center>
            }
          >
            {payable ? <Elements stripe={stripePromise}>{children}</Elements> : <>{children}</>}
          </Suspense>
        </VStack>
      </Flex>
    </>
  );
};

export const HeaderOnlyLayout = (props: Props) => {
  const router = useRouter();
  const search = useSearchParams();
  const startWith = search?.get('startWith');

  return (
    <ErrorBoundary
      fallback={() => {
        router.push(startWith ? `/login?${new URLSearchParams({ startWith })}` : '/login');
        return null;
      }}
    >
      <Suspense>
        <Resolved {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};
