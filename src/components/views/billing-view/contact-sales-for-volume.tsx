import { PLAN_NAMES } from '@constants/pricing';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { usePlan } from '@hooks/common/use-plan';
import { Button, Text } from '@magiclabs/ui-components';
import { Suspense } from 'react';

const Resolved = () => {
  const { currentTeamId } = useCurrentTeam();

  const {
    plan: { planName },
  } = usePlan({
    teamId: currentTeamId,
  });

  return (
    planName !== PLAN_NAMES.ENTERPRISE && (
      <Text size="sm" styles={{ lineHeight: '24px' }}>
        <a href="https://magic.link/contact" target="_blank" rel="noopener noreferrer">
          <Button variant="text" size="sm" label="Contact Sales" />
        </a>{' '}
        for volume-based pricing
      </Text>
    )
  );
};

export const ContactSalesForVolume = () => {
  return (
    <Suspense>
      <Resolved />
    </Suspense>
  );
};
