'use client';

import { HideRecaptchaBadge } from '@components/common/hide-recaptcha-badge';
import { AuthOnly } from '@components/contexts/auth-only';
import { UserDropdown } from '@components/layout/app-layout/user-dropdown';
import { AccountSideNav } from '@components/partials/account-side-nav';
import { ErrorBoundary } from '@components/partials/error-boundary/error-boundary';
import { FallbackError } from '@components/partials/fallback-error/fallback-error';
import { stripePromise } from '@libs/stripe-sdk';
import { Button, IcoArrowLeft } from '@magiclabs/ui-components';
import { Elements } from '@stripe/react-stripe-js';
import { Box, Flex, HStack, Stack } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { Suspense, type PropsWithChildren } from 'react';

type Props = PropsWithChildren;

const Resolved = ({ children }: Props) => {
  const { push } = useRouter();

  const handleBackToAllApps = () => {
    push('/app/all_apps');
  };

  return (
    <>
      <HideRecaptchaBadge />
      <Stack gap={0} position="relative">
        {/* top nav bar */}
        <HStack
          position="sticky"
          top={0}
          left={0}
          w="full"
          zIndex={997}
          h={14}
          bg="surface.primary"
          px={6}
          boxSizing="border-box"
          boxShadow="0px 1px 0px 0px rgba(189, 189, 189, 0.30)"
          justifyContent="space-between"
        >
          <Button size="sm" variant="text" textStyle="neutral" label="All Apps" onPress={handleBackToAllApps}>
            <Button.LeadingIcon>
              <IcoArrowLeft />
            </Button.LeadingIcon>
          </Button>

          <UserDropdown />
        </HStack>

        <Flex gap={0} flex={1} mdDown={{ flexDir: 'column' }}>
          {/* side nav bar */}
          <Stack gap={0} minH="calc(100dvh - 56px)" bg="surface.primary" mdDown={{ minH: 'fit-content' }}>
            <Box w="full" position="sticky" top={14} left={0}>
              <AccountSideNav />
            </Box>
          </Stack>

          {/* main content */}
          <Stack gap={0} flex={1} maxW="75rem">
            <ErrorBoundary fallback={<FallbackError />}>
              <Suspense>
                <Elements stripe={stripePromise}>{children}</Elements>
              </Suspense>
            </ErrorBoundary>
          </Stack>
        </Flex>
      </Stack>
    </>
  );
};

export const AccountLayout = (props: Props) => {
  return (
    <AuthOnly>
      <Resolved {...props} />
    </AuthOnly>
  );
};
