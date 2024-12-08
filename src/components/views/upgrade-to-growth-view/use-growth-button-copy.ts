import { PLAN_NAMES } from '@constants/pricing';
import { usePlan } from '@hooks/common/use-plan';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { useMemo } from 'react';

export const useGrowthButtonCopy = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { plan } = usePlan({
    teamId: userInfo.teamId,
  });

  const growthButtonCopy = useMemo(() => {
    const { planName, freeTrial, isCanceled, isGrowthRenew } = plan;

    if (isCanceled && planName === PLAN_NAMES.GROWTH) {
      return 'Stay on Growth';
    }

    if (freeTrial.isEnabled) {
      return 'Start Free Trial';
    }

    if (isGrowthRenew) {
      return 'Renew Growth';
    }

    return 'Upgrade to Growth';
  }, [plan]);

  return { growthButtonCopy };
};
