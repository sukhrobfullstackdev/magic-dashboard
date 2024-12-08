'use client';

import { useCurrentTeam } from '@hooks/common/use-current-team';
import { usePlan } from '@hooks/common/use-plan';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Button, IcoWarningFill } from '@magiclabs/ui-components';
import { Divider } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

const Resolved = () => {
  const router = useRouter();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { currentTeamId } = useCurrentTeam();
  const { plan } = usePlan({
    teamId: currentTeamId,
  });

  const handleClick = () => {
    router.push('/account/billing');
  };

  return (
    plan.payment.status !== 'OK' &&
    userInfo.teamId === currentTeamId && (
      <>
        <Button variant="text" textStyle="negative" label="Payment failed" onPress={handleClick}>
          <Button.LeadingIcon>
            <IcoWarningFill />
          </Button.LeadingIcon>
        </Button>

        <Divider mx={4} h={5} orientation="vertical" color="neutral.secondary" />
      </>
    )
  );
};

export const PaymentFailedButton = () => {
  return (
    <Suspense>
      <Resolved />
    </Suspense>
  );
};
