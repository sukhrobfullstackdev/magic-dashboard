import { Get, type FortmaticAPIResponse } from '@services/http/magic-rest';

export interface GetSignupsUserData {
  id: string;
  client_id: string;
  auth_user_id: string;
  provenance: string;
  signup_ts: number;
  login_ts: number;
  is_mfa_enabled: boolean;
}
interface GetSignupsResponse {
  users: GetSignupsUserData[];
  count: number;
}

export interface GetLoginsData {
  id: string;
  client_id: string;
  provenance: string;
  login_ts: number;
  auth_user_id: string;
}

interface GetLoginsResponse {
  logins: GetLoginsData[];
}

interface GetAggregateLoginsResponse {
  logins: GetSignupsUserData[];
}

export async function getSignups(client_id: string, limit: number, offset: number, include_count: boolean) {
  const endpoint = `/v2/dashboard/magic_client/users?magic_client_id=${client_id}&limit=${limit}&offset=${offset}&include_count=${Number(
    include_count,
  )}`;
  return (await Get<FortmaticAPIResponse<GetSignupsResponse>>(endpoint)).data;
  /* return Promise.resolve({
    users: [
      { id: '6478858089', client_id: 'xyz', provenance: 'sms', signup_ts: 1234571, is_mfa_enabled: true },
      { client_id: 'xyz', provenance: 'github', signup_ts: 1234570, is_mfa_enabled: false },
      { client_id: 'xyz', provenance: 'facebook', signup_ts: 1234569, is_mfa_enabled: false },
      { client_id: 'xyz', provenance: 'webauthn', signup_ts: 1234568, is_mfa_enabled: false },
      { id: 'aa@aa.com', client_id: 'xyz', provenance: 'link', signup_ts: 1234567, is_mfa_enabled: false },
    ],
    count: 5,
  }); */
}

export async function getLogins(client_id: string, limit: number) {
  const endpoint = `v1/dashboard/magic_client/user_logins?magic_client_id=${client_id}&limit=${limit}`;
  return (await Get<FortmaticAPIResponse<GetLoginsResponse>>(endpoint)).data;
  /* return Promise.resolve({
    logins: [
      { client_id: 'xyz', provenance: 'google', login_ts: 1234567 },
      { client_id: 'xyz', provenance: 'github', login_ts: 1234567 },
      { client_id: 'xyz', provenance: 'facebook', login_ts: 1234567 },
      { client_id: 'xyz', provenance: 'webauthn', login_ts: 1234567 },
      { id: 'a@a.com', client_id: 'xyz', provenance: 'link', login_ts: 1234567 },
    ],
  }); */
}

export async function getAggregateLogins(limit: number, team_id: string) {
  const endpoint = `v1/dashboard/magic_api_user/user_logins?limit=${limit}&team_id=${team_id}`;
  return (await Get<FortmaticAPIResponse<GetAggregateLoginsResponse>>(endpoint)).data;
  /* return Promise.resolve({
    logins: [
      { client_id: 'xyz', provenance: 'google', login_ts: 1 234567 },
      { client_id: 'xyz', provenance: 'github', login_ts: 1234567 },
      { client_id: 'xyz', provenance: 'facebook', login_ts: 1234567 },
      { client_id: 'xyz', provenance: 'webauthn', login_ts: 1234567 },
      { id: 'a@a.com', client_id: 'xyz', provenance: 'link', login_ts: 1234567 },
    ],
  }); */
}
