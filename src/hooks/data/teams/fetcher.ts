import { CONNECT_APP_DISABLED_DATE } from '@constants/appInfo';
import type { TeamInfoQueryKey, TeamInvoicesQueryKey, TeamPlanInfoQueryKey } from '@hooks/data/teams/keys';
import { type TeamInfo } from '@hooks/data/teams/types';
import { getInvoices, type GetInvoicesResponse } from '@services/billing';
import { getTeamInfo, getTeamPlanInfo, type GetTeamPlanInfo } from '@services/teams';
import { type QueryFunction } from '@tanstack/react-query';

export const makeTeamPlanInfoFetcher =
  (): QueryFunction<GetTeamPlanInfo, TeamPlanInfoQueryKey> =>
  ({ queryKey: [, { teamId }] }) => {
    return getTeamPlanInfo(teamId);
  };

export const makeTeamInfoFetcher =
  (): QueryFunction<TeamInfo, TeamInfoQueryKey> =>
  async ({ queryKey: [, { teamId }] }) => {
    const response = await getTeamInfo(teamId);

    return {
      teamId: response.team_id,
      teamName: response?.team_name ?? 'My Team',
      teamOwnerEmail: response.team_owner_email,
      teamMembers: response.team_members,
      isConnectAppEnabled: new Date(response.team_created_at) < CONNECT_APP_DISABLED_DATE,
    };
  };

export const makeTeamInvoicesFetcher =
  (): QueryFunction<GetInvoicesResponse, TeamInvoicesQueryKey> =>
  async ({ queryKey: [, { teamId }] }) => {
    const { data, error } = await getInvoices(teamId);
    if (error) {
      throw error;
    }

    return data;
  };
