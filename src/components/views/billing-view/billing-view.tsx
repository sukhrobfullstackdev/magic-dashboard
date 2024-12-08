'use client';

import { BillingHistory } from '@components/partials/billing-history';
import { PaymentMethodCard } from '@components/partials/payment-method-card/payment-method-card';
import { TeamPlanUsageCard } from '@components/partials/team-plan-usage-card/team-plan-usage-card';
import { ConnectPremiumCard } from '@components/views/billing-view/connect-premium-card';
import { ContactSalesForVolume } from '@components/views/billing-view/contact-sales-for-volume';
import { PlanInfoCard } from '@components/views/billing-view/plan-info-card';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Divider, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export const BillingView = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());

  return (
    <VStack alignItems={'stretch'} padding={6} gap={6} backgroundColor={token('colors.surface.secondary')}>
      <Text.H3>Billing</Text.H3>

      <HStack
        gap={6}
        alignItems={'start'}
        className={css({ '@media screen and (max-width: 1060px)': { flexDirection: 'column' } })}
      >
        {/* left side content */}
        <VStack alignItems={'stretch'} gap={6} flex={1} maxWidth={'calc(100vw - 48px)'}>
          <TeamPlanUsageCard teamId={userInfo.teamId} />
          <PaymentMethodCard className={css({ p: 8 })} />
          <BillingHistory />
        </VStack>

        {/* right side content */}
        <VStack gap={6} style={{ flex: 1, paddingBottom: '40px', maxWidth: '368px' }}>
          <PlanInfoCard />
          <Divider color="neutral.tertiary" />
          <ConnectPremiumCard teamId={userInfo.teamId} />
          <ContactSalesForVolume />
        </VStack>
      </HStack>
    </VStack>
  );
};
