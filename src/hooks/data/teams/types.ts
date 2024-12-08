import { type TeamMember } from '@services/teams';

// RETURN TYPES
export type TeamInfo = {
  teamId: string;
  teamName: string;
  teamOwnerEmail: string;
  teamMembers: TeamMember[];
  isConnectAppEnabled: boolean;
};

// PARAMS
export type TeamPlanInfoParams = {
  teamId: string;
};

export type TeamInfoParams = {
  teamId: string;
};

export type EditTeamNameParams = {
  teamId: string;
  name: string;
};

export type SendTeamInviteParams = {
  teamId: string;
  email: string;
};

export type RemoveTeamMemberParams = {
  teamId: string;
  email: string;
};

export type AcceptTeamInviteParams = {
  teamId: string;
  email: string;
};

export type UpdateTeamPlanParams = {
  teamId: string;
  quoteId: string;
  productPriceKey: string;
  downgradeReason?: string;
};

export type TeamInvoicesParams = {
  teamId: string;
};
