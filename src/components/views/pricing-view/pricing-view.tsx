'use client';

import { CloseButton } from '@components/partials/close-button';
import { ContactSales } from '@components/partials/contact-sales/contact-sales';
import { DeveloperProBundlePlanCard } from '@components/partials/plan-tier-cards/developer-pro-bundle-plan-card/developer-pro-bundle-plan-card';
import { FreePlanCard } from '@components/partials/plan-tier-cards/free-plan-card/free-plan-card';
import { GrowthPlanCard } from '@components/partials/plan-tier-cards/growth-plan-card/growth-plan-card';
import { StartupPlanCard } from '@components/partials/plan-tier-cards/startup-plan-card/startup-plan-card';
import { useAllApps } from '@hooks/common/use-all-apps';
import { useUniversalProBundle } from '@hooks/common/use-universal-pro-bundle';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Button, Callout, IcoExternalLink, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Flex, HStack, Stack, VStack } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const PricingView = () => {
  const router = useRouter();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { universalProBundle } = useUniversalProBundle({
    teamId: userInfo.teamId,
  });
  const { passportApps } = useAllApps();

  const handleClose = useCallback(() => {
    router.push('/account/billing');
  }, [router]);

  return (
    <VStack>
      <VStack width="full" maxW="1024px">
        <Stack w="full" mb={4} gap={4}>
          <HStack alignItems="flex-start" justifyContent="space-between" w="full">
            <VStack alignItems="flex-start" gap={2}>
              <Text.H3>Select a plan</Text.H3>
              <Text size="lg" fontColor="text.tertiary">
                Discover the perfect plan for your business. Can’t decide? <ContactSales />
              </Text>
            </VStack>
            <CloseButton onClick={handleClose} />
          </HStack>
          {passportApps.length > 0 && (
            <Callout
              icon
              variant="warning"
              label="The pricing plans apply to Dedicated apps only. Passport apps are free forever."
            />
          )}
        </Stack>

        {universalProBundle && (
          <Callout icon label="The new plans only apply to Dedicated Wallet apps." variant="warning" />
        )}

        <VStack alignItems="flex-end" width="full">
          <a href="https://magic.link/pricing" target="_blank" rel="noopener noreferrer">
            <Button label="Compare All Features" size="sm" variant="text">
              <Button.TrailingIcon>
                <IcoExternalLink />
              </Button.TrailingIcon>
            </Button>
          </a>
        </VStack>
      </VStack>

      <Flex
        className={css({
          '@media (max-width: 1060px)': {
            flexDirection: 'column',
          },
        })}
        gap={6}
        mt={2}
      >
        <FreePlanCard />
        <DeveloperProBundlePlanCard />
        <StartupPlanCard />
        <GrowthPlanCard />
      </Flex>
    </VStack>
  );
};
