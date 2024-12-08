import { PASSPORT_APP } from '@constants/appInfo';
import type {
  AppConnectionsQueryKey,
  AppSignupUsersQueryKey,
  AppUsersQueryKey,
  SearchAppUsersQueryKey,
  TeamAppUsersQueryKey,
} from '@hooks/data/app-users/keys';
import type { AppUser, PassportConnection, SignupAppUsers } from '@hooks/data/app-users/types';
import { getAppConnections } from '@services/passport';
import { searchForUser, type UserSearchData } from '@services/user-search';
import {
  getAggregateLogins,
  getLogins,
  getSignups,
  type GetLoginsData,
  type GetSignupsUserData,
} from '@services/users';
import { type QueryFunction } from '@tanstack/react-query';
import { fromUnixTime } from 'date-fns';

export const makeAppSignupUsersFetch =
  (): QueryFunction<SignupAppUsers | Record<string, never>, AppSignupUsersQueryKey> =>
  // @ts-expect-error passport: structure TBD
  async ({ queryKey: [, { appId, appType, limit = 0, offset = 0 }] }) => {
    const response = appType === PASSPORT_APP ? {} : await getSignups(appId, limit, offset, true);

    return {
      ...response,
      // @ts-expect-error passport: structure TBD
      users: response?.users?.map((v: GetSignupsUserData) => ({
        authUserId: v.auth_user_id,
        userId: v.id,
        loggedInAt: fromUnixTime(v.login_ts),
        createdAt: fromUnixTime(v.signup_ts),
        provenance: v.provenance,
        isMfaEnabled: v.is_mfa_enabled,
      })),
    };
  };

export const makeAppUsersFetch =
  (): QueryFunction<AppUser[], AppUsersQueryKey> =>
  async ({ queryKey: [, { appId }] }) => {
    const response = await getLogins(appId, 14);
    return response?.logins?.map((v: GetLoginsData) => ({
      authUserId: v.auth_user_id,
      userId: v.id,
      loggedInAt: fromUnixTime(v.login_ts),
      provenance: v.provenance,
    }));
  };

export const makeTeamAppUsersFetch =
  (): QueryFunction<AppUser[], TeamAppUsersQueryKey> =>
  async ({ queryKey: [, { teamId }] }) => {
    const response = await getAggregateLogins(14, teamId);
    return response?.logins.map((v: GetSignupsUserData) => ({
      authUserId: v.auth_user_id,
      userId: v.id,
      loggedInAt: fromUnixTime(v.login_ts),
      createdAt: fromUnixTime(v.signup_ts),
      provenance: v.provenance,
      isMfaEnabled: v.is_mfa_enabled,
    }));
  };

export const makeSearchAppUsersFetch =
  (): QueryFunction<SignupAppUsers, SearchAppUsersQueryKey> =>
  async ({ queryKey: [, { appId, keyword }] }) => {
    const response = await searchForUser(appId, keyword, true);
    return {
      count: response.data?.users.length ?? 0,
      users:
        response.data?.users?.map((v: UserSearchData) => ({
          authUserId: v.auth_user_id,
          userId: v.id,
          createdAt: fromUnixTime(v.signup_ts),
          provenance: v.provenance,
          isMfaEnabled: v.is_mfa_enabled,
        })) ?? [],
    };
  };

export const makeAppConnectionsFetch =
  (): QueryFunction<PassportConnection[], AppConnectionsQueryKey> =>
  async ({ queryKey: [, { appId }] }) => {
    const response = await getAppConnections(appId);
    return response.map((v) => ({
      publicAddress: v.public_address,
      connectedAt: v.iat,
    }));
  };
