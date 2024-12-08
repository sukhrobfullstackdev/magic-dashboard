import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import { FreeOnlyUpsellBanner } from '@components/partials/team-plan-usage-card/free-only-upsell-banner';
import { LimitedUsage } from '@components/partials/team-plan-usage-card/limited-usage';
import { UnlimitedUsage } from '@components/partials/team-plan-usage-card/unlimited-usage';
import { SwitchCase } from '@components/presentation/switch-case';
import { PASSPORT_APP } from '@constants/appInfo';
import { PLAN_NAMES } from '@constants/pricing';
import { usePlan } from '@hooks/common/use-plan';
import { useTeamInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { App } from '@hooks/data/user/types';
import { Card, IcoGlobe, IcoWarningFill, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Suspense, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

const WARNING_THRESHOLD = 75;
const ERROR_THRESHOLD = 90;

type Props = {
  teamId: string;
};

const Fallback = () => {
  return (
    <Card>
      <HStack alignItems="center" justifyContent="space-between" mb={7}>
        <Text.H4>{format(new Date(), 'MMMM', { locale: enUS })} Plan Use</Text.H4>
        <HStack alignItems="center" gap={2}>
          <Skeleton height={24} width={120} />
        </HStack>
      </HStack>
      <HStack gap={6}>
        <Skeleton height={24} width={200} />
        <Skeleton height={24} width={200} />
      </HStack>
    </Card>
  );
};

const Resolved = ({ teamId }: Props) => {
  const { isAvailableForPassportDevnet } = useMagicLDFlags();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { data: teamInfo } = useTeamInfoSuspenseQuery(teamQueryKeys.info({ teamId }));

  const {
    plan: { mauUsed, rateLimit, smsUsed, isCreditCardAttached, planName, currentMonth, payment },
  } = usePlan({
    teamId,
  });

  const appCount = userInfo.apps.filter((v: App) => v.teamId === teamId && v.appType !== PASSPORT_APP).length;

  const isTeamOwner = useMemo(() => {
    return userInfo.teamId === teamId;
  }, [teamId, userInfo.teamId]);

  const bannerStatus = useMemo(() => {
    const percentage = (mauUsed / rateLimit) * 100;

    if (percentage >= ERROR_THRESHOLD) {
      return 'error';
    } else if (percentage >= WARNING_THRESHOLD) {
      return 'warning';
    }
    return 'normal';
  }, [mauUsed, rateLimit]);

  if (payment.status === 'SUSPENDED') {
    return (
      <Card>
        <HStack alignItems="center" gap={3} mb={4}>
          <IcoWarningFill width={24} height={24} color={token('colors.warning.base')} />
          <Text.H4>Service Suspended</Text.H4>
        </HStack>

        <Text>All Magic services have been suspended. Users will be blocked from login.</Text>

        <Box backgroundColor="warning.lightest" borderRadius={4} p={4} mt={7}>
          <Text styles={{ color: token('colors.warning.darkest') }}>
            Contact{' '}
            <a
              href="mailto:support@magic.link?subject=Payment Overdue"
              style={{
                color: token('colors.warning.darkest'),
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              support@magic.link
            </a>{' '}
            to resume service
          </Text>
        </Box>
      </Card>
    );
  }

  return appCount ? (
    <Card>
      <HStack alignItems="center" justifyContent="space-between" mb={7}>
        <Text.H4 fontWeight="semibold">{currentMonth} Plan Use</Text.H4>
        <HStack alignItems="center" gap={2}>
          {isAvailableForPassportDevnet ? (
            <Text size="sm" fontColor="text.tertiary">
              {teamInfo.isConnectAppEnabled ? 'Dedicated & Universal apps' : 'Dedicated apps'}
            </Text>
          ) : (
            <>
              <IcoGlobe width={14} height={14} color={token('colors.neutral.primary')} />
              <Text size="sm" fontColor="text.tertiary">
                {teamInfo.teamName} ({appCount.toLocaleString()} {appCount > 1 ? 'apps' : 'app'})
              </Text>
            </>
          )}
        </HStack>
      </HStack>
      {planName === PLAN_NAMES.FREE && isTeamOwner && !isCreditCardAttached ? (
        <>
          <LimitedUsage mauUsed={mauUsed || 0} smsUsed={smsUsed} />
          <SwitchCase
            value={bannerStatus}
            caseBy={{
              normal: (
                <FreeOnlyUpsellBanner
                  className={css({ mt: 6, bgColor: 'brand.lightest' })}
                  textColor={token('colors.brand.darker')}
                />
              ),
              warning: (
                <FreeOnlyUpsellBanner
                  className={css({ mt: 6, bgColor: 'warning.lightest' })}
                  textColor={token('colors.warning.darkest')}
                />
              ),
              error: (
                <FreeOnlyUpsellBanner
                  className={css({ mt: 6, bgColor: 'negative.lightest' })}
                  textColor={token('colors.negative.darkest')}
                />
              ),
            }}
          />
        </>
      ) : (
        <UnlimitedUsage mauUsed={mauUsed} smsUsed={smsUsed} />
      )}
    </Card>
  ) : null;
};

export const TeamPlanUsageCard = ({ teamId }: Props) => {
  return (
    <Suspense fallback={<Fallback />}>
      <Resolved teamId={teamId} />
    </Suspense>
  );
};
