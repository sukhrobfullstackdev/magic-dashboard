import { PASSPORT_APP, type AppType } from '@constants/appInfo';

import { type ClientInfo } from '@interfaces/client';
import { Delete, Get, Post, PostFormData, Put } from '@services/http/passport-rest';

// interface GetClientInfoApiResponse extends FortmaticAPIResponse<ClientInfo> {}
export interface GetClientInfoResponse extends ClientInfo {
  app_type: AppType;
}

export interface CreateAppInfoBody {
  name: string;
  team_id: string;
}

export interface EditAppInfoBody {
  name?: string;
  terms_of_service_uri?: string | null;
  privacy_policy_uri?: string | null;
  logo_path?: string | null;
}

type PassportAppObj = {
  id: string;
  name: string;
  team_id: string;
  logo_uri: string;
  terms_of_service_uri: string;
  privacy_policy_uri: string;
  user_count: number;
  created_at: number;
};

type PassportAppKeyObj = {
  id: string;
  public_key: string;
  secret_key: string;
  created_at: number;
};

type PassportConnectionsData = {
  public_address: string;
  iat: number;
};

type PassportConnectionsResponse = PassportConnectionsData[];

export type LogoUploadResponse = {
  id: string;
  logo_uri: string;
  name: string;
  terms_of_service_uri: string;
  privacy_policy_uri: string;
  team_id: string;
};

const appKeyResultParser = (result: PassportAppKeyObj) => ({
  app_key_id: result.id,
  live_api_key: result.public_key,
  live_secret_key: result.secret_key,
  api_key_creation_timestamp: result.created_at,
});

const appResultParser = (result: PassportAppObj) =>
  ({
    magic_client_id: result.id,
    app_name: result.name,
    app_type: PASSPORT_APP,
    team_id: result.team_id,
    asset_uri: result.logo_uri,
    terms_of_service_uri: result.terms_of_service_uri,
    privacy_policy_uri: result.privacy_policy_uri,
    is_default_asset: !result.logo_uri,
    user_count: result.user_count,
    created_at: result.created_at,
    theme_info: {
      asset_uri: result.logo_uri,
      is_default_asset: !result.logo_uri,
    },
  }) as ClientInfo;

// TODO: Add types for Passport API: https://magiclink.atlassian.net/browse/M2PC-158

export async function listApps(team_id: string) {
  const endpoint = 'v1/app/';
  try {
    // @ts-expect-error passport: structure TBD
    const result = await Get<PassportAppResultObj[]>(endpoint, team_id);
    return result.map(appResultParser);
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getAppInfo(app_id: string) {
  const endpoint = `v1/app/${app_id}`;
  // @ts-expect-error passport: structure TBD
  const result = await Get<PassportAppObj>(endpoint);
  return appResultParser(result);
}

async function getAppKeyInfo(app_id: string) {
  const endpoint = `v1/app_key/?app_id=${app_id}`;
  // @ts-expect-error passport: structure TBD
  const result = await Get<PassportAppKeyObj>(endpoint);
  return appKeyResultParser(result);
}

export async function getAppAndKeyInfo(app_id: string) {
  const [appInfo, appKeyInfo] = await Promise.all([getAppInfo(app_id), getAppKeyInfo(app_id)]);
  return { ...appInfo, ...appKeyInfo };
}

export async function getAppConnections(app_id: string) {
  const endpoint = `v1/app/${app_id}/connections`;
  // @ts-expect-error passport: structure TBD
  const result = await Get<PassportConnectionsResponse>(endpoint);
  return result;
}

export async function createApp(name: string, team_id: string) {
  const endpoint = 'v1/app';
  const body = { name, team_id };
  // @ts-expect-error passport: structure TBD
  const result = await Post<unknown, PassportAppObj>(endpoint, body);
  return appResultParser(result);
}

export async function createAppKey(app_id: string) {
  const endpoint = 'v1/app_key';
  // @ts-expect-error passport: structure TBD
  const result = await Post<unknown, PassportAppKeyObj>(endpoint, { app_id });
  return appKeyResultParser(result);
}

export async function deleteApp(app_id: string) {
  const endpoint = `v1/app/${app_id}`;
  await Delete(endpoint);
}

export function editApp(app_id: string, body: EditAppInfoBody) {
  const endpoint = `v1/app/${app_id}`;
  // @ts-expect-error passport: structure TBD
  return Put<EditAppInfoBody, PassportAppObj>(endpoint, body);
}

export async function regenerateAppKeys(app_key_id: string) {
  const endpoint = `/v1/app_key/${app_key_id}`;
  // @ts-expect-error passport: structure TBD
  const result = await Put<unknown, PassportAppKeyObj>(endpoint);
  return appKeyResultParser(result);
}

export async function uploadPassportLogo(app_id: string, formData: FormData) {
  const endpoint = `/v1/app/${app_id}/logo`;
  // @ts-expect-error passport: structure TBD
  const result = await PostFormData<FormData, LogoUploadResponse>(endpoint, formData);
  return result;
}
