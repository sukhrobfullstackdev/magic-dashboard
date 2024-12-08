import { useCurrentTeam } from '@hooks/common/use-current-team';
import { usePlan } from '@hooks/common/use-plan';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { getMonthDateDisplayString } from '@libs/monthInfo';
import { IcoArrowRight, Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Link from 'next/link';

export const PaymentOverdueBanner = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { currentTeamId } = useCurrentTeam();
  const { plan } = usePlan({
    teamId: currentTeamId,
  });

  if (plan.payment.status === 'OK' || userInfo.teamId !== currentTeamId) {
    return null;
  }

  return (
    <Link href={'/account/billing'}>
      <HStack gap={2} p={4} bg="negative.lightest" cursor="pointer">
        <Text variant="error">
          <b>Payment failed.</b> Update your payment method{' '}
          {plan.payment.finalAttemptData && (
            <>
              by <b>{getMonthDateDisplayString(plan.payment.finalAttemptData)}</b>
            </>
          )}{' '}
          to maintain service.
        </Text>
        <IcoArrowRight width={20} height={20} color={token('colors.negative.darker')} />
      </HStack>
    </Link>
  );
};
