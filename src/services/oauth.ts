import { Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';

interface CreateOAuthAppResponse
  extends FortmaticAPIResponse<{
    oauth_app_id: string; // DB reference to OAuth application
    oauth_redirect_id: string;
  }> {}

interface CreateOAuthAppBody {
  app_id: string;
  login_experience: string;
  app_secret: string;
  provider_name: string;
  magic_client_id: string;
  app_metadata?: OAuthClientMetadata;
}

export function createOAuthApp(
  magic_client_id: string,
  info: {
    provider_name: string;
    app_id: string;
    login_experience: string;
    app_secret: string;
    app_metadata?: OAuthClientMetadata;
  },
) {
  const endpoint = '/v1/dashboard/magic_oauth/app/create';

  const body: CreateOAuthAppBody = { ...info, magic_client_id };

  return Post<CreateOAuthAppBody, CreateOAuthAppResponse>(endpoint, body);
}

// -------------------------------------------------------------------------- //

interface UpdateOAuthAppResponse extends FortmaticAPIResponse {}

interface UpdateOAuthAppBody {
  oauth_app_id: string; // DB reference to OAuth application
  app_id?: string;
  app_secret?: string;
  login_experience?: string;
  app_metadata?: OAuthClientMetadata;
}

export function updateOAuthApp(
  oauth_app_id: string,
  info: {
    app_id?: string;
    app_secret?: string;
    app_metadata?: OAuthClientMetadata;
    login_experience?: string;
  } = {},
) {
  const endpoint = '/v1/dashboard/magic_oauth/app/update';

  const body: UpdateOAuthAppBody = { ...info, oauth_app_id };

  return Post<UpdateOAuthAppBody, UpdateOAuthAppResponse>(endpoint, body);
}

// -------------------------------------------------------------------------- //

interface DeleteOAuthAppResponse extends FortmaticAPIResponse {}

interface DeleteOAuthAppBody {
  oauth_app_id: string; // DB reference to OAuth application
  magic_client_id?: string;
}

export async function deleteOAuthApp(oauth_app_id: string, magic_client_id: string) {
  const endpoint = '/v1/dashboard/magic_oauth/app/delete';

  const body: DeleteOAuthAppBody = { oauth_app_id, magic_client_id };

  return Post<DeleteOAuthAppBody, DeleteOAuthAppResponse>(endpoint, body);
}

// -------------------------------------------------------------------------- //

interface OAuthClientMetadata {
  kid: string;
  team_id: string;
}

export interface OAuthClientInfo {
  app_id: string;
  app_secret: string;
  provider_name: string;
  oauth_app_id: string;
  oauth_redirect_id: string;
  app_metadata?: OAuthClientMetadata;
  login_experience?: string;
}

interface GetOAuthAppsResponse extends FortmaticAPIResponse<OAuthClientInfo[]> {}

export async function getOAuthApps(magic_client_id: string) {
  const endpoint = `/v1/dashboard/magic_oauth/app/get?magic_client_id=${encodeURIComponent(magic_client_id)}`;

  return Get<GetOAuthAppsResponse>(endpoint);
}
