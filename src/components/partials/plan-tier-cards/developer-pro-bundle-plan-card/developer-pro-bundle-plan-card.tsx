import { FeatureList } from '@components/partials/plan-tier-cards/feature-list/feature-list';
import { FeaturePlusRow } from '@components/partials/plan-tier-cards/feature-plus-row/feature-plus-row';
import { PassportTooltipInfo } from '@components/views/billing-view/plan-info-card';
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

export const DeveloperProBundlePlanCard = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const {
    plan: { planName },
  } = usePlan({
    teamId: userInfo.teamId,
  });

  const { data: pricing } = usePricingSuspenseQuery(billingQueryKeys.pricing());

  if (planName !== PLAN_NAMES.LEGACY) {
    return null;
  }

  return (
    <VStack
      id="card-dev-pro-bundle"
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
          <Text.H4>Developer (Pro Bundle)</Text.H4>
          <HStack alignItems="flex-end" gap={1.5}>
            <Text.H2>{toUSD(pricing[PLAN_NAMES.LEGACY][PLAN_TERMS.MONTHLY].price)}</Text.H2>
            <Text size="lg" styles={{ lineHeight: '2.25rem' }}>
              /mo
            </Text>
          </HStack>
          <HStack gap={1} w="full">
            <Text size="sm">Up to 1,000 Monthly Active Wallets</Text>
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
        <Button disabled label="Current Plan" variant="tertiary" />
        <FeaturePlusRow description="Developer Features, plus:" />
        <FeatureList
          title="Auth & Wallets"
          features={[
            {
              description: 'Multi-Factor Auth',
            },
            {
              description: 'Session Management',
            },
            {
              description: 'Login Data Export',
            },
            {
              description: 'Custom Email Provider (SMTP)',
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
