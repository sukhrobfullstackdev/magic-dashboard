import { CONNECT_APP, PASSPORT_APP } from '@constants/appInfo';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { usePassportAppsSuspenseQuery } from '@hooks/data/app';
import { appQueryKeys } from '@hooks/data/app/keys';
import { useDashboardStore } from '@hooks/data/store/store';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { useMemo } from 'react';

export const useAllApps = () => {
  const { isPassportFlowEnabled } = useDashboardStore();
  const { currentTeamId } = useCurrentTeam();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { data: allPassportApps } = usePassportAppsSuspenseQuery(appQueryKeys.passportApps(isPassportFlowEnabled));

  return useMemo(() => {
    const allTeamsApps = [...userInfo.apps, ...allPassportApps];
    const allApps = [];
    const passportApps = [];
    const universalApps = [];
    const dedicatedApps = [];

    for (const app of allTeamsApps) {
      if (app.teamId === currentTeamId) {
        allApps.push(app);
        if (app.appType === PASSPORT_APP) passportApps.push(app);
        if (app.appType === CONNECT_APP) universalApps.push(app);
        if (isDedicatedApp(app.appType)) dedicatedApps.push(app);
      }
    }

    return { allApps, passportApps, universalApps, dedicatedApps };
  }, [userInfo.apps, allPassportApps, currentTeamId]);
};
