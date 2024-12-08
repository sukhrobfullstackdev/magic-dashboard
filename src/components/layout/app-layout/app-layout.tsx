'use client';

import { useAnalytics } from '@components/hooks/use-analytics';
import { MobileDrawer } from '@components/layout/app-layout/mobile-drawer';
import { Sidebar } from '@components/layout/app-layout/sidebar';
import { TeamsDropdown } from '@components/layout/app-layout/teams-dropdown';
import { UpgradeButton } from '@components/layout/app-layout/upgrade-button';
import { UserDropdown } from '@components/layout/app-layout/user-dropdown';
import { CreateNewAppModal } from '@components/partials/create-new-app-modal/create-new-app-modal';
import { ErrorBoundary } from '@components/partials/error-boundary/error-boundary';

import { HideRecaptchaBadge } from '@components/common/hide-recaptcha-badge';
import { AuthOnly } from '@components/contexts/auth-only';
import { PaymentFailedButton } from '@components/layout/app-layout/payment-failed-button';
import { FallbackError } from '@components/partials/fallback-error/fallback-error';
import { FallbackLoading } from '@components/partials/fallback-loading/fallback-loading';
import { MagicLogoButton } from '@components/partials/magic-logo-button/magic-logo-button';
import { ProductLabel } from '@components/presentation/product-label/product-label';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { PASSPORT_APP } from '@constants/appInfo';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { Button, IcoOpenBook } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Divider, Flex, HStack, Stack } from '@styled/jsx';
import { Suspense, useCallback, type PropsWithChildren } from 'react';

type Props = PropsWithChildren;

function Resolved({ children }: Props) {
  const { trackAction } = useAnalytics();
  const { currentApp } = useCurrentApp();

  const showDocsLink = currentApp?.appType !== PASSPORT_APP;

  const trackNavigatedToDocs = useCallback(() => trackAction(ANALYTICS_ACTION_NAMES.CLICK_DOCS), [trackAction]);

  return (
    <>
      <HideRecaptchaBadge />
      <CreateNewAppModal />
      <Stack gap={0} position="relative">
        {/* top nav bar */}
        <HStack
          justifyContent="space-between"
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
        >
          {/* mobile only */}
          <MobileDrawer />

          {/* desktop only */}
          <HStack gap={4} mdDown={{ display: 'none' }}>
            <MagicLogoButton />
            <TeamsDropdown />
          </HStack>

          <HStack gap={0}>
            <PaymentFailedButton />
            <UpgradeButton />
            {showDocsLink && (
              <>
                <a
                  id="docs-link"
                  href="https://magic.link/docs/home/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackNavigatedToDocs}
                  className={css({ h: '1.625rem' })}
                >
                  <Button label="Docs" variant="text" textStyle="subtle">
                    <Button.LeadingIcon>
                      <IcoOpenBook />
                    </Button.LeadingIcon>
                  </Button>
                </a>
                <Divider mx={4} h={5} orientation="vertical" color="neutral.secondary" />
              </>
            )}
            <UserDropdown />
          </HStack>
        </HStack>

        <Flex>
          {/* side nav bar, desktop only */}
          <Stack
            bg="surface.primary"
            justify="space-between"
            minH="calc(100dvh - 56px)"
            zIndex={500}
            mdDown={{ display: 'none', minH: 'fit-content', zIndex: 120000 }}
          >
            <Box w={60} position="sticky" top={14} left={0}>
              <Sidebar />
            </Box>
            <Box position="sticky" w="fit-content" bottom={6} left={6}>
              <ProductLabel appType={currentApp?.appType} />
            </Box>
          </Stack>

          {/* main content */}
          <Stack gap={0} w="100%" maxW="87.5rem">
            <ErrorBoundary fallback={<FallbackError />}>
              <Suspense>{children}</Suspense>
            </ErrorBoundary>
          </Stack>
        </Flex>
      </Stack>
    </>
  );
}

export const AppLayout = (props: Props) => {
  return (
    <AuthOnly>
      <Suspense fallback={<FallbackLoading />}>
        <Resolved {...props} />
      </Suspense>
    </AuthOnly>
  );
};
