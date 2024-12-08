import { Get, Post } from '@services/http/magic-rest';

export type SessionConfiguration = {
  session_duration_m?: number;
  refresh_token_duration_m: number;
  is_auto_refresh_session_enabled: boolean;
};

export async function getSessionConfiguration(magic_client_id: string) {
  const endpoint = `/v1/dashboard/magic_client/session_configuration?magic_client_id=${magic_client_id}`;
  return (await Get(endpoint)).data as SessionConfiguration;
}

export async function updateSessionConfiguration(magic_client_id: string, config: SessionConfiguration) {
  const endpoint = '/v1/dashboard/magic_client/session_configuration';
  const body = { magic_client_id, ...config };
  return (await Post(endpoint, body)).data;
}
