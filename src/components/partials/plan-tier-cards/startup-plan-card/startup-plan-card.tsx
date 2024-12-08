import { useAnalytics } from '@components/hooks/use-analytics';
import { FeatureList } from '@components/partials/plan-tier-cards/feature-list/feature-list';
import { FeaturePlusRow } from '@components/partials/plan-tier-cards/feature-plus-row/feature-plus-row';
import { SwitchCase } from '@components/presentation/switch-case';
import { PassportTooltipInfo } from '@components/views/billing-view/plan-info-card';
import { useStartupButtonCopy } from '@components/views/upgrade-to-startup-view/use-startup-button-copy';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { PLAN_NAMES, PLAN_TERMS } from '@constants/pricing';
import { usePlan } from '@hooks/common/use-plan';
import { usePricingSuspenseQuery } from '@hooks/data/billing';
import { billingQueryKeys } from '@hooks/data/billing/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { toUSD } from '@libs/to-usd';
import { Button, IcoQuestionCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { HStack, Stack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const StartupPlanCard = () => {
  const { push } = useRouter();

  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const {
    plan: { planName, isCanceled },
  } = usePlan({
    teamId: userInfo.teamId,
  });

  const { trackAction } = useAnalytics();

  const { data: pricing } = usePricingSuspenseQuery(billingQueryKeys.pricing());

  const handleStartNow = useCallback(() => {
    trackAction(ANALYTICS_ACTION_NAMES.CLICK_STARTUP_PLAN_TO_UPGRADE);
    push('/checkout/upgrade-to-startup');
  }, [push, trackAction]);

  const { startupButtonCopy } = useStartupButtonCopy();

  return (
    <VStack
      id="card-startup-plan"
      bgColor="surface.primary"
      borderColor="neutral.secondary"
      borderRadius="2xl"
      borderStyle="solid"
      borderWidth="thin"
      flexShrink={1}
      p={8}
      w="325px"
    >
      <Stack gap={6} width="fit-content">
        <Stack gap={4}>
          <Text.H4>Startup</Text.H4>
          <HStack alignItems="flex-end" gap={1.5}>
            <Text.H2>{toUSD(pricing[PLAN_NAMES.STARTUP][PLAN_TERMS.MONTHLY].price)}</Text.H2>
            <Text size="lg" styles={{ lineHeight: '2.25rem' }}>
              /mo
            </Text>
          </HStack>
          <HStack gap={1} w="full">
            <Text size="sm">Up to 5,000 Monthly Active Wallets</Text>
            <Tooltip
              width={250}
              content={
                <Text inline fontColor="text.tertiary" size="xs">
                  Wallets accessed by users during a given calendar month. Each additional MAW costs 5¢.
                  <PassportTooltipInfo />
                </Text>
              }
            >
              <IcoQuestionCircleFill color={token('colors.neutral.primary')} height="0.75rem" width="0.75rem" />
            </Tooltip>
          </HStack>
        </Stack>
        <SwitchCase
          value={planName}
          caseBy={{
            [PLAN_NAMES.FREE]: <Button label={startupButtonCopy} onPress={handleStartNow} />,
            [PLAN_NAMES.LEGACY]: <Button label={startupButtonCopy} onPress={handleStartNow} />,
            [PLAN_NAMES.STARTUP]: isCanceled ? (
              <Button label={startupButtonCopy} onPress={handleStartNow} />
            ) : (
              <Button disabled label="Current Plan" variant="tertiary" />
            ),
            [PLAN_NAMES.GROWTH]: <Button disabled label="Contact to sales" />,
            [PLAN_NAMES.ENTERPRISE]: <Button disabled label="Contact to sales" />,
          }}
          defaultComponent={<Button label="Stay on Startup" onPress={handleStartNow} />}
        />

        <FeaturePlusRow description="Developer Features, plus:" />

        <FeatureList
          title="Auth & Wallets"
          features={[
            {
              description: 'Multi-Factor Auth',
            },
            {
              description: 'Login Data Export',
            },
          ]}
        />

        <FeatureList
          title="Support"
          features={[
            {
              description: 'Prioritized Support',
            },
          ]}
        />

        <FeatureList
          title="Platform"
          features={[
            {
              description: 'Up to 5 Team Seats',
            },
          ]}
        />
      </Stack>
    </VStack>
  );
};
