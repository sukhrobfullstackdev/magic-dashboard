import { AppType } from '@constants/appInfo';

// RETURN TYPES
export type SignupAppUser = {
  authUserId: string;
  userId: string;
  loggedInAt?: Date;
  createdAt: Date;
  provenance: string;
  isMfaEnabled: boolean;
};

export type SignupAppUsers = {
  count: number;
  users: SignupAppUser[];
};

export type AppUser = {
  authUserId: string;
  userId: string;
  loggedInAt: Date;
  provenance: string;
};

// PARAMS
export type AppSignupUsersParams = {
  appId: string;
  appType?: AppType;
  limit?: number;
  offset?: number;
};

export type AppUsersParams = {
  appId: string;
};

export type TeamAppUsersParams = {
  teamId: string;
};

export type SearchAppUsersParams = {
  appId: string;
  keyword: string;
};

export type PassportConnection = {
  publicAddress: string;
  connectedAt: number;
};
