import { AppType, AUTH_APP, CONNECT_APP } from '@constants/appInfo';
import { useDashboardStore } from '@hooks/data/store/store';
import { type UserInfoQueryKey } from '@hooks/data/user/keys';
import {
  LoginBody,
  LoginData,
  type GetUserInfoApiData,
  type RegenerateClientKeysBody,
  type RegenerateClientKeysData,
  type UserInfo,
} from '@hooks/data/user/types';
import { parseClientInfoToApp } from '@libs/parse-client-info-to-app';
import { Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';
import { type QueryFunction } from '@tanstack/react-query';

export function login(email: string, did_token: string) {
  const body = { email };
  return Post<LoginBody, FortmaticAPIResponse<LoginData>>('v1/dashboard/magic_dashboard/login', body, did_token);
}

export function getSessionToken(team_id: string) {
  const endpoint = `v1/dashboard/session_token?team_id=${team_id}`;
  return Get<FortmaticAPIResponse<LoginData>>(endpoint);
}

export function getUserInfo() {
  const endpoint = 'v1/dashboard/magic_api_user/info';
  return Get<FortmaticAPIResponse<GetUserInfoApiData>>(endpoint);
}

export function logout() {
  const endPoint = 'v1/dashboard/magic_dashboard/logout';
  return Post(endPoint, {});
}

export async function regenerateClientKeys(magic_client_id: string) {
  const endpoint = 'v1/dashboard/magic_client/keys/regenerate';
  return (
    await Post<RegenerateClientKeysBody, FortmaticAPIResponse<RegenerateClientKeysData>>(endpoint, { magic_client_id })
  ).data;
}

export const makeGetUserInfoFetch = (): QueryFunction<UserInfo, UserInfoQueryKey> => async () => {
  const { data, status, message } = await getUserInfo();
  const { passportAuthToken, teamId, setMagicTeams, setPassportAuthToken, setTeamId } = useDashboardStore.getState();

  if (status !== 'ok') {
    throw new Error(message);
  }

  const myTeam = data.magic_teams.find((team) => team.team_owner_email === data.email);
  if (!myTeam) {
    throw new Error('User does not have a team');
  }

  const myTeamId = myTeam.team_id;
  const magicTeams = data.magic_teams
    .map((team) => ({
      teamId: team.team_id ?? '',
      teamName:
        team.team_name ?? (team.team_owner_email === data.email ? 'My Team' : `${team.team_owner_email}'s team`),
      teamOwnerEmail: team.team_owner_email,
      isOwner: team.team_id === myTeamId,
    }))
    .sort((a, b) => {
      if (a.teamId === myTeamId) return -1;
      if (b.teamId === myTeamId) return 1;
      return 0;
    });

  setMagicTeams(magicTeams);

  if (!teamId) {
    setTeamId(myTeamId);
  }

  if (!passportAuthToken) {
    const res = await getSessionToken(myTeamId);
    setPassportAuthToken(res.data.session_token);
  }

  return {
    id: data.id,
    email: data.email,
    teamId: myTeamId,
    hasDedicatedApps: data.magic_clients.map((v) => !v.is_magic_connect_enabled).length > 0,
    apps: [
      ...data.magic_clients.map((client) => ({
        ...parseClientInfoToApp(client, myTeamId),
        appType: (client.is_magic_connect_enabled ? CONNECT_APP : AUTH_APP) as AppType,
        createdAt: client.time_created,
      })),
    ],
    teams: magicTeams,
  };
};
