import { PLAN_NAMES } from '@constants/pricing';
import { usePlan } from '@hooks/common/use-plan';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { useMemo } from 'react';

export const useStartupButtonCopy = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { plan } = usePlan({
    teamId: userInfo.teamId,
  });

  const startupButtonCopy = useMemo(() => {
    const { planName, isCanceled, freeTrial, isStartupRenew } = plan;

    if (isCanceled && planName === PLAN_NAMES.STARTUP) {
      return 'Stay on Startup';
    }

    if (freeTrial.isEnabled) {
      return 'Start Free Trial';
    }

    if (isStartupRenew) {
      return 'Renew Startup';
    }

    return 'Upgrade to Startup';
  }, [plan]);

  return { startupButtonCopy };
};
