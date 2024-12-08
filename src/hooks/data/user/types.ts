import type { AppType } from '@constants/appInfo';
import type { ClientInfo } from '@interfaces/client';
import type { TeamInfo } from '@interfaces/team';

export type Team = {
  teamId: string;
  teamName: string;
  teamOwnerEmail: string;
  isOwner: boolean;
};

export type App = {
  appId: string;
  appName: string;
  appLogoUrl: string;
  appTermsOfServiceUri?: string;
  appPrivacyPolicyUri?: string;
  appType: AppType;
  teamId: string;
  teamOwnerEmail: string;
  isOwner: boolean;
  userCount: number;
  createdAt?: string | number;
};

export type UserInfo = {
  id: string;
  email: string;
  teamId: string;
  hasDedicatedApps: boolean;
  apps: App[];
  teams: Team[];
};

export interface GetUserInfoApiData {
  email: string;
  id: string;
  public_address: string;
  preferred_magic_client_id: string;
  magic_clients: ClientInfo[];
  magic_teams: TeamInfo[];
  developer_config: {
    num_team_seats: number;
  };
}

export interface RegenerateClientKeysBody {
  magic_client_id: string;
}

export interface RegenerateClientKeysData {
  app_key_id?: string;
  live_api_key: string;
  live_secret_key: string;
}

export type SignInParams = {
  email: string;
};

export type CheckUserExistsParams = {
  email: string;
};

export interface LoginBody {
  email: string;
}

export interface LoginData {
  session_token: string;
}
