'use client';

import { PASSPORT_APP } from '@constants/appInfo';
import { PLAN_NAMES } from '@constants/pricing';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { usePlan } from '@hooks/common/use-plan';
import { Button, IcoLightningFill } from '@magiclabs/ui-components';
import { Divider } from '@styled/jsx';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback } from 'react';

const Resolved = () => {
  const router = useRouter();

  const { currentTeam } = useCurrentTeam();
  const { currentApp } = useCurrentApp();
  const {
    plan: { planName },
  } = usePlan({
    teamId: currentTeam.teamId,
  });

  const handleGoToPricing = useCallback(() => {
    router.push('/pricing');
  }, [router]);

  return (
    planName === PLAN_NAMES.FREE &&
    currentTeam.isOwner &&
    currentApp?.appType !== PASSPORT_APP && (
      <>
        <Button id="upgrade-btn" iconSize={16} variant="text" label="Upgrade" onPress={handleGoToPricing}>
          <Button.LeadingIcon>
            <IcoLightningFill />
          </Button.LeadingIcon>
        </Button>

        <Divider mx={4} h={5} orientation="vertical" color="neutral.secondary" />
      </>
    )
  );
};

export const UpgradeButton = () => {
  return (
    <Suspense>
      <Resolved />
    </Suspense>
  );
};
