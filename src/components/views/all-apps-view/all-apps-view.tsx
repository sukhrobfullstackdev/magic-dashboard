'use client';

import { PassportCallout } from '@components/partials/passport-callout/passport-callout';
import { TeamPlanUsageCard } from '@components/partials/team-plan-usage-card/team-plan-usage-card';
import { AppCardList } from '@components/views/all-apps-view/app-card-list';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { Stack } from '@styled/jsx';
import { Suspense, useEffect } from 'react';

export const AllAppsView = () => {
  const { currentTeamId } = useCurrentTeam();

  useEffect(() => {
    // Hubble Survey Tracking
    // To disable the survey, leave this line commented out.
    // To activate the survey, uncomment the following line and switch the ID if necessary.
    try {
      window.Hubble.show('d5dd86b1-d5f1-4a2f-9523-99109d806107');
    } catch (e) {
      console.log(e);
    }
  }, []);

  return (
    <Stack m={6} gap={8} flexGrow={1} maxW="47.5rem">
      <Stack gap={6}>
        <PassportCallout />
        <TeamPlanUsageCard teamId={currentTeamId} />
      </Stack>
      <Suspense>
        <AppCardList />
      </Suspense>
    </Stack>
  );
};
