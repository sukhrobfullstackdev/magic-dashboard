import { useAnalytics } from '@components/hooks/use-analytics';
import {
  DowngradeToFreeModal,
  useDowngradeToFreeModal,
} from '@components/partials/downgrade-to-free-modal/downgrade-to-free-modal';
import { FeatureList } from '@components/partials/plan-tier-cards/feature-list/feature-list';
import { SwitchCase } from '@components/presentation/switch-case';
import { PassportTooltipInfo } from '@components/views/billing-view/plan-info-card';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { PLAN_NAMES } from '@constants/pricing';
import { usePlan } from '@hooks/common/use-plan';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Button, IcoQuestionCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { HStack, Stack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback } from 'react';

export const FreePlanCard = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());

  const { plan } = usePlan({
    teamId: userInfo.teamId,
  });

  const { trackAction } = useAnalytics();

  const openModal = useDowngradeToFreeModal((state) => state.open);

  const handleDowngrade = useCallback(() => {
    trackAction(ANALYTICS_ACTION_NAMES.CLICK_FREE_PLAN_TO_DOWNGRADE);

    openModal();
  }, [openModal, trackAction]);

  return (
    <>
      <DowngradeToFreeModal />
      <VStack
        id="card-free-plan"
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
            <Text.H4>Developer</Text.H4>
            <HStack alignItems="flex-end" gap={1.5}>
              <Text.H2>$0</Text.H2>
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

          <SwitchCase
            value={plan.planName}
            caseBy={{
              [PLAN_NAMES.FREE]: <Button disabled label="Current Plan" variant="tertiary" />,
              [PLAN_NAMES.LEGACY]: (
                <Button
                  disabled={plan.isCanceled}
                  label="Downgrade to Developer"
                  onPress={handleDowngrade}
                  variant="tertiary"
                />
              ),
              [PLAN_NAMES.STARTUP]: (
                <Button
                  disabled={plan.isCanceled}
                  label="Downgrade to Developer"
                  onPress={handleDowngrade}
                  variant="tertiary"
                />
              ),
              [PLAN_NAMES.GROWTH]: <Button disabled label="Contact to sales" />,
              [PLAN_NAMES.ENTERPRISE]: <Button disabled label="Contact to sales" />,
            }}
          />

          <FeatureList
            features={[
              {
                description: 'Email, SMS, Social Logins',
              },
              {
                description: 'Token Gating',
              },
              {
                description: 'Wallet UI Widgets',
              },
              {
                description: 'Fiat On-Ramp',
              },
              {
                description: 'Email & Community Support',
              },
            ]}
          />
        </Stack>
      </VStack>
    </>
  );
};
