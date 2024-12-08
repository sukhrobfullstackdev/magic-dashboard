import { useDashboardStore } from '@hooks/data/store/store';
import { useMemo } from 'react';
import { useUserInfoSuspenseQuery } from '../data/user';
import { userQueryKeys } from '../data/user/keys';

export const useCurrentTeam = () => {
  const { teamId, setTeamId } = useDashboardStore();
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());

  const currentTeam = useMemo(() => {
    const id = teamId ?? userInfo.teamId;
    const team = userInfo.teams.find((v) => v.teamId === id);
    if (!team) {
      return userInfo.teams.find((v) => v.teamId === userInfo.teamId)!;
    }

    return team;
  }, [teamId, userInfo]);

  return { currentTeam, currentTeamId: currentTeam.teamId, setCurrentTeamId: setTeamId };
};
