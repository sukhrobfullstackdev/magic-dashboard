import { useAnalytics } from '@components/hooks/use-analytics';
import { FeatureList } from '@components/partials/plan-tier-cards/feature-list/feature-list';
import { SwitchCase } from '@components/presentation/switch-case';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { PLAN_NAMES } from '@constants/pricing';
import { useAllApps } from '@hooks/common/use-all-apps';
import { usePlan } from '@hooks/common/use-plan';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Button, Card, IcoLightningFill, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Stack, VStack } from '@styled/jsx';
import { stack } from '@styled/patterns';
import { addDays, format, isAfter } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';

export const PassportTooltipInfo = () => {
  const { passportApps } = useAllApps();

  if (!passportApps.length) return null;

  return (
    <>
      <br />
      <br />
      MAWs from Passport apps will not be counted towards billing usage.
    </>
  );
};

const EnterprisePlanInfoCard = () => {
  return (
    <>
      <Text.H4>Enterprise</Text.H4>

      <Text size="sm" fontColor="text.tertiary">
        Questions about your plan? Contact our Customer Support team.
      </Text>
    </>
  );
};

const GrowthPlanInfoCard = ({ endedAt, isCanceled }: { endedAt?: Date | null; isCanceled: boolean }) => {
  return (
    <>
      <Text.H4>Growth</Text.H4>
      <FeatureList
        features={[
          {
            description: 'Up to 10,000 Monthly Active Wallets',
            tooltip: (
              <>
                First 10,000 MAWs are free, then each additional MAW costs 5¢.
                <PassportTooltipInfo />
              </>
            ),
          },
          {
            description: 'Up to 100 text messages each month',
          },
        ]}
      />

      <Text size="sm" fontColor="text.tertiary">
        Questions about your plan? Contact our Customer Support team.
      </Text>
      {/* grace period */}
      {!isCanceled && endedAt && isAfter(new Date(), endedAt) && (
        <Text size="sm" fontColor="text.tertiary">
          Billed next on {format(addDays(endedAt, 30), 'MMM d, y.')}
        </Text>
      )}
    </>
  );
};

const StartupPlanInfoCard = ({ endedAt, isCanceled }: { endedAt?: Date | null; isCanceled: boolean }) => {
  const router = useRouter();
  const { trackAction } = useAnalytics();

  const handleManagePlan = useCallback(() => {
    trackAction(ANALYTICS_ACTION_NAMES.CLICK_MANAGE_PLAN);
    router.push('/pricing');
  }, [router, trackAction]);

  return (
    <>
      <Text.H4>Startup</Text.H4>
      <FeatureList
        features={[
          {
            description: 'Up to 5,000 Monthly Active Wallets',
            tooltip: (
              <>
                First 5,000 MAWs are free, then each additional MAW costs 5¢.
                <PassportTooltipInfo />
              </>
            ),
          },
          {
            description: 'Up to 100 text messages each month',
          },
        ]}
      />

      <Button variant="secondary" onPress={handleManagePlan} label="Manage Plan" />
      {isCanceled && endedAt && (
        <Text fontWeight="normal" size="sm" variant="error">
          Subscription expires on {format(endedAt, 'MMM d, y.')}
        </Text>
      )}
      {/* grace period */}
      {!isCanceled && endedAt && isAfter(new Date(), endedAt) && (
        <Text size="sm" fontColor="text.tertiary">
          Billed next on {format(addDays(endedAt, 30), 'MMM d, y.')}
        </Text>
      )}
    </>
  );
};

const LegacyPlanInfoCard = ({ endedAt, isCanceled }: { endedAt?: Date | null; isCanceled: boolean }) => {
  const router = useRouter();
  const { trackAction } = useAnalytics();

  const handleManagePlan = useCallback(() => {
    trackAction(ANALYTICS_ACTION_NAMES.CLICK_MANAGE_PLAN);
    router.push('/pricing');
  }, [router, trackAction]);

  return (
    <>
      <Text.H4>Developer (Pro Bundle)</Text.H4>
      <FeatureList
        features={[
          {
            description: 'Up to 1,000 Monthly Active Wallets',
            tooltip: (
              <>
                First 1,000 MAWs are free, then each additional MAW costs 5¢.
                <PassportTooltipInfo />
              </>
            ),
          },
          {
            description: 'Up to 100 text messages each month',
          },
        ]}
      />

      <Button variant="secondary" onPress={handleManagePlan} label="Manage Plan" />
      {isCanceled && endedAt && (
        <Text fontWeight="normal" size="sm" variant="error">
          Subscription expires on {format(endedAt, 'MMM d, y.')}
        </Text>
      )}
      {/* grace period */}
      {!isCanceled && endedAt && isAfter(new Date(), endedAt) && (
        <Text size="sm" fontColor="text.tertiary">
          Billed next on {format(addDays(endedAt, 30), 'MMM d, y.')}
        </Text>
      )}
    </>
  );
};

const DeveloperPlanInfoCardCard = () => {
  const router = useRouter();
  const { trackAction } = useAnalytics();

  const handleUpgrade = useCallback(() => {
    trackAction(ANALYTICS_ACTION_NAMES.CLICK_UPGRADE);

    router.push('/pricing');
  }, [router, trackAction]);

  return (
    <>
      <Text.H4>Developer</Text.H4>
      <FeatureList
        features={[
          {
            description: 'Up to 1,000 Monthly Active Wallets',
            tooltip: (
              <>
                First 1,000 MAWs are free, then each additional MAW costs 5¢.
                <PassportTooltipInfo />
              </>
            ),
          },
          {
            description: 'Up to 100 text messages each month',
            tooltip: (
              <>
                First 100 text messages are free, after that{' '}
                <Text size="xs" inline variant="info" fontWeight="semibold">
                  market rates
                </Text>{' '}
                apply for every additional text messages.
              </>
            ),
          },
        ]}
      />

      <Button onPress={handleUpgrade} expand size="lg" label="Upgrade">
        <Button.LeadingIcon>
          <IcoLightningFill />
        </Button.LeadingIcon>
      </Button>
    </>
  );
};

const Fallback = () => {
  return (
    <Card className={stack({ w: '100%', gap: 6 })}>
      <Skeleton height={24} width={120} />
      <Stack gap={2}>
        <Skeleton height={20} width={200} />
        <Skeleton height={20} width={200} />
      </Stack>
    </Card>
  );
};

const Resolved = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { plan } = usePlan({
    teamId: userInfo.teamId,
  });

  return (
    <Card className={css({ w: '100%', overflow: 'visible' })}>
      <VStack gap={6} alignItems={'stretch'}>
        <SwitchCase
          value={plan.planName || ''}
          caseBy={{
            [PLAN_NAMES.FREE]: <DeveloperPlanInfoCardCard />,
            [PLAN_NAMES.STARTUP]: <StartupPlanInfoCard endedAt={plan.endedAt} isCanceled={plan.isCanceled} />,
            [PLAN_NAMES.LEGACY]: <LegacyPlanInfoCard endedAt={plan.endedAt} isCanceled={plan.isCanceled} />,
            [PLAN_NAMES.GROWTH]: <GrowthPlanInfoCard endedAt={plan.endedAt} isCanceled={plan.isCanceled} />,
            [PLAN_NAMES.ENTERPRISE]: <EnterprisePlanInfoCard />,
          }}
        />
      </VStack>
    </Card>
  );
};

export const PlanInfoCard = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <Resolved />
    </Suspense>
  );
};
